import { join } from 'path';
import { t } from 'ttag';
import { commands, ExtensionContext, Uri, window as vswindow, workspace } from 'vscode';

import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { interface_tree } from './QorusInterfaceTree';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { deployer } from './QorusDeploy';

export const registerQorusViewsCommands = (context: ExtensionContext) => {
    let disposable;

    // view switching commands
    disposable = commands.registerCommand(
        'qorus.views.switchToCategoryView', () => interface_tree.setCategoryView()
    );
    disposable = commands.registerCommand(
        'qorus.views.switchToFolderView', () => interface_tree.setFolderView()
    );

    // delete commands
    ['class', 'connection', 'errors', 'event', 'group', 'job', 'mapper', 'mapper-code',
        'queue', 'service', 'step', 'value-map', 'workflow', 'type', 'fsm', 'pipeline'].forEach(iface_kind =>
    {
        const command = 'qorus.views.delete' + dash2Pascal(iface_kind);
        disposable = commands.registerCommand(command, (data: any) => {
            vswindow.showWarningMessage(
                t`ConfirmDeleteInterface ${iface_kind} ${data.name}`, t`Yes`, t`No`
            ).then(
                selection => {
                    if (selection !== t`Yes`) {
                        return;
                    }

                    const iface_data = data.data;
                    QorusProjectCodeInfo.deleteInterface({iface_kind, iface_data});
                }
            );
        });
        context.subscriptions.push(disposable);
    });

    // deploy commands
    ['class', 'connection', 'errors', 'event', 'group', 'job', 'mapper', 'mapper-code',
        'queue', 'service', 'step', 'value-map', 'workflow', 'type', 'fsm', 'pipeline'].forEach(iface_kind =>
    {
        const command = 'qorus.views.deploy' + dash2Pascal(iface_kind);
        disposable = commands.registerCommand(command, (data: any) => {
            vswindow.showInformationMessage(
                t`ConfirmDeployInterface ${iface_kind} ${data.name}`, t`YesWithDep`, t`YesWithoutDep`, t`No`
            ).then(
                selection => {
                    if (selection === t`No`) {
                        return;
                    }

                    if (!data.data?.yaml_file) {
                        msg.error(t`MissingDeploymentData`);
                        return;
                    }

                    deployer.deployFile(data.data.yaml_file, selection === t`YesWithDep`);
                }
            );
        });
        context.subscriptions.push(disposable);
    });
    disposable = commands.registerCommand('qorus.views.deployAllInterfaces', () => {
        vswindow.showInformationMessage(
            t`ConfirmDeployAllInterfaces`, t`Yes`, t`No`
        ).then(
            selection => {
                if (selection === t`Yes`) {
                    deployer.deployAllInterfaces();
                }
            }
        );
    });
    disposable = commands.registerCommand('qorus.views.deployDir', (data: any) => {
        vswindow.showInformationMessage(
            t`ConfirmDeployDirectory ${data.getDirectoryName()}`, t`YesWithDep`, t`YesWithoutDep`, t`No`
        ).then(
            selection => {
                if (selection !== t`No`) {
                    deployer.deployDir(data.getVscodeUri(), selection === t`YesWithDep`);
                }
            }
        );
    });

    // edit commands
    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow-steps', 'connection',
        'workflow', 'service-methods', 'mapper-code-methods', 'group', 'event', 'queue', 'type',
        'fsm', 'pipeline', 'value-map', 'errors'].forEach(key =>
    {
        const command = 'qorus.views.edit' + dash2Pascal(key);
        disposable = commands.registerCommand(command, (data: any) => {
            data = data.data;
            let iface_kind;
            if (data) {
                delete data.show_steps;
                switch (key) {
                    case 'workflow-steps':
                        data.show_steps = true;
                        iface_kind = 'workflow';
                        break;
                    case 'service-methods':
                        data.active_method = 1;
                        iface_kind = 'service';
                        break;
                    case 'mapper-code-methods':
                        data.active_method = 1;
                        iface_kind = 'mapper-code';
                        break;
                    default:
                        iface_kind = key;
                }
                commands.executeCommand('qorus.editInterface', data, iface_kind);
            }
        });
        context.subscriptions.push(disposable);
    });

    // open interface command, used when clicking on interface in the tree
    disposable = commands.registerCommand('qorus.views.openInterface', (data: any) =>
    {
        if (!data || !data.data) {
            return;
        }
        const iface_data = data.data;
        switch (iface_data.type) {
            case 'class':
            case 'job':
            case 'mapper-code':
            case 'service':
            case 'step':
            case 'fsm':
            case 'pipeline':
            case 'workflow':
                if (iface_data.target_dir && iface_data.target_file) {
                    const filePath = join(iface_data.target_dir, iface_data.target_file);
                    workspace.openTextDocument(Uri.file(filePath)).then(
                        doc => {
                            if (vswindow.activeTextEditor &&
                                vswindow.activeTextEditor.document.fileName === filePath)
                            {
                                vswindow.showTextDocument(doc, { preview: false });
                            } else {
                                vswindow.showTextDocument(doc);
                            }
                        },
                        err => {
                            console.log(t`ErrorOpeningFile ${filePath} ${err}`);
                        }
                    );
                }
                break;
            default:
                break;
        }
    });
};
