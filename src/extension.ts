import * as child_process from 'child_process';
import { t } from 'ttag';
import * as vscode from 'vscode';

import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { qorus_vscode } from './qorus_vscode';
import { QorusCodeLensProvider } from './QorusCodeLensProvider';
import { deployer } from './QorusDeploy';
import { QorusHoverProvider } from './QorusHoverProvider';
import { qorusIcons } from './QorusIcons';
import { InterfaceTree } from './QorusInterfaceTree';
import { QorusJavaCodeLensProvider } from './QorusJavaCodeLensProvider';
import { QorusJavaHoverProvider } from './QorusJavaHoverProvider';
import { qorus_locale } from './QorusLocale';
import { config_filename, projects } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { tester } from './QorusTest';
import { tree } from './QorusTree';
import { qorus_webview } from './QorusWebview';
import { creator } from './qorus_creator/InterfaceCreatorDispatcher';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';
import { registerInterfaceTreeCommands } from './qorus_interface_tree';

qorus_locale.setLocale();

export async function activate(context: vscode.ExtensionContext) {
    qorus_vscode.context = context;
    qorusIcons.update(context.extensionPath);
    let disposable;

    disposable = vscode.commands.registerTextEditorCommand('qorus.deployCurrentFile',
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

        if (['group', 'event', 'queue'].includes(iface_kind)) {
            iface_kind = 'other';
            data.type = data.type[0].toUpperCase() + data.type.substr(1);
        }

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

    const code_info = projects.currentProjectCodeInfo();
    code_info && code_info.registerTreeForNotifications('interface-tree', InterfaceTree);

    registerInterfaceTreeCommands(context);
    disposable = vscode.window.registerTreeDataProvider('qorusInterfaces', InterfaceTree);
    context.subscriptions.push(disposable);
    InterfaceTree.refresh();

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerCodeLensProvider(
        [{ language: 'java', scheme: 'file' }],
        new QorusJavaCodeLensProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'qore', scheme: 'file' }],
        new QorusHoverProvider()
    );
    context.subscriptions.push(disposable);

    disposable = vscode.languages.registerHoverProvider(
        [{ language: 'java', scheme: 'file' }],
        new QorusJavaHoverProvider()
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
    const code_info = projects.currentProjectCodeInfo();
    code_info && code_info.unregisterTreeForNotifications('interface-tree');
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
