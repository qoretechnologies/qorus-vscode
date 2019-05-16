import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects, QorusProject } from '../QorusProject';
import * as msg from '../qorus_message';
import { t } from 'ttag';
import { fillTemplate, createHeaders, suffix } from './creator_common';
import { service_fields, service_template, defaultServiceHeaders } from './service_code';
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
        switch (data.iface_kind) {
            case 'service': this.createService(data); break;
            case 'job': this.createJob(data); break;
        }
    }

    getFields(iface_kind: string): any {
        switch (iface_kind) {
            case 'service': return service_fields; break;
        }
    }

    private createService(data: any) {
        const {
            lang = 'qore',
            headers: header_vars,
            target_dir,
            target_file = `${header_vars.service}-${header_vars.version}.qsd${suffix[lang]}`,
            ...code_vars
        } = data;

        const headers = createHeaders(Object.assign({}, header_vars, defaultServiceHeaders(data), header_vars));
        const code = fillTemplate(service_template[lang], code_vars);

        fs.writeFileSync(
            path.join(target_dir, target_file),
            headers + '# ENDSERVICE\n\n' + code
        );
    }

    private createJob(data: any) {
        const {
            lang = 'qore',
            headers: header_vars,
            target_dir,
            target_file = `${header_vars.name}-${header_vars.version}.qjob${suffix[lang]}`,
            ...code_vars
        } = data;

        const headers = createHeaders(Object.assign({}, header_vars, defaultJobHeaders(data), header_vars));
        const code = fillTemplate(job_template[lang], code_vars);

        fs.writeFileSync(
            path.join(target_dir, target_file),
            headers + (lang === 'qore' ? default_job_parse_options : '') + '\n' + code + '# END\n'
        );
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
