import { workspace, window } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, createMethodHeaders, suffix,
         comment_chars, default_parse_options, } from './creator_common';
import { service_class_template, service_method_template, serviceFields, service_methods,
         defaultOldServiceHeaders, createOldServiceHeaders, default_service_methods, } from './service_code';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class InterfaceCreator {
    getFields(iface_kind: string, default_target_dir?: string): any {
        switch (iface_kind) {
            case 'service':
                return serviceFields(default_target_dir || '');
            case 'service-methods':
                return service_methods;
        }
    }

    createInterface(iface_kind: string, data: any) {
        switch (iface_kind) {
            case 'service':
                this.createService(data);
//                this.createServiceOldFormat(data);
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
            : `${data.service}-${data.serviceversion}`;

        const file_name = `${target_file_base}.qsd${suffix[data.lang]}`;
        const yaml_file_name = `${target_file_base}.yaml`;

        const headers_begin = { type: 'service' };
        const headers_end = {
            servicetype: 'USER',
            code: file_name,
        };

        const { code, remaining_data: header_vars } = this.serviceCode(other_data);
        const headers = createHeaders(Object.assign(headers_begin, header_vars, headers_end));

        let is_error = false;

        const write_params = [
            {
                file: path.join(target_dir, file_name),
                data: (data.lang === 'qore' ? default_parse_options + '\n' : '') + code,
                open: true,
            },
            {
                file: path.join(target_dir, `${yaml_file_name}`),
                data: headers + createMethodHeaders(data.methods),
            },
        ];

        for (let params of write_params) {
            fs.writeFile(params.file, params.data, err => {
                if (err) {
                    msg.error(t`WriteFileError ${ params.file } ${ err.toString() }`);
                    is_error = true;
                    return;
                }
                if (params.open) {
                    workspace.openTextDocument(params.file).then(doc => window.showTextDocument(doc));
                }
            });
        }

        if (!is_error) {
            msg.info(t`2FilesCreatedInDir ${file_name} ${yaml_file_name} ${target_dir}`);
        }
    }
/*
    private createServiceOldFormat(data: any) {
        const { target_dir, target_file, ...other_data } = data;

        const target_file_base = target_file ? path.basename(target_file, '.qsd') : `${data.name}-${data.service}`;

        const default_header_vars = defaultOldServiceHeaders(other_data);

        const { code, remaining_data: header_vars } = this.serviceCode(other_data);
        const headers = createOldServiceHeaders(
            Object.assign({}, header_vars, default_header_vars, header_vars),
            data.lang
        );

        fs.writeFileSync(
            path.join(target_dir, `${target_file_base}.old.qsd${suffix[data.lang]}`),
            headers + `${comment_chars[data.lang]} ENDSERVICE\n\n` + code
        );
    }
*/
    private serviceCode(data: any): any {
        const { lang, class_name, base_class_name, methods: method_objects, ...other_data } = data;

        let method_strings = [];
        for (let method of method_objects) {
            method_strings.push(fillTemplate(service_method_template[lang], { name: method.name }));
        }
        const methods = method_strings.join('\n');

        return {
            code: fillTemplate(service_class_template[lang], { class_name, base_class_name, methods }),
            remaining_data: other_data,
        };
    }
}

export const creator = new InterfaceCreator();
