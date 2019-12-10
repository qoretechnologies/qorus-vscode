import * as vscode from 'vscode';
import { unlink } from 'fs';
import { join } from 'path';
import { InterfaceTree } from './QorusInterfaceTree';
import { projects } from './QorusProject';
import { dash2Pascal } from './qorus_utils';
import * as msg from './qorus_message';

export const registerInterfaceTreeCommands = (context: vscode.ExtensionContext) => {
    let disposable;

    // view switching commands
    disposable = vscode.commands.registerCommand(
        'qorus.views.switchToCategoryView', () => InterfaceTree.setCategoryView()
    );
    disposable = vscode.commands.registerCommand(
        'qorus.views.switchToFolderView', () => InterfaceTree.setFolderView()
    );

    // delete commands
    ['class', 'connection', 'constant', 'error', 'event', 'function', 'group', 'job', 'mapper',
     'mapper-code', 'queue', 'service', 'step', 'value-map', 'workflow'].forEach(iface => {
        const command = 'qorus.views.delete' + dash2Pascal(iface);
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            vscode.window.showWarningMessage(
                'Are you sure you want to delete ' + iface + ' ' + String(data.name)
                + '? This will delete both the ' + iface + ' metadata file and code file.',
                'Yes', 'No'
            ).then(
                selection => {
                    if (selection === undefined || selection === 'No') {
                        return;
                    }
                    const iface_data = data.data;

                    // delete yaml file
                    if (iface_data['yaml_file']) {
                        unlink(iface_data.yaml_file, (err) => {
                            if (err) {
                                msg.warning('Failed deleting ' + iface + ' metadata file ' + iface_data.yaml_file + ': ' + err);
                            } else {
                                msg.info('Deleted ' + iface + ' metadata file: ' + iface_data.yaml_file);
                            }
                        });
                    }

                    // delete code file
                    if (iface_data.target_dir && iface_data.target_file) {
                        const codeFile = join(iface_data.target_dir, iface_data.target_file);
                        unlink(codeFile, (err) => {
                            if (err) {
                                msg.warning('Failed deleting ' + iface + ' code file ' + codeFile + ': ' + err);
                            } else {
                                msg.info('Deleted ' + iface + ' code file: ' + codeFile);
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
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            vscode.window.showWarningMessage(
                'Are you sure you want to deploy ' + iface + ' ' + String(data.name) + '?',
                'Yes', 'No'
            ).then(
                selection => {
                    if (selection === undefined || selection === 'No') {
                        return;
                    }
                    const iface_data = data.data;

                    // deploy code file
                    if (iface_data.target_dir && iface_data.target_file) {
                        const codeFile = join(iface_data.target_dir, iface_data.target_file);
                        vscode.commands.executeCommand('qorus.deployFile', vscode.Uri.file(codeFile))
                        .then(
                            result => {
                                if (result) {
                                    msg.info('Deployed ' + iface + ' code file: ' + codeFile);
                                } else {
                                    msg.error('Failed deploying ' + iface + ' code file ' + codeFile + '.');
                                }
                            }
                        );
                    }

                    // deploy yaml file
                    if (iface_data.yaml_file) {
                        vscode.commands.executeCommand('qorus.deployFile', vscode.Uri.file(iface_data.yaml_file))
                        .then(
                            result => {
                                if (result) {
                                    msg.info('Deployed ' + iface + ' metadata file: ' + iface_data.yaml_file);
                                } else {
                                    msg.error('Failed deploying ' + iface + ' metadata file ' + iface_data.yaml_file + '.');
                                }
                            }
                        );
                    }
                }
            );
        });
        context.subscriptions.push(disposable);
    });
    disposable = vscode.commands.registerCommand('qorus.views.deployAllInterfaces', () => {
        // TODO
    });

    // edit commands
    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow'].forEach(iface => {
        const command = 'qorus.views.edit' + dash2Pascal(iface);
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            const code_info = projects.currentProjectCodeInfo();
            const data2 = code_info.fixData({...data.data});
            vscode.commands.executeCommand('qorus.editInterface', data2, iface);
        });
        context.subscriptions.push(disposable);
    });
    disposable = vscode.commands.registerCommand('qorus.views.editWorkflowSteps', (data: any) =>
    {
        const code_info = projects.currentProjectCodeInfo();
        const data2 = code_info.fixData({...data.data});
        data2.show_steps = true;
        vscode.commands.executeCommand('qorus.editInterface', data2, 'workflow');
    });
    context.subscriptions.push(disposable);

    // open interface command, used when clicking on interface in the tree
    disposable = vscode.commands.registerCommand('qorus.views.openInterface', (data: any) =>
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
                    vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(
                        doc => {
                            if (vscode.window.activeTextEditor &&
                                vscode.window.activeTextEditor.document.fileName === filePath)
                            {
                                vscode.window.showTextDocument(doc, { preview: false });
                            } else {
                                vscode.window.showTextDocument(doc);
                            }
                        },
                        err => {
                            console.log('Error opening file ' + filePath + ': ', err);
                        }
                    );
                }
                break;

            case 'connection':
            case 'error':
            case 'value-map':
                if (iface_data.yaml_file) {
                    vscode.workspace.openTextDocument(vscode.Uri.file(iface_data.yaml_file)).then(
                        doc => {
                            if (vscode.window.activeTextEditor &&
                                vscode.window.activeTextEditor.document.fileName === iface_data.yaml_file)
                            {
                                vscode.window.showTextDocument(doc, { preview: false });
                            } else {
                                vscode.window.showTextDocument(doc);
                            }
                        },
                        err => {
                            console.log('Error opening file ' + iface_data.yaml_file + ': ', err);
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
