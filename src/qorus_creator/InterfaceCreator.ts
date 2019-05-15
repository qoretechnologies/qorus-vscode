import * as vscode from 'vscode';
import { projects, QorusProject } from '../QorusProject';
import * as msg from '../qorus_message';
import { t } from 'ttag';
import { createService } from './service_creator';


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
            case 'service': createService(other_data); break;
        }
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
