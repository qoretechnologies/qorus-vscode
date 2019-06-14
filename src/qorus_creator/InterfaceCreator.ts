import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, suffix, comment_chars, default_parse_options } from './creator_common';
import { service_template, service_fields, defaultServiceHeaders } from './service_code';
import { job_template, defaultJobHeaders } from './job_code';


class InterfaceCreator {

    getFields(iface_kind: string): any {
         switch (iface_kind) {
            case 'service': return service_fields; break;
         }
    }

    createInterface(data: any) {
        const {iface_kind, ...other_data} = data;
        switch (iface_kind) {
            case 'service':
                this.createService(other_data);
                this.createServiceOldFormat(other_data);
                break;
            case 'job':
                this.createJobOldFormat(other_data);
                break;
        }
    }

    private createService(data: any) {
        const {lang = 'qore', target_dir, possible_target_file, ...other_data} = data;
        const target_file_base = possible_target_file
            ? path.basename(possible_target_file, '.qsd')
            : `${other_data.service}-${other_data.serviceversion}`;

        const file_name = `${target_file_base}.qsd${suffix[lang]}`;

        const {headers, code} = this.codeParts(
            lang,
            other_data,
            {type: 'service', code: file_name},
            service_template[lang]
        );

        fs.writeFileSync(
            path.join(target_dir, `${target_file_base}.yaml`),
            headers
        );

        fs.writeFileSync(
            path.join(target_dir, file_name),
            (lang === 'qore' ? default_parse_options + '\n' : '') + code
        );
    }

    private createServiceOldFormat(data: any) {
        const {lang = 'qore', target_dir, possible_target_file, ...other_data} = data;
        const target_file = possible_target_file
            || `${other_data.service}-${other_data.serviceversion}.old.qsd${suffix[lang]}`;

        const {headers, code} = this.codeParts(
            lang,
            other_data,
            defaultServiceHeaders(other_data),
            service_template[lang],
            true
        );

        fs.writeFileSync(
            path.join(target_dir, target_file),
            headers + `${comment_chars[lang]} ENDSERVICE\n\n` + code
        );
    }

    private createJobOldFormat(data: any) {
        const {lang = 'qore', target_dir, possible_target_file, ...other_data} = data;
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
