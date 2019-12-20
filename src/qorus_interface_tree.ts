import { unlink } from 'fs';
import { join } from 'path';
import { t } from 'ttag';
import { commands, ExtensionContext, Uri, window as vswindow, workspace } from 'vscode';

import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { InterfaceTree } from './QorusInterfaceTree';
import { projects } from './QorusProject';
import { deployer } from './QorusDeploy';

export function registerInterfaceTreeCommands(context: ExtensionContext) {
    let disposable;

    // view switching commands
    disposable = commands.registerCommand(
        'qorus.views.switchToCategoryView', () => InterfaceTree.setCategoryView()
    );
    disposable = commands.registerCommand(
        'qorus.views.switchToFolderView', () => InterfaceTree.setFolderView()
    );

    // delete commands
    ['class', 'connection', 'constant', 'error', 'event', 'function', 'group', 'job', 'mapper',
     'mapper-code', 'queue', 'service', 'step', 'value-map', 'workflow'].forEach(iface => {
        const command = 'qorus.views.delete' + dash2Pascal(iface);
        disposable = commands.registerCommand(command, (data: any) => {
            vswindow.showWarningMessage(
                t`ConfirmDeleteInterface ${iface} ${String(data.name)}`, t`Yes`, t`No`
            ).then(
                selection => {
                    if (selection === undefined || selection === t`No`) {
                        return;
                    }
                    const iface_data = data.data;

                    // delete yaml file
                    if (iface_data['yaml_file']) {
                        unlink(iface_data.yaml_file, (err) => {
                            if (err) {
                                msg.warning(t`FailedDeletingIfaceMetaFile ${iface} ${iface_data.yaml_file} ${err}`);
                            } else {
                                msg.info(t`DeletedIfaceMetaFile ${iface} ${iface_data.yaml_file}`);
                            }
                        });
                    }

                    // delete code file
                    if (iface_data.target_dir && iface_data.target_file) {
                        const codeFile = join(iface_data.target_dir, iface_data.target_file);
                        unlink(codeFile, (err) => {
                            if (err) {
                                msg.warning(t`FailedDeletingIfaceCodeFile ${iface} ${codeFile} ${err}`);
                            } else {
                                msg.info(t`DeletedIfaceCodeFile ${iface} ${codeFile}`);
                            }
                        });
                    }
                }
            );
        });
        context.subscriptions.push(disposable);
    });

    // deploy commands
    ['class', 'connection', 'constant', 'error', 'event', 'function', 'group', 'job', 'mapper',
     'mapper-code', 'queue', 'service', 'step', 'value-map', 'workflow'].forEach(iface => {
        const command = 'qorus.views.deploy' + dash2Pascal(iface);
        disposable = commands.registerCommand(command, (data: any) => {
            vswindow.showWarningMessage(
                t`ConfirmDeployInterface ${iface} ${data.name}`, t`Yes`, t`No`
            ).then(
                selection => {
                    if (selection === undefined || selection === t`No`) {
                        return;
                    }

                    if (!data.data || !data.data.yaml_file) {
                        msg.error(t`MissingDeploymentData`);
                    }

                    deployer.deployFile(Uri.file(data.data.yaml_file));
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
    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow'].forEach(iface => {
        const command = 'qorus.views.edit' + dash2Pascal(iface);
        disposable = commands.registerCommand(command, (data: any) => {
            const code_info = projects.currentProjectCodeInfo();
            const data2 = code_info.fixData(data.data);
            commands.executeCommand('qorus.editInterface', data2, iface);
        });
        context.subscriptions.push(disposable);
    });
    disposable = commands.registerCommand('qorus.views.editWorkflowSteps', (data: any) =>
    {
        const code_info = projects.currentProjectCodeInfo();
        const data2 = code_info.fixData(data.data);
        data2.show_steps = true;
        commands.executeCommand('qorus.editInterface', data2, 'workflow');
    });
    context.subscriptions.push(disposable);

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

            case 'connection':
            case 'error':
            case 'value-map':
                if (iface_data.yaml_file) {
                    workspace.openTextDocument(Uri.file(iface_data.yaml_file)).then(
                        doc => {
                            if (vswindow.activeTextEditor &&
                                vswindow.activeTextEditor.document.fileName === iface_data.yaml_file)
                            {
                                vswindow.showTextDocument(doc, { preview: false });
                            } else {
                                vswindow.showTextDocument(doc);
                            }
                        },
                        err => {
                            console.log(t`ErrorOpeningFile ${iface_data.yaml_file} ${err}`);
                        }
                    );
                }
            //case 'event':
            //case 'group':
            //case 'mapper':
            //case 'queue':
            default:
                break;
        }
    });
}
