import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { tree } from './QorusTree';
import * as msg from './qorus_message';
import { t, gettext } from 'ttag';
import { project_template } from './qorus_project_template';

export const config_filename = 'qorusproject.json';


export class QorusProject {
    private config_file: string;
    private config_panel: vscode.WebviewPanel | undefined = undefined;
    private message_on_config_file_change: boolean = true;

    constructor(project_folder: string) {
        this.config_file = path.join(project_folder, config_filename);
    }

    exists(): boolean {
        return fs.existsSync(this.config_file);
    }

    projectFolder(): string {
        return path.dirname(this.config_file);
    }

    validateConfigFileAndDo(onSuccess: Function, onError?: Function) {
        if (!fs.existsSync(this.config_file)) {
            return;
        }

        try {
            const file_content = fs.readFileSync(this.config_file);
            const file_data = JSON.parse(file_content.toString());

            validator.validateModel(file_data, 'qorus_config').then(
                result => {
                    if (result.errors == undefined || result.errors.length == 0) {
                        onSuccess(file_data);
                    }
                    else {
                        msg.error(result.humanReadable().toString());
                        if (onError) {
                            onError();
                        }
                    }
                },
                error => {
                    msg.error(t`SwaggerValidatorError ${JSON.stringify(error)}`);
                }
            );
        } catch (error) {
            msg.error(JSON.stringify(error, null, 4));
        }
    }

    manageProjectConfig() {
        if(this.config_panel) {
            this.config_panel.reveal(vscode.ViewColumn.One);
            return;
        }
        if (!fs.existsSync(this.config_file)) {
            fs.writeFileSync(this.config_file, JSON.stringify(project_template, null, 4) + '\n');
            msg.info(t`ProjectConfigHasBeenInitialized`);
        }
        this.validateConfigFileAndDo(this.manageProjectConfigImpl.bind(this));
    }

    private manageProjectConfigImpl() {
        const web_path = path.join(__dirname, '..', 'dist');
        vscode.workspace.openTextDocument(path.join(web_path, 'project_config.html')).then(
            doc => {
                this.config_panel = vscode.window.createWebviewPanel(
                    'qorusConfig',
                    t`QorusConfigTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                this.config_panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);

                const config_file_watcher = vscode.workspace.createFileSystemWatcher('**/' + config_filename);
                this.message_on_config_file_change = true;
                config_file_watcher.onDidChange(() => {
                    if (!this.message_on_config_file_change) {
                        this.message_on_config_file_change = true;
                        return;
                    }
                    msg.warning(t`ProjectConfigFileHasChangedOnDisk`);
                    this.config_panel.webview.postMessage({
                        action: 'config-changed-on-disk'
                    });
                });

                this.config_panel.webview.onDidReceiveMessage(message => {
                    switch (message.action) {
                        case 'get-data':
                            this.validateConfigFileAndDo(file_data => {
                                this.config_panel.webview.postMessage({
                                    action: 'return-data',
                                    data: QorusProject.file2data(file_data)
                                });
                            });
                            break;
                        case 'get-text':
                            this.config_panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id)
                            });
                            break;
                        case 'update-data':
                            const file_data = QorusProject.data2file(message.data);
                            tree.reset(file_data.qorus_instances);
                            this.writeConfig(file_data, false);
                            break;
                        case 'add-source-dir':
                            this.addSourceDir();
                            break;
                        case 'remove-source-dir':
                            this.removeSourceDir(message.dir);
                            break;
                    }
                });

                this.config_panel.onDidDispose(() => {
                    this.config_panel = undefined;
                    config_file_watcher.dispose();
                });
            },
            error => {
                msg.error(t`UnableOpenConfigPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    private addSourceDir() {
        this.validateConfigFileAndDo(file_data => {
            vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                defaultUri: vscode.Uri.file(this.projectFolder())
            }).then(uris => {
                if (!uris || !uris.length) {
                    return;
                }
                const full_dir = uris[0].fsPath;
                const dir = vscode.workspace.asRelativePath(full_dir);
                if (dir == full_dir) {
                    msg.error(t`NotProjectSubdir ${dir}`);
                    return;
                }
                if (file_data.source_directories.indexOf(dir) > -1) {
                    msg.error(t`DirAlreadyInConfig ${dir}`);
                    return;
                }
                file_data.source_directories.push(dir);
                this.writeConfig(file_data);
            });
        });
    }

    private removeSourceDir(dir) {
        this.validateConfigFileAndDo(file_data => {
            const index = file_data.source_directories.indexOf(dir);
            if (index > -1) {
                file_data.source_directories.splice(index, 1);
                this.writeConfig(file_data);
            }
        });
    }

    private writeConfig(file_data: any, send_message: boolean = true) {
        this.message_on_config_file_change = false;
        fs.writeFileSync(this.config_file, JSON.stringify(file_data, null, 4) + '\n');
        if (send_message) {
            this.config_panel.webview.postMessage({
                action: 'return-data',
                data: QorusProject.file2data(file_data)
            });
        }
    }

    private static file2data(file_data?: any): any {
        if (!file_data) {
            return {
                qorus_instances: [],
                source_directories: []
            };
        }

        let qorus_instances: any[] = [];
        let i: number = 0;
        for (let env_name in file_data.qorus_instances) {
            const env_id = i++;
            qorus_instances.push({
                id: env_id,
                name: env_name,
                qoruses: []
            });
            let ii: number = 0;
            for (let qorus of file_data.qorus_instances[env_name]) {
                const qorus_id = ii++;
                qorus_instances[env_id].qoruses.push({
                    id: qorus_id,
                    name: qorus.name,
                    url: qorus.url,
                    version: qorus.version,
                    urls: []
                });
                if (qorus.custom_urls) {
                    let iii: number = 0;
                    for (let url of qorus.custom_urls) {
                        const url_id = iii++;
                        qorus_instances[env_id].qoruses[qorus_id].urls.push({
                            id: url_id,
                            name: url.name,
                            url: url.url
                        });
                    }
                }
            }
        }

        return {
            qorus_instances: qorus_instances,
            source_directories: file_data.source_directories
        };
    }

    private static data2file(data: any): any {
        let file_data: any = {
            qorus_instances: {},
            source_directories: data.source_directories
        };

        for (let env_id in data.qorus_instances) {
            const env = data.qorus_instances[env_id];
            file_data.qorus_instances[env.name] = [];
            for (let qorus_id in env.qoruses) {
                const qorus: any = env.qoruses[qorus_id];
                let qorus_data: any = {
                    name: qorus.name,
                    url: qorus.url,
                    custom_urls: []
                };
                if (qorus.version) {
                    qorus_data.version = qorus.version;
                }
                for (let url_id in qorus.urls) {
                    const url = qorus.urls[url_id];
                    qorus_data.custom_urls.push({
                        name: url.name,
                        url: url.url
                    });
                }
                file_data.qorus_instances[env.name].push(qorus_data);
            }
        }
        return file_data;
    }
}

class QorusProjects {

    private current_project_folder: string | undefined = undefined;
    private projects: any = {};

    updateCurrentWorkspaceFolder(uri?: vscode.Uri): boolean {
        const project_folder: string | undefined = QorusProjects.getProjectFolder(uri);

        const has_changed: boolean = this.current_project_folder != project_folder;
        if (has_changed) {
            this.current_project_folder = project_folder;
        }
        return has_changed || !this.current_project_folder;
    }

    validateConfigFileAndDo(onSuccess: Function, onError?: Function, uri?: vscode.Uri) {
        const project = this.getQorusProject(uri);
        project && project.validateConfigFileAndDo(onSuccess, onError);
    }

    manageProjectConfig(uri: vscode.Uri) {
        const project = this.getQorusProject(uri);
        project && project.manageProjectConfig();
    }

    getQorusProject(uri?: vscode.Uri): QorusProject | undefined {
        const project_folder: string | undefined = QorusProjects.getProjectFolder(uri);
        if (!project_folder) {
            return undefined;
        }
        if (!(project_folder in this.projects)) {
            this.projects[project_folder] = new QorusProject(project_folder);
        }
        return this.projects[project_folder];
    }

    private static getProjectFolder(uri?: vscode.Uri): string | undefined {
        if (!vscode.workspace) {
            return undefined;
        }

        if (!uri) {
            const editor = vscode.window.activeTextEditor;
            uri = editor ? editor.document.uri : undefined;
        }

        if (!uri) {
            if (vscode.workspace.workspaceFolders.length == 1) {
                return vscode.workspace.workspaceFolders[0].uri.fsPath;
            }
            return undefined;
        }

        const workspace_folder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(uri);
        return workspace_folder ? workspace_folder.uri.fsPath : undefined;
    }
}

import { Handler } from 'swagger-object-validator';
export const validator = new Handler(path.join(__dirname, '..', 'config/qorus_project_definition.json'));

export const projects = new QorusProjects();
