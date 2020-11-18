import * as child_process from 'child_process';
import { t } from 'ttag';
import * as path from 'path';
import * as vscode from 'vscode';

import * as msg from './qorus_message';
import { installQorusJavaApiSources } from './qorus_java_utils';
import { dash2Pascal } from './qorus_utils';
import { qorus_vscode } from './qorus_vscode';
import { deployer } from './QorusDeploy';
import { qorusIcons } from './QorusIcons';
import { interface_tree } from './QorusInterfaceTree';
import { QorusJavaCodeLensProvider } from './QorusJavaCodeLensProvider';
import { QorusJavaHoverProvider } from './QorusJavaHoverProvider';
import { qorus_locale } from './QorusLocale';
import { config_filename, projects } from './QorusProject';
import { QorusPythonCodeLensProvider } from './QorusPythonCodeLensProvider';
import { QorusPythonHoverProvider } from './QorusPythonHoverProvider';
import { QorusQoreCodeLensProvider } from './QorusQoreCodeLensProvider';
import { QorusQoreHoverProvider } from './QorusQoreHoverProvider';
import { qorus_request } from './QorusRequest';
import { tester } from './QorusTest';
import { instance_tree } from './QorusInstanceTree';
import { qorus_webview } from './QorusWebview';
import { ActionDispatcher as creator } from './interface_creator/ActionDispatcher';
import { QorusProjectInterfaceInfo } from './QorusProjectInterfaceInfo';
import { registerQorusExplorerCommands } from './qorus_explorer_commands';
import { registerQorusViewsCommands } from './qorus_views_commands';

qorus_locale.setLocale();

export async function activate(context: vscode.ExtensionContext) {
    qorus_vscode.context = context;
    qorusIcons.update(context.extensionPath);
    installQorusJavaApiSources(context.extensionPath);

    let disposable;
    disposable = vscode.commands.registerTextEditorCommand('qorus.deployCurrentFile',
                                                               () => deployer.deployCurrentFile());
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerTextEditorCommand('qorus.testCurrentFile', () => tester.testCurrentFile());
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

    disposable = vscode.commands.registerCommand('qorus.openWebview', () => qorus_webview.open());
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.closeWebview', () => qorus_webview.dispose());
    context.subscriptions.push(disposable);

    ['service', 'job', 'workflow', 'step', 'mapper', 'mapper-code', 'class', 'connection',
        'group', 'event', 'queue', 'type', 'fsm', 'pipeline'].forEach(iface_kind =>
    {
        const command = 'qorus.create' + dash2Pascal(iface_kind);
        disposable = vscode.commands.registerCommand(command, (data: vscode.TreeItem | vscode.Uri) => {
            const uri = data instanceof vscode.Uri ? data : undefined;

            qorus_webview.open({
                tab: 'CreateInterface',
                subtab: iface_kind,
            }, uri);
        });
        context.subscriptions.push(disposable);
    });

    disposable = vscode.commands.registerCommand('qorus.editInterface',
                                                 (data: any, iface_kind: string) =>
    {
        const code_info = projects.currentProjectCodeInfo();
        if (!code_info) {
            return;
        }

        const iface_info: QorusProjectInterfaceInfo = code_info.interface_info;
        const iface_id = iface_info.addIfaceById(data, iface_kind);

        code_info.checkReferencedObjects(iface_id, data);

        qorus_webview.open({
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: { ...data, iface_id }
        });

        const { target_dir, target_file } = data;
        if (target_dir && target_file) {
            const file_path = path.join(target_dir, target_file);
            if (path.extname(file_path) !== '.yaml') {
                code_info.edit_info.setFileInfo(file_path, data);
            }
        }
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.editCurrentInterface', () => {
        const editor = vscode.window.activeTextEditor;
        const code_info = projects.projectCodeInfo(editor?.document.uri);
        if (!code_info) {
            return;
        }
        const data = code_info.yaml_info.yamlDataByFile(editor.document.fileName);
        if (!data) {
            return;
        }
        const fixed_data = code_info.fixData(data);
        vscode.commands.executeCommand('qorus.editInterface', fixed_data, data.type);
    });
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deleteMethod', (data: any, iface_kind: string) =>
            creator.deleteMethod(data, iface_kind));
    context.subscriptions.push(disposable);

    registerQorusExplorerCommands(context);
    registerQorusViewsCommands(context);

    disposable = vscode.window.registerTreeDataProvider('qorusInstancesExplorer', instance_tree);
    context.subscriptions.push(disposable);

    interface_tree.setExtensionPath(context.extensionPath);

    disposable = vscode.window.registerTreeDataProvider('qorusInterfaces', interface_tree);
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusQoreCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'java', scheme: 'file' }],
        new QorusJavaCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'python', scheme: 'file' }],
        new QorusPythonCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusQoreHoverProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'java', scheme: 'file' }],
        new QorusJavaHoverProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'python', scheme: 'file' }],
        new QorusPythonHoverProvider()
    );
    context.subscriptions.push(disposable);

    updateQorusTree();

    vscode.window.onDidChangeActiveTextEditor(
        editor => {
            if (editor?.document?.uri.scheme === 'file') {
                updateQorusTree(editor.document.uri, false);
            }
        },
        null,
        context.subscriptions
    );

    vscode.workspace.onDidSaveTextDocument(
        document => {
            if (path.basename(document.fileName) === config_filename) {
                updateQorusTree(document.uri);
            }
        },
        null,
        context.subscriptions
    );
}

function updateQorusTree(uri?: vscode.Uri, forceTreeReset: boolean = true) {
    const workspace_folder_changed_or_unset = projects.updateCurrentWorkspaceFolder(uri);

    if (workspace_folder_changed_or_unset || forceTreeReset) {
        projects.validateConfigFileAndDo(
            (file_data: any) => {
                instance_tree.reset(file_data.qorus_instances);
                interface_tree.refresh();
            },
            () => instance_tree.reset({}),
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
