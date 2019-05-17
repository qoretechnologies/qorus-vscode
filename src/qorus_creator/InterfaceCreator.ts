import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects, QorusProject } from '../QorusProject';
import * as msg from '../qorus_message';
import { t } from 'ttag';
import { fillTemplate, createHeaders, suffix, comment_chars } from './creator_common';
import { service_template, defaultServiceHeaders } from './service_code';
import { job_template, defaultJobHeaders, default_job_parse_options } from './job_code';


class InterfaceCreator {
    private project_folder: string | undefined = undefined;

    private initProjectFolderIfNeeded(uri: vscode.Uri): boolean {
        if (this.project_folder) {
            return true;
        }

        const project: QorusProject | undefined = projects.getProject(uri);
        if (!project) {
            msg.error(t`QorusProjectNotSet`);
            return false;
        }

        this.project_folder = project.projectFolder();
        return true;
    }

    getProjectObjectNames(object_type: string, webview: vscode.Webview, uri?: vscode.Uri): string[] {
        if (!this.initProjectFolderIfNeeded(uri)) {
            return [];
        }

        let names: string[] = [];
        switch (object_type) {
            case 'functions': names = this.getFunctions(); break;
            case 'classes': names = this.getClasses(); break;
            case 'constants': names = this.getConstants(); break;
        }

        if (webview) {
            webview.postMessage({
                action: 'creator-return-object-names',
                object_type,
                names,
            });
        }

        return names;
    }

    createInterface(data: any) {
        const {iface_kind, ...other_data} = data;
        switch (iface_kind) {
            case 'service': this.createService(other_data); break;
            case 'job': this.createJob(other_data); break;
        }
    }

    private createService(data: any) {
        const {lang = 'qore', ...other_data} = data
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
        const {lang = 'qore', ...other_data} = data
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

    private headersAndCode(lang, data, default_file_name, default_header_vars, template): any
    {
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
            'uk-lib-common',
            'uk-lib-archive',
            'uk-lib-audit_tracker',
            'uk-lib-sftp',
            'uk-validation-gen-transactional_info',
        ];
    }

    private getClasses() {
        return [
            'RebusHttpHandler',
            'RebusSftpPoller',
            'CsvFileIteratorWithLineGetter',
        ];
    }

    private getConstants() {
        return [
            'uk-001-master_item-anovo-out',
            'uk-007-wip_work_order-utl-out',
            'uk-014-om_ship_req-utl-out',
            'uk-165-employee_hcm_master_worker-callidus-out',
        ];
    }
}


export const creator = new InterfaceCreator();
