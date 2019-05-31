import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, suffix, comment_chars } from './creator_common';
import { service_template, service_fields, defaultServiceHeaders } from './service_code';
import { job_template, defaultJobHeaders, default_job_parse_options } from './job_code';


class InterfaceCreator {

    getFields(iface_kind: string): any {
         switch (iface_kind) {
            case 'service': return service_fields; break;
         }
    }

    createInterface(data: any) {
        const {iface_kind, ...other_data} = data;
        switch (iface_kind) {
            case 'service': this.createService(other_data); break;
            case 'job': this.createJob(other_data); break;
        }
    }

    private createService(data: any) {
        const {lang = 'qore', ...other_data} = data;
        const {headers, code, target_path} = this.headersAndCode(
            lang,
            other_data,
            `${other_data.service}-${other_data.serviceversion}.qsd${suffix[lang]}`,
            defaultServiceHeaders(other_data),
            service_template[lang]
        );

        fs.writeFileSync(
            target_path,
            headers + `${comment_chars[lang]} ENDSERVICE\n\n` + code
        );
    }

    private createJob(data: any) {
        const {lang = 'qore', ...other_data} = data;
        const {headers, code, target_path} = this.headersAndCode(
            lang,
            other_data,
            `${other_data.name}-${other_data.version}.qjob${suffix[lang]}`,
            defaultJobHeaders(other_data),
            job_template[lang]
        );

        fs.writeFileSync(
            target_path,
            headers + (lang === 'qore' ? default_job_parse_options : '') + '\n'
                    + code + comment_chars[lang] + ' END\n'
        );
    }

    private headersAndCode(lang, data, default_file_name, default_header_vars, template): any {
        const {
            target_dir,
            target_file = default_file_name,
            class_name,
            base_class_name,
            ...header_vars
        } = data;

        const headers = createHeaders(
            Object.assign({}, header_vars, default_header_vars, header_vars),
            lang
        );
        const code = fillTemplate(template, {class_name, base_class_name});

        const target_path = path.join(target_dir, target_file);

        return {headers, code, target_path};
    }
}


export const creator = new InterfaceCreator();
