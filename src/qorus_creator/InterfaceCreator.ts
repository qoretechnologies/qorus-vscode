import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, suffix, comment_chars, default_parse_options } from './creator_common';
import { service_template, serviceFields, defaultServiceHeaders } from './service_code';
import { job_template, defaultJobHeaders } from './job_code';


class InterfaceCreator {

    getFields(iface_kind: string, default_target_dir: string): any {
        switch (iface_kind) {
            case 'service':
                return serviceFields(default_target_dir);
        }
    }

    createInterface(iface_kind: string, data: any) {
        switch (iface_kind) {
            case 'service':
                this.createService(data);
                this.createServiceOldFormat(data);
                break;
            case 'job':
                this.createJobOldFormat(data);
                break;
        }
    }

    private createService(data: any) {
        const { target_dir, target_file, class_name, base_class_name, ...header_vars } = data;

        const target_file_base = target_file
            ? path.basename(target_file, '.qsd')
            : `${data.service}-${data.serviceversion}`;

        const file_name = `${target_file_base}.qsd${suffix[data.lang]}`;

        const headers = createHeaders(Object.assign({type: 'service'}, header_vars, {code: file_name}), data.lang);
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

        const {headers, code} = this.codeParts(
            lang,
            other_data,
            defaultServiceHeaders(other_data),
            service_template[lang],
            true
        );

        fs.writeFileSync(
            path.join(target_dir, `${target_file_base}.old.qsd`),
            headers + `${comment_chars[lang]} ENDSERVICE\n\n` + code
        );
    }

    private createJobOldFormat(data: any) {
        const {lang = 'qore', target_dir, target_file: possible_target_file, ...other_data} = data;
        const target_file = possible_target_file
            || `${other_data.name}-${other_data.version}.old.qjob${suffix[lang]}`;

        const {headers, code} = this.codeParts(
            lang,
            other_data,
            defaultJobHeaders(other_data),
            job_template[lang],
            true
        );

        fs.writeFileSync(
            path.join(target_dir, target_file),
            headers + (lang === 'qore' ? default_parse_options : '') + '\n'
                    + code + comment_chars[lang] + ' END\n'
        );
    }

    private codeParts(lang: string, data: any, default_header_vars: any, template: string, old_format = false): any {
        const { class_name, base_class_name, ...header_vars } = data;

        const headers = createHeaders(
            Object.assign({}, header_vars, default_header_vars, header_vars),
            lang,
            old_format
        );
        const code = fillTemplate(template, {class_name, base_class_name});

        return {headers, code};
    }
}


export const creator = new InterfaceCreator();
