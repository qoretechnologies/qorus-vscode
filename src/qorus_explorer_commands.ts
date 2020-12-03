import * as vscode from 'vscode';
import { t } from 'ttag';

import { dash2Pascal } from './qorus_utils';
import { projects } from './QorusProject';
import { deployer } from './QorusDeploy';
import { tester } from './QorusTest';
import * as msg from './qorus_message';

const checkPathIsInSourceDirs = (fs_path: string): boolean => {
    const project = projects.getProject(vscode.Uri.file(fs_path));
    if (!project) {
        // cannot happen, actually, so no message
        return false;
    }

    if (!project.isInSourceDirs(fs_path)) {
        msg.error(t`FileNotInSourceDirs ${fs_path}`);
        return false;
    }

    return true;
};

export const registerQorusExplorerCommands = (context: vscode.ExtensionContext) => {
    let disposable;

    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow', 'workflow-steps',
        'service-methods', 'mapper-code-methods', 'fsm', 'pipeline', 'connection'].forEach(iface_kind =>
    {
        const command = 'qorus.explorer.edit' + dash2Pascal(iface_kind);
        disposable = vscode.commands.registerCommand(command, (resource: any) => {
            if (!checkPathIsInSourceDirs(resource.fsPath)) {
                return;
            }

            const code_info = projects.projectCodeInfo(resource.fsPath);
            const data = code_info?.yaml_info.yamlDataBySrcFile(resource.fsPath);

            if (data) {
                switch (iface_kind) {
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
                }
                vscode.commands.executeCommand('qorus.editInterface', data, iface_kind);
            }
        });
        context.subscriptions.push(disposable);
    });

    disposable = vscode.commands.registerCommand('qorus.explorer.editInterface', (resource: any) => {
        if (!checkPathIsInSourceDirs(resource.fsPath)) {
            return;
        }

        const code_info = projects.projectCodeInfo(resource.fsPath);
        const data = code_info?.yaml_info.yamlDataByFile(resource.fsPath);
        if (!data?.type) {
            msg.error(t`NotAQorusInterfaceFile ${resource.fsPath}`);
            return;
        }

        vscode.commands.executeCommand('qorus.editInterface', data, data.type);
    });
    context.subscriptions.push(disposable);

    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow',
        'fsm', 'interface', 'connection'].forEach(iface_kind =>
    {
        const command = 'qorus.explorer.deploy' + dash2Pascal(iface_kind);
        disposable = vscode.commands.registerCommand(command, (resource: any) => {
            if (!checkPathIsInSourceDirs(resource.fsPath)) {
                return;
            }

            const code_info = projects.projectCodeInfo(resource.fsPath);
            const data = code_info?.yaml_info.yamlDataByFile(resource.fsPath);
            if (!data?.type) {
                msg.error(t`NotAQorusInterfaceFile ${resource.fsPath}`);
                return;
            }

            vscode.window.showInformationMessage(
                t`ConfirmDeployInterface ${data.type} ${data.name}`, t`YesWithDep`, t`YesWithoutDep`, t`No`
            ).then(
                selection => {
                    if (selection !== t`No`) {
                        deployer.deployFile(resource.fsPath, selection === t`YesWithDep`);
                    }
                }
            );
        });
        context.subscriptions.push(disposable);
    });

    disposable = vscode.commands.registerCommand('qorus.explorer.multiDeploy', (_uri: vscode.Uri, uris: vscode.Uri[]) => {
        vscode.window.showInformationMessage(
            t`ConfirmDeployFilesAndDirs`, t`YesWithDep`, t`YesWithoutDep`, t`No`
        ).then(
            selection => {
                if (selection !== t`No`) {
                    deployer.deployFilesAndDirs(uris.map(uri => uri.fsPath), selection === t`YesWithDep`);
                }
            }
        );
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.explorer.deployDir', (uri: vscode.Uri) => {
        vscode.window.showInformationMessage(
            t`ConfirmDeployDirectory ${uri.fsPath}`, t`YesWithDep`, t`YesWithoutDep`, t`No`
        ).then(
            selection => {
                if (selection !== t`No`) {
                    deployer.deployDir(uri.fsPath, selection === t`YesWithDep`);
                }
            }
        );
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.explorer.testFile', (uri: vscode.Uri) => tester.testFile(uri));
    context.subscriptions.push(disposable);
};
