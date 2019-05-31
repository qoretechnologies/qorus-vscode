import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { fillTemplate, createHeaders, suffix, comment_chars } from './creator_common';
import { service_template, service_fields, defaultServiceHeaders } from './service_code';
import { job_template, defaultJobHeaders, default_job_parse_options } from './job_code';


class InterfaceCreator {

    getProjectObjects(object_type: string, webview: vscode.Webview): any[] {
        let objects: any[] = [];
        switch (object_type) {
            case 'base-class': objects = this.getBaseClasses(); break;
            case 'function': objects = this.getFunctions(); break;
            case 'class': objects = this.getClasses(); break;
            case 'constant': objects = this.getConstants(); break;
            case 'mapper': objects = this.getMappers(); break;
            case 'value-map': objects = this.getVMaps(); break;
            case 'author': objects = this.getAuthors(); break;
            default: objects = [];
        }

        if (webview) {
            webview.postMessage({
                action: 'creator-return-objects',
                object_type,
                objects,
            });
        }

        return objects;
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

     getFields(iface_kind: string): any {
         switch (iface_kind) {
            case 'service': return service_fields; break;
         }
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

    private getFunctions() {
        return [
            {
                name: 'uk-lib-common',
                desc: 'description of uk-lib-common',
            },
            {
                name: 'uk-lib-archive',
                desc: 'description of uk-lib-archive',
            },
            {
                name: 'uk-lib-audit_tracker',
                desc: 'description of uk-lib-audit_tracker',
            },
            {
                name: 'uk-lib-sftp',
                desc: 'description of uk-lib-sftp',
            },
            {
                name: 'uk-validation-gen-transactional_info',
                desc: 'description of uk-validation-gen-transactional_info',
            }
        ];
    }

    private getClasses() {
        return [
            {
                name: 'RebusHttpHandler',
                desc: 'description of RebusHttpHandler',
            },
            {
                name: 'RebusSftpPoller',
                desc: 'description of RebusSftpPoller',
            },
            {
                name: 'CsvFileIteratorWithLineGetter',
                desc: 'description of CsvFileIteratorWithLineGetter',
            }
        ];
    }

    private getConstants() {
        return [
            {
                name: 'uk-001-master_item-anovo-out',
                desc: 'description of uk-001-master_item-anovo-out',
            },
            {
                name: 'uk-007-wip_work_order-utl-out',
                desc: 'description of uk-007-wip_work_order-utl-out',
            },
            {
                name: 'uk-014-om_ship_req-utl-out',
                desc: 'description of uk-014-om_ship_req-utl-out',
            },
            {
                name: 'uk-165-employee_hcm_master_worker-callidus-out',
                desc: 'description of uk-165-employee_hcm_master_worker-callidus-out',
            }
        ];
    }

    private getBaseClasses() {
        return [
            {
                name: 'QorusService1',
                desc: 'Service class 2',
            },
            {
                name: 'QorusService2',
                desc: 'Service class 2',
            },
        ];
    }

    private getMappers() {
        return [
            {
                name: 'Mapper1',
                desc: 'Mapper 2',
            },
            {
                name: 'Mapper2',
                desc: 'Mapper 2',
            },
        ];
    }

    private getVMaps() {
        return [
            {
                name: 'VMap1',
                desc: 'Value map 2',
            },
            {
                name: 'VMap2',
                desc: 'Value map 2',
            },
        ];
    }

    private getAuthors() {
        return [
            {
                name: 'author 1 from company ltd, author1@company.com',
            },
            {
                name: 'author 2 from company ltd, author2@company.com',
            },
        ];
    }
}


export const creator = new InterfaceCreator();
