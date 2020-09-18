import { workspace, window } from 'vscode';
import * as jsyaml from 'js-yaml';

import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { serviceImports } from './service_constants';
import { mapper_code_method_template } from './mapper_constants';
import { classTemplate, simple_method_template } from './common_constants';
import { ClassConnectionsCreate } from './ClassConnectionsCreate';
import { ClassConnectionsEdit } from './ClassConnectionsEdit';
import { hasConfigItems, toValidIdentifier, capitalize } from '../qorus_utils';
import { default_lang } from '../qorus_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class InterfaceWithMethodsCreator extends InterfaceCreator {
    private method_template: string;
    private imports: string[] = [];

    editImpl = params => {
        const {
            data,
            orig_data,
            edit_type,
            iface_id,
            iface_kind,
            open_file_on_success,
            no_data_return,
            request_id,
        } = params;

        this.lang = data.lang || default_lang;

        let suffix: string;
        let methods_key: string;
        switch (iface_kind) {
            case 'service':
                suffix = '.qsd';
                methods_key = 'methods';
                this.method_template = simple_method_template[this.lang];
                this.imports = serviceImports(this.lang, data['base-class-name']);
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
                this.method_template = mapper_code_method_template[this.lang];
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'InterfaceWithMethodsCreator'}`);
                return;
        }

        this.has_code = this.had_code = true;

        const methods = data[methods_key];

        this.setPaths(data, orig_data, suffix, iface_kind);

        let {ok, message} = this.checkData(params);
        if (!ok) {
            qorus_webview.postMessage({
                action: `creator-${edit_type}-interface-complete`,
                request_id,
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
                contents = this.code(data, iface_kind, methods);
                info = t`2FilesCreatedInDir ${this.rel_file_path} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                const orig_method_names: string[] = (orig_data[methods_key] || []).map(method => method.name);
                const method_renaming_map = this.methodRenamingMap(orig_method_names, methods);

                code_lines = this.file_edit_info.text_lines;
                if (method_renaming_map.added.length) {
                    code_lines = this.addMethods(code_lines, method_renaming_map.added);
                }
                code_lines = this.renameClassAndBaseClass(code_lines, orig_data, data);
                code_lines = this.renameMethods(code_lines, method_renaming_map.renamed);
                code_lines = this.removeMethods(code_lines, method_renaming_map.removed);
                code_lines = this.updateImports(code_lines, [...this.imports]);
                contents = code_lines.join('\n');
                break;
            case 'delete-method':
                if (typeof(data.method_index) === 'undefined') {
                    break;
                }
                const method_name = methods[data.method_index].name;
                code_lines = this.removeMethods(this.file_edit_info.text_lines, [method_name]);
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
            code: this.rel_file_path
        }, iface_id);

        headers += InterfaceWithMethodsCreator.createMethodHeaders(methods);

        ({ ok, message } = this.writeFiles(contents, headers));
        if (!ok) {
            qorus_webview.postMessage({
                action: `creator-${edit_type}-interface-complete`,
                request_id,
                ok: false,
                message
            });
            return;
        }

        if (edit_type !== 'create') {
            new ClassConnectionsEdit().doChanges(this.file_path, this.code_info, data, orig_data, iface_kind, this.imports);
        }
        if (open_file_on_success) {
            workspace.openTextDocument(this.file_path).then(doc => window.showTextDocument(doc));
        }

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

        this.deleteOrigFilesIfDifferent();
        if (hasConfigItems(iface_kind)) {
            this.code_info.interface_info.setOrigConfigItems({iface_id}, edit_type === 'edit');
        }

        if (!no_data_return) {
            this.returnData({
                ...jsyaml.safeLoad(headers),
                target_dir: this.target_dir,
                target_file: this.rel_file_path,
            }, iface_id);
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
            const range = this.file_edit_info.method_name_ranges[name];
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
        return InterfaceCreator.removeClassMethods(
            [ ...lines ],
            removed,
            this.file_edit_info.method_decl_ranges
        );
    }

    private addMethods(lines: string[], added: string[]): string[] {
        return InterfaceCreator.addClassMethods(
            [ ...lines ],
            added,
            this.file_edit_info.class_def_range,
            this.method_template,
            this.lang
        );
    }

    deleteMethod(data: any, iface_kind) {
        const {methods: service_methods, 'mapper-methods': mapper_code_methods, method_index} = data;

        let methods;
        switch (iface_kind) {
            case 'service':
                methods = service_methods;
                break;
            case 'mapper-code':
                methods = mapper_code_methods;
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'InterfaceWithMethodsCreator'}`);
                return;
        }

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
                orig_data: data,
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
        if (Object.keys(data['class-connections'] || {}).length) {
            InterfaceWithMethodsCreator.fixClassConnections(data);
            ({connections_within_class, connections_extra_class, triggers, imports = []}
                 = new ClassConnectionsCreate({...data, iface_kind}, this.code_info, this.lang).code());
            method_objects = method_objects.filter(method_object => !triggers.includes(method_object.name));
            both_connections_and_methods = !!method_objects.length;
        }

        let method_strings = [];
        for (let method of method_objects) {
            method_strings.push(InterfaceCreator.fillTemplate(
                this.method_template,
                this.lang,
                undefined,
                { name: method.name },
                false
            ));
        }
        let methods = method_strings.join('\n');
        if (both_connections_and_methods) {
            methods += '\n';
        }

        const template = classTemplate(this.lang, !!data['base-class-name'], !methods && !connections_within_class);
        return InterfaceCreator.fillTemplate(template, this.lang, [...this.imports, ...imports], {
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

export const interface_with_methods_creator = new InterfaceWithMethodsCreator();
