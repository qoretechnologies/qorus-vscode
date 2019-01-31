import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';
import { projects, config_filename } from './QorusProject';
import { deployer } from './QorusDeploy';
import { releaser } from './QorusRelease';
import { tree } from './QorusTree';
import * as msg from './qorus_message';
import { t, addLocale, useLocale } from 'ttag';
import * as fs from 'fs';
import * as gettext_parser from 'gettext-parser';

setLocale();

export async function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerTextEditorCommand('qorus.deployCurrentFile',
                                                               () => deployer.deployCurrentFile());
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deployFile',
                                                 (uri: vscode.Uri) => deployer.deployFile(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.deployDir',
                                                 (uri: vscode.Uri) => deployer.deployDir(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.manageProjectConfig',
                                                 (uri: vscode.Uri) => projects.manageProjectConfig(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.makeRelease',
                                                 (uri: vscode.Uri) => releaser.makeRelease(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setActiveInstance',
                                                 (tree_item: string | vscode.TreeItem) =>
                                                        deployer.setActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.loginAndSetActiveInstance',
                                                 (tree_item: vscode.TreeItem) =>
                                                        deployer.setActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.logout',
                                                 (tree_item: vscode.TreeItem) => deployer.logout(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.loginAndStayInactiveInstance',
                                                 (tree_item: vscode.TreeItem) => deployer.login(tree_item, false));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setInactiveInstanceStayLoggedIn',
                                                 (tree_item: vscode.TreeItem) =>
                                                        deployer.unsetActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.setInactiveInstance',
                                                 (tree_item: vscode.TreeItem) =>
                                                        deployer.unsetActiveInstance(tree_item));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.openUrlInExternalBrowser', openUrlInExternalBrowser);
    context.subscriptions.push(disposable);

    disposable = vscode.window.registerTreeDataProvider('qorusInstancesExplorer', tree);
    context.subscriptions.push(disposable);
    updateQorusTree();

    vscode.window.onDidChangeActiveTextEditor(editor => {
        if (editor && editor.document && editor.document.uri.scheme === 'file') {
            updateQorusTree(editor.document.uri, false);
        }
    }, null, context.subscriptions);

    vscode.workspace.onDidSaveTextDocument(document => {
        if (document.fileName.indexOf(config_filename) > -1) {
            updateQorusTree(document.uri);
        }
    }, null, context.subscriptions);
}

export function deactivate() {
}


function updateQorusTree(uri?: vscode.Uri, forceTreeReset: boolean = true) {
    if (!projects.updateCurrentWorkspaceFolder(uri) && !forceTreeReset) {
        return;
    }

    projects.validateConfigFileAndDo(
        (file_data: any) => tree.reset(file_data),
        () => tree.reset({}),
        uri
    );
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
    let command: string = vscode.workspace.getConfiguration('qorus').get(cfg_name) + ' "' + url +'"';
    msg.info(t`openingUrlInExternalBrowser ${name} ${url}`);
    msg.log(command);
    try {
        child_process.execSync(command);
    }
    catch (error) {
        msg.error(t`openUrlInExternalBrowserError`);
    }
}

function setLocale() {
    const default_locale = 'en';
    let use_default_locale: boolean = false;

    let po_file: string | undefined = undefined;
    let locale: string = vscode.workspace.getConfiguration().typescript.locale;

    function setPoFile() {
        if (use_default_locale) {
            locale = default_locale;
        }
        po_file = path.join(__dirname, '..', 'lang', `${locale}.po`);
        if (!fs.existsSync(po_file)) {
            po_file = undefined;
        }
    }

    if (locale) {
        setPoFile();
        if (!po_file && (locale != default_locale)) {
            use_default_locale = true;
            setPoFile();
        }
    }
    else {
        use_default_locale = true;
        setPoFile();
    }

    if (!po_file) {
        msg.error('Language file not found');
        return;
    }

    const translation_object = gettext_parser.po.parse(fs.readFileSync(po_file));
    addLocale(locale, translation_object);
    useLocale(locale);

    if (use_default_locale) {
        msg.log(t`usingDefaultLocale ${locale}`);
    }
    else {
        msg.log(t`usingLocaleSettings ${locale}`);
    }
}
