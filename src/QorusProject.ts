import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { qorus_webview } from './QorusWebview';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { tree } from './QorusTree';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { project_template } from './qorus_project_template';

export const config_filename = 'qorusproject.json';


export class QorusProject {
    private project_folder: string;
    private project_code_info: QorusProjectCodeInfo;

    constructor(project_folder: string) {
        this.project_folder = project_folder;
        this.project_code_info = new QorusProjectCodeInfo(this);
    }

    get config_file(): string {
        return path.join(this.project_folder, config_filename);
    }

    get code_info(): QorusProjectCodeInfo {
        return this.project_code_info;
    }

    get folder(): string {
        return path.dirname(this.config_file);
    }

    configFileExists(): boolean {
        return fs.existsSync(this.config_file);
    }

    validateConfigFileAndDo(onSuccess: Function, onError?: Function) {
        if (!this.configFileExists()) {
            return;
        }

        try {
            const file_content = fs.readFileSync(this.config_file);
            const file_data = JSON.parse(file_content.toString());

            if (!file_data.source_directories) {
                file_data.source_directories = [];
                this.writeConfig(file_data);
            }

            for (let dir of file_data.source_directories) {
                if (!fs.existsSync(path.join(this.folder, dir))) {
                    msg.error(t`DirInConfigDoesNotExist ${dir}`);
                    if (onError) {
                        onError();
                    }
                    return;
                }
            }

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

    createConfigFileIfNotExists() {
        if (!this.configFileExists()) {
            fs.writeFileSync(this.config_file, JSON.stringify(project_template, null, 4) + '\n');
            msg.info(t`ProjectConfigHasBeenInitialized`);
        }
    }

    addSourceDir() {
        this.validateConfigFileAndDo(file_data => {
            vscode.window.showOpenDialog({
                canSelectFiles: false,
                canSelectFolders: true,
                defaultUri: vscode.Uri.file(this.folder)
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

    removeSourceDir(dir: string) {
        this.validateConfigFileAndDo(file_data => {
            const index = file_data.source_directories.indexOf(dir);
            if (index > -1) {
                file_data.source_directories.splice(index, 1);
                this.writeConfig(file_data);
            }
        });
    }

    getConfigForWebview() {
        this.createConfigFileIfNotExists();
        this.validateConfigFileAndDo(file_data => {
            qorus_webview.postMessage({
                action: 'config-return-data',
                data: QorusProject.file2data(file_data)
            });
        });
    }

    updateConfigFromWebview(msg_data) {
        const file_data = QorusProject.data2file(msg_data);
        tree.reset(file_data.qorus_instances);
        this.writeConfig(file_data);
    }

    private writeConfig(file_data: any) {
        fs.writeFileSync(this.config_file, JSON.stringify(file_data, null, 4) + '\n');
        qorus_webview.postMessage({
            action: 'config-return-data',
            data: QorusProject.file2data(file_data)
        });
    }

    static file2data(file_data?: any): any {
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

    static data2file(data: any): any {
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

    constructor() {
        for (const workspace_folder of vscode.workspace.workspaceFolders || []) {
            this.getProject(workspace_folder.uri);
        }
    }

    updateCurrentWorkspaceFolder(uri?: vscode.Uri): boolean {
        const project_folder: string | undefined = this.getProjectFolder(uri, false);

        const has_changed: boolean = this.current_project_folder != project_folder;
        if (has_changed) {
            this.current_project_folder = project_folder;
            qorus_webview.setCurrentProjectFolder(project_folder);
        }
        return has_changed || !this.current_project_folder;
    }

    validateConfigFileAndDo(onSuccess: Function, onError?: Function, uri?: vscode.Uri) {
        const project = this.getProject(uri);
        project && project.validateConfigFileAndDo(onSuccess, onError);
    }

    getProject(uri?: vscode.Uri): QorusProject | undefined {
        const project_folder: string | undefined = this.getProjectFolder(uri);
        if (!project_folder) {
            return undefined;
        }
        if (!(project_folder in this.projects)) {
            this.projects[project_folder] = new QorusProject(project_folder);
        }
        return this.projects[project_folder];
    }

    updateCodeInfo() {
        for (let project_folder in this.projects) {
            this.projects[project_folder].code_info.update();
        }
    }

    currentProjectCodeInfo(): QorusProjectCodeInfo | undefined {
        const current_project = this.getProject();
        return current_project && current_project.code_info;
    }

    private getProjectFolder(uri?: vscode.Uri, use_current: boolean = true): string | undefined {
        if (!uri && use_current && this.current_project_folder) {
            return this.current_project_folder;
        }

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
