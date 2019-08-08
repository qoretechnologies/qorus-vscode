import { workspace, window, Position } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { qorus_webview } from '../QorusWebview';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { fillTemplate, createHeaders, createMethodHeaders, suffix, default_parse_options, } from './creator_common';
import { service_class_template, service_method_template, default_service_methods, } from './service_code';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ServiceCreator {

    edit(data: any, edit_type: string) {
        if (!data.methods || !data.methods.length) {
            data.methods = default_service_methods;
        }

        const { target_dir, target_file, methods, ...header_data } = data;

        const target_file_base = target_file
            ? path.basename(target_file, '.qsd')
            : `${data.name}-${data.version}`;

        const file_name = `${target_file_base}.qsd${suffix[data.lang]}`;
        const yaml_file_name = `${target_file_base}.yaml`;

        const file_path = path.join(target_dir, file_name);
        const yaml_file_path = path.join(target_dir, yaml_file_name);

        const headers_begin = { type: 'service' };
        const headers_end = {
            servicetype: 'USER',
            code: file_name,
        };

        const headers = createHeaders(Object.assign(headers_begin, header_data, headers_end));

        const code_info: QorusProjectCodeInfo = projects.currentProjectCodeInfo();
        const service_info = code_info.serviceInfo(file_path);

        const initial_data = qorus_webview.opening_data;

        let contents: string;
        let message: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'edit':
                if (!initial_data.service) {
                    msg.error(t`MissingEditData`);
                    return;
                }
                const initial_methods: string[] = (initial_data.service.methods || []).map(method => method.name);
                const method_renaming_map = this.methodRenamingMap(initial_methods, methods);
                code_lines = service_info.text_lines;
                code_lines = this.renameClassAndBaseClass(code_lines, service_info, initial_data, header_data);
                code_lines = this.renameServiceMethods(code_lines, service_info, method_renaming_map.renamed);
                code_lines = this.removeServiceMethods(code_lines, service_info, method_renaming_map.removed);
                contents = this.addServiceMethods(code_lines, data.lang, method_renaming_map.added);
                break;
            case 'create':
                const code = this.code(data, methods);
                contents = (data.lang === 'qore' ? default_parse_options + '\n' : '') + code;
                message = t`2FilesCreatedInDir ${file_name} ${yaml_file_name} ${target_dir}`;
                break;
            case 'delete':
                if (typeof(data.method_index) === 'undefined') {
                    break;
                }
                const method_name = methods[data.method_index].name;
                code_lines = this.removeServiceMethods(service_info.text_lines, service_info, [method_name]);
                contents = code_lines.join('\n') + '\n';
                message = t`ServiceMethodHasBeenDeleted ${method_name}`;

                data.methods.splice(data.method_index, 1);

                data.active_method = data.methods.length - 1;
                delete data.method_index;
                delete data.servicetype;
                delete data.yaml_file;

                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        fs.writeFile(file_path, contents, err => {
            if (err) {
                msg.error(t`WriteFileError ${file_path} ${err.toString()}`);
                return;
            }
            workspace.openTextDocument(file_path).then(doc => window.showTextDocument(doc));
        });

        fs.writeFile(yaml_file_path, headers + createMethodHeaders(data.methods), err => {
            if (err) {
                msg.error(t`WriteFileError ${yaml_file_path} ${err.toString()}`);
                return;
            }
            code_info.addSingleYamlInfo(yaml_file_path);
        });

        if (message) {
            msg.info(message);
        }

        qorus_webview.opening_data = data;

        if (initial_data.service && initial_data.service.target_dir && initial_data.service.target_file) {
            const orig_file = path.join(initial_data.service.target_dir, initial_data.service.target_file);

            if (orig_file === file_path) {
                return;
            }

            const yaml_info = code_info.yaml_info_by_file[orig_file];
            const orig_yaml_file = yaml_info && yaml_info.yaml_file;

            for (const file of [orig_file, orig_yaml_file]) {
                if (!file) {
                    continue;
                }
                fs.unlink(file, err => {
                    if (err) {
                        msg.error(t`RemoveFileError ${file} ${err.toString()}`);
                    }
                    else {
                        msg.info(t`OrigFileRemoved ${file}`);
                    }
                });
            }
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

    private renameClassAndBaseClass(lines: string[], service_info: any, initial_data: any, header_data): string[] {
        const {
            class_name: orig_class_name,
            base_class_name: orig_base_class_name
        } = initial_data.service;
        const { class_name, base_class_name } = header_data;

        const replace = (position: Position, orig_name: string, name: string) => {
            let chars = lines[position.line].split('');
            chars.splice(position.character, orig_name.length, name);
            lines[position.line] = chars.join('');
        }

        if (base_class_name !== orig_base_class_name) {
            replace(service_info.base_class_name_range.start, orig_base_class_name, base_class_name);
        }
        if (class_name !== orig_class_name) {
            replace(service_info.class_name_range.start, orig_class_name, class_name);
        }
        return lines;
    }

    private renameServiceMethods(lines: string[], service_info: any, renaming: any): string[] {
        let lines_with_renaming = {};
        for (const name of Object.keys(renaming)) {
            const range = service_info.method_name_ranges[name];
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

    private removeServiceMethods(lines: string[], service_info: any, removed: string[]): string[] {
        const removeRange = (lines, range) => {
            let rows = [];
            for (let i = 0; i < range.start.line; i++) {
                rows.push(lines[i]);
            }
            rows.push(lines[range.start.line].substr(0, range.start.character));
//            rows.push(lines[range.end.line].substr(range.end.character).trim());
            for (let i = range.end.line + 1; i < lines.length; i++) {
                rows.push(lines[i]);
            }
            return rows;
        }

        let rangesToRemove = removed.map(name => service_info.method_decl_ranges[name]);
        while (rangesToRemove.length) {
            lines = removeRange(lines, rangesToRemove.pop())
        }
        return lines;
    }

    private addServiceMethods(lines: string[], lang: string, added: string[]): string {
        while (lines[lines.length - 1].trim() === '') {
            lines.pop();
        }
        let code = lines.splice(0, lines.length - 1).join('\n') + '\n';
        for (let name of added) {
            code += '\n' + fillTemplate(service_method_template[lang], { name });
        }
        code += lines[0] + '\n';
        return code;
    }

    deleteMethod(data: any) {
        if (!data.methods || data.methods.length < 2) {
            msg.error(t`CannotDeleteTheOnlyOneServiceMethod`);
            return;
        }

        const deleted_method = data.methods && data.methods[data.method_index];
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

            this.edit(data, 'delete');
        });
    }

    private code(data: any, method_objects: any[]): any {
        let method_strings = [];
        for (let method of method_objects) {
            method_strings.push(fillTemplate(service_method_template[data.lang], { name: method.name }));
        }
        const methods = method_strings.join('\n');

        return fillTemplate(service_class_template[data.lang], {
            class_name: data.class_name,
            base_class_name: data.base_class_name,
            methods
        });
    }
}

export const service_creator = new ServiceCreator();
