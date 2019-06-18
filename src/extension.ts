import * as vscode from 'vscode';
import * as path from 'path';
import * as child_process from 'child_process';
import { projects, config_filename } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { qorus_webview } from './QorusWebview';
import { deployer } from './QorusDeploy';
import { tester } from './QorusTest';
import { tree } from './QorusTree';
import * as msg from './qorus_message';
import { t, addLocale, useLocale } from 'ttag';
import * as fs from 'fs';
import * as gettext_parser from 'gettext-parser';
import { WorkspaceFolder, DebugConfiguration, ProviderResult, CancellationToken } from 'vscode';
import * as request from 'request-promise';

setLocale();

let qore_vscode = vscode.extensions.getExtension('qoretechnologies.qore-vscode');

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

    disposable = vscode.commands.registerTextEditorCommand('qorus.testCurrentFile',
                                                           () => tester.testCurrentFile());

    disposable = vscode.commands.registerCommand('qorus.testFile',
                                                 (uri: vscode.Uri) => tester.testFile(uri));
    context.subscriptions.push(disposable);

    disposable = vscode.commands.registerCommand('qorus.testDir',
                                                 (uri: vscode.Uri) => tester.testDir(uri));
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

    context.subscriptions.push(vscode.commands.registerCommand('extension.qorus-vscode.getInterface', config => {
        return pickInterface(config);
    }));

    context.subscriptions.push(vscode.debug.registerDebugConfigurationProvider('qorus', new QorusConfigurationProvider()));
    context.subscriptions.push(vscode.debug.registerDebugAdapterDescriptorFactory('qorus', new QorusDebugAdapterDescriptorFactory()));

    context.subscriptions.push(vscode.debug.onDidStartDebugSession(_session => {
    }));
    context.subscriptions.push(vscode.debug.onDidTerminateDebugSession(_session => {
    }));
    context.subscriptions.push(vscode.debug.onDidChangeActiveDebugSession(_session => {
    }));
    context.subscriptions.push(vscode.debug.onDidReceiveDebugSessionCustomEvent(_event => {
    }));
}

export function deactivate() {
}

function pickInterface(config: DebugConfiguration) {
    const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
    if (!ok) {
        throw new Error(t`Aborted`);
    }
    // list interfaces
    const options = {
        method: 'GET',
        uri: `${active_instance.url}/api/latest/${config.kind}s`,
        strictSSL: false,
        headers: {
            'qorus-token': token
        },
        json: true
    };
    return request(options).then(
        (response: any) => {
            let items: string[] = [];
            for (let iface of response) {
                items.push(iface.name + ":" + iface.version);
            }
            msg.log(t`requestResponse ${JSON.stringify(response)}`);
            return vscode.window.showQuickPick(items, {
                canPickMany: false,
                placeHolder: t`Please enter the name of a ${config.kind} or ${config.kind}_id`,
            }).then( name => {
                return name;
            } );
        },
        (error: any) => {
            throw new Error(error.message);
        }
    );
}

function updateQorusTree(uri?: vscode.Uri, forceTreeReset: boolean = true) {

    const workspace_folder_changed_or_unset = projects.updateCurrentWorkspaceFolder(uri);

    if (workspace_folder_changed_or_unset || forceTreeReset) {
        projects.validateConfigFileAndDo(
            (file_data: any) => tree.reset(file_data.qorus_instances),
            () => tree.reset({}),
            uri
        );
    }

    if (workspace_folder_changed_or_unset) {
        qorus_webview.dispose();
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
    const command: string = vscode.workspace.getConfiguration('qorus').get(cfg_name) + ' "' + url +'"';
    msg.info(t`OpeningUrlInExternalBrowser ${name} ${url}`);
    msg.log(command);
    try {
        child_process.execSync(command);
    }
    catch (error) {
        msg.error(t`OpenUrlInExternalBrowserError`);
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
        msg.error(t`Language file not found`);
        return;
    }

    const translation_object = gettext_parser.po.parse(fs.readFileSync(po_file));
    addLocale(locale, translation_object);
    useLocale(locale);

    if (use_default_locale) {
        msg.log(t`UsingDefaultLocale ${locale}`);
    }
    else {
        msg.log(t`UsingLocaleSettings ${locale}`);
    }
}

// debugger stuff
class QorusConfigurationProvider implements vscode.DebugConfigurationProvider {
    /**
        Massage a debug configuration just before a debug session is being launched,
        e.g. add all missing attributes to the debug configuration.
        Commands ${command:xxx} are invoked by vscode and value is substituted
     */
    resolveDebugConfiguration(_folder: WorkspaceFolder | undefined, config: DebugConfiguration, _token?: CancellationToken): ProviderResult<DebugConfiguration> {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            throw new Error(t`Aborted`);
        }
        config.active_instance = active_instance;
        config.token = token;
        return config;
    }
}

class QorusDebugAdapterDescriptorFactory implements vscode.DebugAdapterDescriptorFactory {

    createDebugAdapterDescriptor(session: vscode.DebugSession, _executable: vscode.DebugAdapterExecutable | undefined): vscode.ProviderResult<vscode.DebugAdapterDescriptor> {
        let config = session.configuration;
        // prepare qore-vscode configuration, mainly we need resolve URL for remote interface

        // we need resolve interface name to adjust connection in case the interface is remote
        // interface might be in <name>, <name>:<version>, <interface_id> form

        const options = {
            method: 'GET',
            uri: `${config.active_instance.url}/api/latest/${config.kind}s/${config.interface}`,
            strictSSL: false,
            headers: {
                'qorus-token': config.token
            },
            json: true
        };
        return request(options).then(
            (response: any) => {
                let qoreConfig = <DebugConfiguration>{};
                qoreConfig.type = "qore";
                qoreConfig.name = config.name;
                qoreConfig.request = "attach";
                qoreConfig.connection = config.active_instance.url.replace(/^http/i, "ws") + "/debug";
                if (config.token) {
                    qoreConfig.headers = [ {"name": "qorus-token", "value": config.token} ];
                }

                if (response.remote) {
                    if (response.process !== null) {
                        qoreConfig.connection = qoreConfig.connection + "/" + response.process.id;
                    } else {
                        throw new Error(t`Cannot get remote process URL`);
                    }
                }
                for (const key of ["logFilename", "appendToLog", "fullException", "verbosity", "maxRedir",
                    "proxy", "timeout", "connTimeout", "respTimeout"]) {
                    if (typeof config[key] !== "undefined") {
                        qoreConfig[key] = config[key];
                    }
                }
                msg.info(t`Connecting: ${qoreConfig.connection}`);
                qoreConfig.program = response.name+":"+response.version;
                let s: string = config.kind + " #" + response[config.kind + "id"] + ": " + qoreConfig.program;
                msg.info(s);
                let qoreExecutable = qore_vscode.exports.getQoreExecutable();
                let args: string[] = qore_vscode.exports.getExecutableArguments(qoreConfig);
                /*
                Unless we create new debugger then we cannot override config used by debuger for attach program.
                It is about substituteVariables to do it properly. Even session is passed apparently
                by reference in case of object then modification has not effect and no program is passed to adapter.
                So we use workaround and we pass program name at command line which is used if no program appears
                in attach request
                */
                session.configuration.program = qoreConfig.program;
                args.push("--program");
                args.push(qoreConfig.program);
                console.log(qoreExecutable + " " + args.join(" "));
                console.log(s);
                return new vscode.DebugAdapterExecutable(qoreExecutable, args);
            },
            (error: any) => {
                throw new Error(error.message);
            }
        );
        return null;
    }
}
