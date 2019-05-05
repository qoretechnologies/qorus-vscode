import * as vscode from 'vscode';
import * as path from 'path';
import * as msg from './qorus_message';
import { t, gettext } from 'ttag';
import { projects, QorusProject, config_filename } from './QorusProject';
import { releaser } from './QorusRelease';
import { deleter } from './QorusDelete';
import { creator } from './QorusCreate';


class QorusWebview {
    private panel: vscode.WebviewPanel | undefined = undefined;
    private config_file_watcher: vscode.FileSystemWatcher | undefined = undefined;
    private message_on_config_file_change: boolean = true;

    open(active_tab?: string, opening_uri?: vscode.Uri) {
        if(this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            this.setActiveTab(active_tab);
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
                        enableScripts: true
                    }
                );
                this.panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);
                this.setActiveTab(active_tab);

                this.config_file_watcher = vscode.workspace.createFileSystemWatcher('**/' + config_filename);
                this.message_on_config_file_change = true;
                this.config_file_watcher.onDidChange(() => {
                    if (!this.message_on_config_file_change) {
                        this.message_on_config_file_change = true;
                        return;
                    }
                    msg.warning(t`ProjectConfigFileHasChangedOnDisk`);
                    this.panel.webview.postMessage({
                        action: 'config-changed-on-disk'
                    });
                });

                this.panel.onDidDispose(() => {
                    this.dispose();
                });

                this.panel.webview.onDidReceiveMessage(message => {
                    let project: QorusProject;
                    if (message.action.substr(0, 7) == 'config-') {
                        project = projects.getProject();
                        if (!project) {
                            return;
                        }
                    }

                    switch (message.action) {
                        case 'get-text':
                            this.panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id)
                            });
                            break;
                        case 'get-opening-path':
                            this.panel.webview.postMessage({
                                action: 'return-opening-path',
                                path: opening_uri ? opening_uri.fsPath : t`Unknown`
                            });
                            break;
                        case 'config-get-data':
                            project.getConfigForWebview(this.panel.webview);
                            break;
                        case 'config-update-data':
                            this.message_on_config_file_change = false;
                            project.updateConfigFromWebview(message.data);
                            break;
                        case 'config-add-dir':
                            this.message_on_config_file_change = false;
                            project.addSourceDir(this.panel.webview);
                            break;
                        case 'config-remove-dir':
                            this.message_on_config_file_change = false;
                            project.removeSourceDir(message.dir, this.panel.webview);
                            break;
                        case 'get-interfaces':
                            deleter.getInterfaces(message.iface_kind, message.columns, this.panel.webview);
                            break;
                        case 'delete-interfaces':
                            deleter.deleteInterfaces(message.iface_kind, message.ids, this.panel.webview);
                            break;
                        case 'release-get-branch':
                            releaser.makeRelease(this.panel.webview);
                            break;
                        case 'release-get-commits':
                            releaser.getCommits(this.panel.webview, message.filters);
                            break;
                        case 'release-get-diff':
                            releaser.getDiff(this.panel.webview, message.commit);
                            break;
                        case 'release-create-package':
                            releaser.createPackage(this.panel.webview, message.full);
                            break;
                        case 'release-deploy-package':
                            releaser.deployPackage(this.panel.webview);
                            break;
                        case 'release-get-package':
                            releaser.getPackage(this.panel.webview);
                            break;
                        case 'release-save-package':
                            releaser.savePackage(this.panel.webview);
                            break;
                        case 'creator-get-object_names':
                            creator.getProjectObjectNames(message.object_type, this.panel.webview, opening_uri);
                            break;
                    }
                });
            },
            error => {
                msg.error(t`UnableOpenQorusConfigPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    dispose() {
        this.panel = undefined;
        if (this.config_file_watcher) {
            this.config_file_watcher.dispose();
        }
    }

    private setActiveTab(active_tab?: string) {
        if (!active_tab || !this.panel) {
            return;
        }
        this.panel.webview.postMessage({
            action: 'set-active-tab',
            active_tab: active_tab
        });
    }
}

export const webview = new QorusWebview();
