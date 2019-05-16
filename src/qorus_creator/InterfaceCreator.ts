import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects, QorusProject } from '../QorusProject';
import * as msg from '../qorus_message';
import { t } from 'ttag';
import { fillTemplate, createHeaders } from './creator_common';
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
        const {iface_kind, ...other_data} = data;
        switch (iface_kind) {
            case 'service': this.createService(other_data); break;
            case 'job': this.createJob(other_data); break;
        }
    }

    getFields(iface_kind: string): any {
        switch (iface_kind) {
            case 'service': return service_fields; break;
        }
    }

    private createService(data: any) {
        const {target_path, header_vars, headers, code}
            = this.headersAndCode(data, service_template, defaultServiceHeaders(data));

        fs.writeFileSync(
            path.join(target_path, `${header_vars.service}-${header_vars.version}.qsd`),
            headers + '# ENDSERVICE\n\n' + code
        );
    }

    private createJob(data: any) {
        const {target_path, header_vars, headers, code}
            = this.headersAndCode(data, job_template, defaultJobHeaders(data));

        fs.writeFileSync(
            path.join(target_path, `${header_vars.name}-${header_vars.version}.qjob`),
            headers + default_job_parse_options + '\n' + code + '# END\n'
        );
    }

    private headersAndCode(data, template, default_header_vars) {
        const {target_path, headers: header_vars, ...code_vars} = data;

        const headers: string = createHeaders(Object.assign({}, header_vars, default_header_vars, header_vars));
        const code: string = fillTemplate(template, code_vars);

        return {target_path, header_vars, headers, code};
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
