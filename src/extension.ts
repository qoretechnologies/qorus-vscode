import * as child_process from 'child_process';
import { unlink } from 'fs';
import { t } from 'ttag';
import { join } from 'path';import * as vscode from 'vscode';
import { window } from 'vscode';

import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { qorus_vscode } from './qorus_vscode';
import { QorusCodeLensProvider } from './QorusCodeLensProvider';
import { deployer } from './QorusDeploy';
import { QorusHoverProvider } from './QorusHoverProvider';
import { qorusIcons } from './QorusIcons';
import { InterfaceTree } from './QorusInterfaceTree';
import { qorus_locale } from './QorusLocale';
import { config_filename, projects } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { tester } from './QorusTest';
import { tree } from './QorusTree';
import { qorus_webview } from './QorusWebview';
import { creator } from './qorus_creator/InterfaceCreatorDispatcher';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';

qorus_locale.setLocale();

function registerInterfaceTreeCommands(context: vscode.ExtensionContext) {
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
    'mapper-code', 'queue', 'service', 'step', 'value-map', 'workflow'].forEach(intf => {
        const command = 'qorus.views.delete' + dash2Pascal(intf);
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            window.showWarningMessage(
                'Are you sure you want to delete ' + intf + ' ' + String(data.name)
                + '? This will delete both the ' + intf + ' metadata file and code file.',
                'Yes', 'No'
            ).then(
                (selection) => {
                    if (selection === undefined || selection === 'No') {
                        return;
                    }
                    const intfData = data.data;

                    // delete yaml file
                    if (intfData.hasOwnProperty('yaml_file')) {
                        unlink(intfData.yaml_file, (err) => {
                            if (err) {
                                msg.warning('Failed deleting ' + intf + ' metadata file ' + intfData.yaml_file + ': ' + err);
                            } else {
                                msg.info('Deleted ' + intf + ' metadata file: ' + intfData.yaml_file);
                            }
                        });
                    }

                    // delete code file
                    if (intfData.hasOwnProperty('target_dir') && intfData.hasOwnProperty('target_file')) {
                        const codeFile = join(intfData.target_dir, intfData.target_file);
                        unlink(codeFile, (err) => {
                            if (err) {
                                msg.warning('Failed deleting ' + intf + ' code file ' + codeFile + ': ' + err);
                            } else {
                                msg.info('Deleted ' + intf + ' code file: ' + codeFile);
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
    'mapper-code', 'queue', 'service', 'step', 'value-map', 'workflow'].forEach(intf => {
        const command = 'qorus.views.deploy' + dash2Pascal(intf);
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            window.showWarningMessage(
                'Are you sure you want to deploy ' + intf + ' ' + String(data.name) + '?',
                'Yes', 'No'
            ).then(
                async (selection) => {
                    if (selection === undefined || selection === 'No') {
                        return;
                    }
                    const intfData = data.data;

                    // deploy code file
                    if (intfData.hasOwnProperty('target_dir') && intfData.hasOwnProperty('target_file')) {
                        const codeFile = join(intfData.target_dir, intfData.target_file);
                        vscode.commands.executeCommand('qorus.deployFile', vscode.Uri.file(codeFile))
                        .then(
                            (result) => {
                                if (result !== undefined && result === true) {
                                    msg.info('Deployed ' + intf + ' code file: ' + codeFile);
                                } else {
                                    msg.error('Failed deploying ' + intf + ' code file ' + codeFile + '.');
                                }
                            },
                            () => {
                                msg.error('Failed deploying ' + intf + ' code file ' + codeFile + '.');
                            }
                        );
                    }

                    // deploy yaml file
                    if (intfData.hasOwnProperty('yaml_file')) {
                        vscode.commands.executeCommand('qorus.deployFile', vscode.Uri.file(intfData.yaml_file))
                        .then(
                            (result) => {
                                if (result !== undefined && result === true) {
                                    msg.info('Deployed ' + intf + ' metadata file: ' + intfData.yaml_file);
                                } else {
                                    msg.error('Failed deploying ' + intf + ' metadata file ' + intfData.yaml_file + '.');
                                }
                            },
                            () => {
                                msg.error('Failed deploying ' + intf + ' metadata file ' + intfData.yaml_file + '.');
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
    ['class', 'job', 'mapper', 'mapper-code', 'service', 'step', 'workflow'].forEach(intf => {
        const command = 'qorus.views.edit' + dash2Pascal(intf);
        disposable = vscode.commands.registerCommand(command, (data: any) => {
            const code_info = projects.currentProjectCodeInfo();
            const data2 = code_info.fixData({...data.data});
            vscode.commands.executeCommand('qorus.editInterface', data2, intf);
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
        if (data === undefined) {
            return;
        }
        if (!data.hasOwnProperty('data')) {
            return;
        }
        const intfData = data.data;
        switch (intfData.type) {
            case 'class':
            case 'constant':
            case 'function':
            case 'job':
            case 'mapper-code':
            case 'service':
            case 'step':
            case 'workflow':
                if (intfData.hasOwnProperty('target_dir') && intfData.hasOwnProperty('target_file')) {
                    const filePath = join(intfData.target_dir, intfData.target_file);
                    vscode.workspace.openTextDocument(vscode.Uri.file(filePath)).then(
                        (doc) => {
                            if (window.activeTextEditor !== undefined &&
                                window.activeTextEditor.document !== undefined &&
                                window.activeTextEditor.document.fileName === filePath
                            ) {
                                window.showTextDocument(doc, { preview: false });
                            } else {
                                window.showTextDocument(doc);
                            }
                        },
                        (err) => {
                            console.log('Error opening file ' + filePath + ': ', err);
                        }
                    );
                }
                break;

            case 'connection':
            case 'error':
            case 'value-map':
                if (intfData.hasOwnProperty('yaml_file')) {
                    vscode.workspace.openTextDocument(vscode.Uri.file(intfData.yaml_file)).then(
                        (doc) => {
                            if (window.activeTextEditor !== undefined &&
                                window.activeTextEditor.document !== undefined &&
                                window.activeTextEditor.document.fileName === intfData.yaml_file
                            ) {
                                window.showTextDocument(doc, { preview: false });
                            } else {
                                window.showTextDocument(doc);
                            }
                        },
                        (err) => {
                            console.log('Error opening file ' + intfData.yaml_file + ': ', err);
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

export async function activate(context: vscode.ExtensionContext) {
    qorus_vscode.context = context;
    qorusIcons.update(context.extensionPath);

    let disposable = vscode.commands.registerTextEditorCommand('qorus.deployCurrentFile',
                                                               () => deployer.deployCurrentFile());
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deployFile', (uri: vscode.Uri) => deployer.deployFile(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deployDir', (uri: vscode.Uri) => deployer.deployDir(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand('qorus.testCurrentFile', () => tester.testCurrentFile());

    disposable = vscode.commands.registerCommand('qorus.testFile', (uri: vscode.Uri) => tester.testFile(uri));
    context.subscriptions.push(disposable);

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.testDir', (uri: vscode.Uri) => tester.testDir(uri));

    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setActiveInstance',
                                                 (tree_item: string | vscode.TreeItem) =>
                                                        qorus_request.setActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.loginAndSetActiveInstance',
                                                 (tree_item: vscode.TreeItem) =>
                                                        qorus_request.setActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.logout',
                                                 (tree_item: vscode.TreeItem) => qorus_request.logout(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.loginAndStayInactiveInstance',
                                                 (tree_item: vscode.TreeItem) => qorus_request.login(tree_item, false));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setInactiveInstanceStayLoggedIn',
                                                 (tree_item: vscode.TreeItem) =>
                                                        qorus_request.unsetActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setInactiveInstance',
                                                 (tree_item: vscode.TreeItem) =>
                                                        qorus_request.unsetActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.openUrlInExternalBrowser', openUrlInExternalBrowser);
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.webview', () => qorus_webview.open());
    context.subscriptions.push(disposable);

    ['service', 'job', 'workflow', 'step', 'mapper', 'mapper-code', 'class', 'other'].forEach(subtab => {
        const command = 'qorus.create' + dash2Pascal(subtab);
        disposable = vscode.commands.registerCommand(command, (uri: vscode.Uri) => qorus_webview.open({
            tab: 'CreateInterface', subtab, uri
        }));
        context.subscriptions.push(disposable);
    });

    disposable = vscode.commands.registerCommand('qorus.editInterface',
                                                 (data: any, iface_kind: string) =>
    {
        const code_info: InterfaceInfo = projects.currentInterfaceInfo();
        const iface_id = code_info.addIfaceById(data, iface_kind);
        qorus_webview.open({
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: { ...data, iface_id }
        });
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deleteMethod', (data: any, iface_kind: string) =>
            creator.deleteMethod(data, iface_kind));
    context.subscriptions.push(disposable);

    disposable = vscode.window.registerTreeDataProvider('qorusInstancesExplorer', tree);
    context.subscriptions.push(disposable);

    InterfaceTree.setExtensionPath(context.extensionPath);
    {
        const code_info = projects.currentProjectCodeInfo();
        if (code_info !== undefined) {
            code_info.registerTreeForNotifications('interface-tree', InterfaceTree);
        }
    }
    registerInterfaceTreeCommands(context);
    disposable = vscode.window.registerTreeDataProvider('qorusInterfaces', InterfaceTree);
    context.subscriptions.push(disposable);
    InterfaceTree.refresh();

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusHoverProvider()
    );
    context.subscriptions.push(disposable);

    updateQorusTree();

    vscode.window.onDidChangeActiveTextEditor(
        editor => {
            if (editor && editor.document && editor.document.uri.scheme === 'file') {
                updateQorusTree(editor.document.uri, false);
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(
        document => {
            if (document.fileName.indexOf(config_filename) > -1) {
                updateQorusTree(document.uri);
            }
        },
        null,
        context.subscriptions
    );
}

export function deactivate() {
    {
        const code_info = projects.currentProjectCodeInfo();
        if (code_info !== undefined) {
            code_info.unregisterTreeForNotifications('interface-tree');
        }
    }
}

function updateQorusTree(uri?: vscode.Uri, forceTreeReset: boolean = true) {
    const workspace_folder_changed_or_unset = projects.updateCurrentWorkspaceFolder(uri);

    if (workspace_folder_changed_or_unset || forceTreeReset) {
        projects.validateConfigFileAndDo(
            (file_data: any) => {
                tree.reset(file_data.qorus_instances);
                InterfaceTree.refresh();
            },
            () => tree.reset({}),
            uri
        );
    }

    if (workspace_folder_changed_or_unset) {
        if (qorus_webview.dispose()) {
            msg.warning(t`WorkspaceFolderChangedOrUnsetCloseWebview`);
        }
    }
}

function openUrlInExternalBrowser(url: string, name: string) {
    let cfg_name: string;
    switch (process.platform) {
        case 'aix':
        case 'freebsd':
        case 'linux':
        case 'openbsd':
        case 'sunos':
            cfg_name = 'openUrlInExternalBrowser.linux';
            break;
        case 'darwin':
            cfg_name = 'openUrlInExternalBrowser.mac';
            break;
        case 'win32':
            cfg_name = 'openUrlInExternalBrowser.windows';
            break;
        default:
            cfg_name = '';
    }
    const command: string = vscode.workspace.getConfiguration('qorus').get(cfg_name) + ' "' + url + '"';
    msg.info(t`OpeningUrlInExternalBrowser ${name} ${url}`);
    msg.log(command);
    try {
        child_process.execSync(command);
    } catch (error) {
        msg.error(t`OpenUrlInExternalBrowserError`);
    }
}
