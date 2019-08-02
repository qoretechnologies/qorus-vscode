import { workspace, window } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { qorus_webview } from '../QorusWebview';
import { projects } from '../QorusProject';
import { fillTemplate, createHeaders, createMethodHeaders, suffix, default_parse_options, } from './creator_common';
import { service_class_template, service_method_template, serviceFields,
         service_methods, default_service_methods, } from './service_code';
import { jobFields } from './job_code';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class InterfaceCreator {
    getFields(iface_kind: string, default_target_dir?: string): any[] {
        switch (iface_kind) {
            case 'service':
                return serviceFields(default_target_dir);
            case 'service-methods':
                return service_methods;
            case 'job':
                return jobFields(default_target_dir);
            default:
                return [];
        }
    }

    createInterface(iface_kind: string, data: any) {
        switch (iface_kind) {
            case 'service':
                this.createService(data);
                break;
        }
    }

    private createService(data: any) {
        if (!data.methods || !data.methods.length) {
            data.methods = default_service_methods;
        }

        const { target_dir, target_file, ...other_data } = data;

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

        const { code, header_data } = this.serviceCode(other_data);
        const headers = createHeaders(Object.assign(headers_begin, header_data, headers_end));

        let is_error = false;

        const write_params = [
            {
                file: file_path,
                data: (data.lang === 'qore' ? default_parse_options + '\n' : '') + code,
                open: true,
            },
            {
                file: yaml_file_path,
                data: headers + createMethodHeaders(data.methods),
                update_yaml_info: true,
            },
        ];

        const code_info = projects.currentProjectCodeInfo();

        for (let params of write_params) {
            fs.writeFile(params.file, params.data, err => {
                if (err) {
                    msg.error(t`WriteFileError ${params.file} ${err.toString()}`);
                    is_error = true;
                    return;
                }
                if (params.open) {
                    workspace.openTextDocument(params.file).then(doc => window.showTextDocument(doc));
                }
                if (params.update_yaml_info && code_info) {
                    code_info.addSingleYamlInfo(params.file);
                }
            });
        }

        if (!is_error) {
            msg.info(t`2FilesCreatedInDir ${file_name} ${yaml_file_name} ${target_dir}`);

            const initial_data = qorus_webview.opening_data;
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
    }

    private serviceCode(data: any): any {
        const { methods: method_objects, ...header_data } = data;

        let method_strings = [];
        for (let method of method_objects) {
            method_strings.push(fillTemplate(service_method_template[data.lang], { name: method.name }));
        }
        const methods = method_strings.join('\n');

        return {
            code: fillTemplate(service_class_template[data.lang], {
                class_name: data.class_name,
                base_class_name: data.base_class_name,
                methods
            }),
            header_data
        };
    }
}

export const creator = new InterfaceCreator();
