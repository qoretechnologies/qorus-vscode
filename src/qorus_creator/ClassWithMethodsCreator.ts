import { window, Position } from 'vscode';
import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { serviceTemplates } from './service_constants';
import { mapperCodeTemplates } from './mapper_constants';
import { ClassConnections } from './ClassConnections';
import { hasConfigItems, toValidIdentifier, capitalize } from '../qorus_utils';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassWithMethodsCreator extends InterfaceCreator {
    private class_template: string;
    private method_template: string;
    private imports: string[];

    editImpl = params => {
        const {data, orig_data, edit_type, iface_id, iface_kind, open_file_on_success, request_id} = params;
        this.lang = data.lang || 'qore';

        let suffix: string;
        let methods_key: string;
        switch (iface_kind) {
            case 'service':
                suffix = '.qsd';
                methods_key = 'methods';
                ({
                    template: this.class_template,
                    method_template: this.method_template,
                    imports: this.imports
                 } = serviceTemplates(this.lang));
                if (!(data.methods || []).length) {
                    data.methods = [{
                        name: 'init',
                        desc: t`DefaultInitMethodDesc`,
                    }];
                }
                break;
            case 'mapper-code':
                data.name = data['class-name'] = toValidIdentifier(data['class-class-name'], true);
                suffix = '.qmc';
                methods_key = 'mapper-methods';
                ({
                    template: this.class_template,
                    method_template: this.method_template,
                 } = mapperCodeTemplates(this.lang));
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'ClassWithMethodsCreator'}`);
                return;
        }

        this.has_code = this.had_code = true;

        this.imports = this.imports || [];
        const methods = data[methods_key];

        this.setPaths(data, orig_data, suffix);

        const {ok, message} = this.checkData(params);
        if (!ok) {
            qorus_webview.postMessage({
                action: `creator-${params.edit_type}-interface-complete`,
                request_id: params.request_id,
                ok,
                message
            });
            return;
        }

        let contents: string;
        let info: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'create':
            case 'recreate':
                contents = this.code(data, iface_kind, methods);
                info = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                const orig_method_names: string[] = (orig_data[methods_key] || []).map(method => method.name);
                const method_renaming_map = this.methodRenamingMap(orig_method_names, methods);

                code_lines = this.edit_info.text_lines;
                code_lines = this.addMethods([...code_lines], method_renaming_map.added);
                code_lines = this.renameClassAndBaseClass(code_lines, orig_data, data);
                code_lines = this.renameMethods(code_lines, method_renaming_map.renamed);
                code_lines = this.removeMethods(code_lines, method_renaming_map.removed);
                contents = code_lines.join('\n');
                break;
            case 'delete-method':
                if (typeof(data.method_index) === 'undefined') {
                    break;
                }
                const method_name = methods[data.method_index].name;
                code_lines = this.removeMethods(this.edit_info.text_lines, [method_name]);
                contents = code_lines.join('\n');
                if (iface_kind === 'service') {
                    info = t`ServiceMethodHasBeenDeleted ${method_name}`;
                } else {
                    info = t`MapperCodeMethodHasBeenDeleted ${method_name}`;
                }

                data[methods_key].splice(data.method_index, 1);

                data.active_method = data[methods_key].length - 1;

                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        let headers = this.createHeaders({
            type: iface_kind,
            ...data,
            servicetype: iface_kind === 'service' ? 'USER' : undefined,
            code: this.file_name
        });

        const iface_data = this.code_info.interface_info.getInfo(iface_id);
        if (iface_data && iface_data['config-items'] && iface_data['config-items'].length) {
            headers += ClassWithMethodsCreator.createConfigItemHeaders(iface_data['config-items']);
        }

        this.writeFiles(contents, headers + ClassWithMethodsCreator.createMethodHeaders(methods), open_file_on_success);

        if (['create', 'edit'].includes(edit_type)) {
            qorus_webview.postMessage({
                action: `creator-${edit_type}-interface-complete`,
                request_id,
                ok: true,
                message: t`IfaceSavedSuccessfully ${capitalize(iface_kind)} ${data.name}`
            });
        }

        if (info) {
            msg.info(info);
        }

        delete data.method_index;
        delete data.servicetype;
        delete data.yaml_file;
        qorus_webview.opening_data = {
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: data
        };

        this.deleteOrigFilesIfDifferent();
        if (hasConfigItems(iface_kind)) {
            this.code_info.interface_info.setOrigConfigItems(iface_id, edit_type === 'edit');
        }
    }

    private methodRenamingMap(orig_names: string[], new_methods: any[]): any {
        let mapping: any = {
            added: [],
            removed: [],
            unchanged: [],
            renamed: {}
        };
        let names = {};
        for (let method of new_methods) {
            names[method.name] = true;

            if (method.name === method.orig_name) {
                mapping.unchanged.push(method.name);
            }
            else {
                if (method.orig_name) {
                    mapping.renamed[method.orig_name] = method.name;
                }
                else {
                    mapping.added.push(method.name);
                }
            }
        }

        for (let name of orig_names) {
            if (name && !names[name] && !mapping.renamed[name]) {
                mapping.removed.push(name);
            }
        }

        return mapping;
    }

    private renameMethods(lines: string[], renaming: any): string[] {
        let lines_with_renaming = {};
        for (const name of Object.keys(renaming)) {
            const range = this.edit_info.method_name_ranges[name];
            if (!lines_with_renaming[range.start.line]) {
                lines_with_renaming[range.start.line] = {};
            }
            lines_with_renaming[range.start.line][range.start.character] = name;
        }

        let n = -1;
        return lines.map(line => {
            if (!lines_with_renaming[++n]) {
                return line;
            }

            for (const start of Object.keys(lines_with_renaming[n]).map(key => parseInt(key)).sort((a: any, b: any) => b - a)) {
                const name = lines_with_renaming[n][start];
                let chars = line.split('');
                chars.splice(start, name.length, renaming[name]);
                line = chars.join('');
            }
            return line;
        });
    }

    private removeMethods(lines: string[], removed: string[]): string[] {
        const removeRange = (lines, range) => {
            let rows = [];
            for (let i = 0; i < range.start.line; i++) {
                rows.push(lines[i]);
            }
            rows.push(lines[range.start.line].substr(0, range.start.character));
            for (let i = range.end.line + 1; i < lines.length; i++) {
                rows.push(lines[i]);
            }
            return rows;
        };

        let rangesToRemove = removed.map(name => this.edit_info.method_decl_ranges[name]);
        while (rangesToRemove.length) {
            lines = removeRange(lines, rangesToRemove.pop());
        }
        return lines;
    }

    private addMethods(lines: string[], added: string[]): string[] {
        const end: Position = this.edit_info.class_def_range.end;

        const lines_before = lines.splice(0, end.line);
        const line = lines.splice(0, 1)[0];
        const line_before = line.substr(0, end.character - 1);
        const line_after = line.substr(end.character - 1);
        const lines_after = lines;

        let new_code = line_before;
        for (let name of added) {
            new_code += '\n' + this.fillTemplate(this.method_template, undefined, { name }, false);
        }
        const new_code_lines = new_code.split(/\r?\n/);
        if (new_code_lines[new_code_lines.length - 1] === '') {
            new_code_lines.pop();
        }

        return [
            ...lines_before,
            ...new_code_lines,
            line_after,
            ...lines_after
        ];
    }

    deleteMethod(data: any, iface_kind) {
        const {methods, method_index} = data;
        if ((methods || []).length < 2) {
            if (iface_kind === 'service') {
                msg.error(t`CannotDeleteTheOnlyOneServiceMethod`);
            } else {
                msg.error(t`CannotDeleteTheOnlyOneMapperCodeMethod`);
            }
            return;
        }

        const deleted_method = methods && methods[method_index];
        if (!deleted_method) {
            msg.error(t`InvalidDeletedMethodIndex`);
            return;
        }

        window.showInformationMessage(
            t`ConfirmDeleteMethod ${deleted_method.name}`,
            t`ButtonDelete`,
            t`ButtonCancel`
        ).then(selection => {
            if (selection === t`ButtonCancel`) {
                return;
            }

            this.edit({
                data,
                iface_kind,
                edit_type: 'delete-method',
                orig_data: undefined,
                open_file_on_success : false
            });
        });
    }

    private code = (data: any, iface_kind: string, method_objects: any[] = []): any => {
        let triggers: string[] = [];
        let imports: string[] = [];
        let connections_within_class: string = '';
        let connections_extra_class: string = '';
        let both_connections_and_methods = false;
        if (data['class-connections']) {
            ClassWithMethodsCreator.fixClassConnections(data);
            ({connections_within_class, connections_extra_class, triggers, imports = []}
                 = new ClassConnections({...data, iface_kind}, this.code_info, this.lang).code());
            method_objects = method_objects.filter(method_object => !triggers.includes(method_object.name));
            both_connections_and_methods = !!method_objects.length;
        }

        let method_strings = [];
        for (let method of method_objects) {
            method_strings.push(this.fillTemplate(this.method_template, undefined, { name: method.name }, false));
        }
        let methods = method_strings.join('\n');
        if (both_connections_and_methods) {
            methods += '\n';
        }

        return this.fillTemplate(this.class_template, [...this.imports, ...imports], {
            class_name: data['class-name'],
            base_class_name: data['base-class-name'],
            methods,
            connections_within_class,
            connections_extra_class
        });
    }

    protected static createMethodHeaders = (methods: any[] = []): string => {
        const list_indent = '  - ';
        const indent = '    ';
        let result: string = 'methods:\n';

        for (let method of methods) {
            result += `${list_indent}name: ${method.name}\n`;
            for (let tag in method) {
                switch (tag) {
                    case 'name':
                    case 'orig_name':
                        break;
                    case 'author':
                        result += `${indent}author:\n`;
                        for (let author of method.author) {
                            result += `${indent}${list_indent}${author.name}\n`;
                        }
                        break;
                    default:
                        result += `${indent}${tag}: ${method[tag]}\n`;
                }
            }
        }

        return result;
    }
}

export const class_with_methods_creator = new ClassWithMethodsCreator();
