import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, suffix, comment_chars, default_parse_options } from './creator_common';
import { service_template, serviceFields, service_methods,
         defaultOldServiceHeaders, createOldServiceHeaders } from './service_code';


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
                this.createServiceOldFormat(data);
                break;
        }
    }

    private createService(data: any) {
        const {target_dir, target_file, class_name, base_class_name, ...header_vars} = data;

        const target_file_base = target_file
            ? path.basename(target_file, '.qsd')
            : `${data.service}-${data.serviceversion}`;

        const file_name = `${target_file_base}.qsd${suffix[data.lang]}`;

        const headers_begin = {type: 'service'};
        const headers_end = {
            servicetype: 'USER',
            code: file_name
        };

        const headers = createHeaders(Object.assign(headers_begin, header_vars, headers_end));
        const code = fillTemplate(service_template[data.lang], {class_name, base_class_name});

        fs.writeFileSync(
            path.join(target_dir, `${target_file_base}.yaml`),
            headers
        );

        fs.writeFileSync(
            path.join(target_dir, file_name),
            (data.lang === 'qore' ? default_parse_options + '\n' : '') + code
        );
    }

    private createServiceOldFormat(data: any) {
        const {lang = 'qore', target_dir, target_file, ...other_data} = data;

        const target_file_base = target_file
            ? path.basename(target_file, '.qsd')
            : `${data.service}-${data.serviceversion}`;

        const default_header_vars = defaultOldServiceHeaders(other_data);

        const {class_name, base_class_name, ... header_vars} = other_data;

        const headers = createOldServiceHeaders(
            Object.assign({}, header_vars, default_header_vars, header_vars),
            lang);

        const code = fillTemplate(service_template[lang], {class_name, base_class_name});

        fs.writeFileSync(
            path.join(target_dir, `${target_file_base}.old.qsd`),
            headers + `${comment_chars[lang]} ENDSERVICE\n\n` + code
        );
    }
}


export const creator = new InterfaceCreator();
