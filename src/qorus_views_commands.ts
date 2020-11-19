import { join } from 'path';
import { t } from 'ttag';
import { commands, ExtensionContext, Uri, window as vswindow, workspace } from 'vscode';

import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { interface_tree } from './QorusInterfaceTree';
import { projects } from './QorusProject';
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
    ['class', 'connection', 'constant', 'error', 'event', 'function', 'group',
        'job', 'mapper', 'mapper-code', 'queue', 'service', 'step', 'value-map',
        'workflow', 'type', 'fsm', 'pipeline'].forEach(iface_kind =>
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
    ['class', 'connection', 'constant', 'error', 'event', 'function', 'group',
        'job', 'mapper', 'mapper-code', 'queue', 'service', 'step', 'value-map',
        'workflow', 'type', 'fsm', 'pipeline'].forEach(iface_kind =>
    {
        const command = 'qorus.views.deploy' + dash2Pascal(iface_kind);
        disposable = commands.registerCommand(command, (data: any) => {
            vswindow.showWarningMessage(
                t`ConfirmDeployInterface ${iface_kind} ${data.name}`, t`Yes`, t`No`
            ).then(
                selection => {
                    if (selection !== t`Yes`) {
                        return;
                    }

                    if (!data.data?.yaml_file) {
                        msg.error(t`MissingDeploymentData`);
                    }

                    deployer.deployFile(data.data.yaml_file);
                }
            );
        });
        context.subscriptions.push(disposable);
    });
    disposable = commands.registerCommand('qorus.views.deployAllInterfaces', () => {
        vswindow.showWarningMessage(
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
        vswindow.showWarningMessage(
            t`ConfirmDeployDirectory ${data.getDirectoryName()}`, t`Yes`, t`No`
        ).then(
            selection => {
                if (selection === t`Yes`) {
                    deployer.deployDir(data.getVscodeUri());
                }
            }
        );
    });

    // edit commands
    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow-steps', 'connection',
        'workflow', 'group', 'event', 'queue', 'type', 'fsm', 'pipeline', 'value-map'].forEach(iface_kind =>
    {
        const command_part = dash2Pascal(iface_kind);
        disposable = commands.registerCommand(`qorus.views.edit${command_part}`, (data: any) => {
            const code_info = projects.projectCodeInfo(data.data?.yaml_file);
            const fixed_data = code_info?.fixData(data.data);
            if (fixed_data) {
                if (command_part === 'WorkflowSteps') {
                    fixed_data.show_steps = true;
                    iface_kind = 'workflow';
                }
                commands.executeCommand('qorus.editInterface', fixed_data, iface_kind);
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
            case 'constant':
            case 'function':
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
