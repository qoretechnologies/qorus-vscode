import * as vscode from 'vscode';
import * as path from 'path';
import * as msg from './qorus_message';
import { t, gettext } from 'ttag';
import { tree } from './QorusTree';
import { projects, QorusProject, config_filename } from './QorusProject';
import { qorus_request } from './QorusRequest';
import { releaser } from './QorusRelease';
import { deleter } from './QorusDelete';
import { creator } from './qorus_creator/InterfaceCreatorDispatcher';

class QorusWebview {
    private panel: vscode.WebviewPanel | undefined = undefined;
    private config_file_watcher: vscode.FileSystemWatcher | undefined = undefined;
    private message_on_config_file_change: boolean = true;
    private initial_data: any = {};

    get opening_data(): any {
        return this.initial_data
    }

    set opening_data(data: any) {
        this.initial_data = data;
        this.postInitialData();
    }

    private postInitialData = () => {
        this.postMessage({
            action: 'return-initial-data',
            data: this.initial_data,
        });
    };

    open(initial_data: any = {}) {

        this.initial_data = initial_data;

        if (this.panel) {
            if (initial_data.uri) {
                if (projects.updateCurrentWorkspaceFolder(initial_data.uri)) {
                    this.dispose();
                    msg.warning(t`WorkspaceFolderChangedResetWebview`);
                    return this.open(initial_data);
                }
                if (!projects.getProject()) {
                    this.dispose();
                    msg.error(t`WorkspaceFolderUnsetCloseWebview`);
                    return;
                }
            }

            this.panel.reveal(vscode.ViewColumn.One);
            this.postInitialData();
            return;
        }

        const web_path = path.join(__dirname, '..', 'dist');
        vscode.workspace.openTextDocument(path.join(web_path, 'index.html')).then(
            doc => {
                this.panel = vscode.window.createWebviewPanel(
                    'qorusWebview',
                    t`QorusWebviewTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true,
                        retainContextWhenHidden: true,
                    }
                );
                this.panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);

                this.config_file_watcher = vscode.workspace.createFileSystemWatcher('**/' + config_filename);
                this.message_on_config_file_change = true;
                this.config_file_watcher.onDidChange(() => {
                    if (!this.message_on_config_file_change) {
                        this.message_on_config_file_change = true;
                        return;
                    }
                    msg.warning(t`ProjectConfigFileHasChangedOnDisk`);
                    this.panel.webview.postMessage({
                        action: 'config-changed-on-disk',
                    });
                });

                this.panel.onDidDispose(() => {
                    this.panel = undefined;
                    if (this.config_file_watcher) {
                        this.config_file_watcher.dispose();
                    }
                });

                this.panel.webview.onDidReceiveMessage(message => {
                    const project: QorusProject = projects.getProject();
                    if (!project) {
                        this.dispose();
                        msg.error(t`WorkspaceFolderUnsetCloseWebview`);
                        return;
                    }

                    switch (message.action) {
                        case 'get-text':
                            this.panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id),
                            });
                            break;
                        case 'get-active-tab':
                            this.setActiveTab(initial_data.tab);
                            break;
                        case 'get-current-project-folder':
                            this.panel.webview.postMessage({
                                action: 'current-project-folder',
                                folder: path.basename(project.folder),
                            });
                            break;
                        case 'login-get-data':
                            this.panel.webview.postMessage({
                                action: 'login-return-data',
                                qorus_instance: qorus_request.loginQorusInstance(),
                            });
                            break;
                        case 'login-submit':
                            qorus_request.loginPost(message.username, message.password);
                            break;
                        case 'login-cancel':
                            msg.info(t`LoginCancelled`);
                            this.panel.webview.postMessage({
                                action: 'close-login',
                            });
                            break;
                        case 'config-get-data':
                            project.getConfigForWebview();
                            break;
                        case 'config-update-data':
                            this.message_on_config_file_change = false;
                            project.updateConfigFromWebview(message.data);
                            break;
                        case 'config-add-dir':
                            this.message_on_config_file_change = false;
                            project.addSourceDir();
                            break;
                        case 'config-remove-dir':
                            this.message_on_config_file_change = false;
                            project.removeSourceDir(message.dir);
                            break;
                        case 'get-interfaces':
                            deleter.getInterfaces(message.iface_kind, message.columns);
                            break;
                        case 'delete-interfaces':
                            deleter.deleteInterfaces(message.iface_kind, message.ids);
                            break;
                        case 'release-get-branch':
                            releaser.makeRelease();
                            break;
                        case 'release-get-commits':
                            releaser.getCommits(message.filters);
                            break;
                        case 'release-get-diff':
                            releaser.getDiff(message.commit);
                            break;
                        case 'release-create-package':
                            releaser.createPackage(message.full);
                            break;
                        case 'release-deploy-package':
                            releaser.deployPackage();
                            break;
                        case 'release-get-package':
                            releaser.getPackage();
                            break;
                        case 'release-save-package':
                            releaser.savePackage();
                            break;
                        case 'creator-get-fields':
                            this.panel.webview.postMessage({
                                action: 'creator-return-fields',
                                iface_kind: message.iface_kind,
                                fields: creator.getFields(
                                    message.iface_kind,
                                    initial_data.uri ? initial_data.uri.fsPath : undefined
                                ),
                            });
                            break;
                        case 'creator-get-objects':
                        case 'creator-get-resources':
                        case 'creator-get-directories':
                            project.code_info.getObjects(message.object_type);
                            break;
                        case 'get-initial-data':
                            this.postInitialData();
                            break;
                        case 'creator-create-interface':
                            creator.editInterface(message.iface_kind, 'create', message.data);
                            break;
                        case 'creator-edit-interface':
                            creator.editInterface(message.iface_kind, 'edit', message.data);
                            break;
                        default:
                            msg.log(t`UnknownWebviewMessage ${JSON.stringify(message, null, 4)}`);
                    }
                });
            },
            error => {
                msg.error(t`UnableOpenQorusConfigPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    postMessage(message: any) {
        this.postMessages([message]);
    }

    postMessages(messages: any[]) {
        if (!this.panel) {
            return;
        }
        for (const message of messages) {
            this.panel.webview.postMessage(message);
        }
    }

    dispose() {
        if (this.panel) {
            this.panel.dispose();
            return true;
        }
        return false;
    }

    setCurrentProjectFolder(project_folder: string | undefined) {
        this.postMessage({
            action: 'current-project-folder',
            folder: project_folder,
        });
    }

    setActiveQorusInstance(url: string | null) {
        let qorus_instance = null;
        if (url) {
            qorus_instance = tree.getQorusInstance(url);
        }
        this.postMessage({
            action: 'current-qorus-instance',
            qorus_instance: qorus_instance,
        });
    }

    private setActiveTab(tab?: string) {
        if (!tab) {
            return;
        }
        this.postMessage({
            action: 'set-active-tab',
            tab,
        });
    }
}

export const qorus_webview = new QorusWebview();
