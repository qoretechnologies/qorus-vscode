import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import { tree } from './QorusTree';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { project_template } from './qorus_project_template';

export const config_filename = 'qorusproject.json';


class QorusProject {
    private config_file: string;
    private config_panel: vscode.WebviewPanel | undefined = undefined;

    constructor(project_folder: string) {
        this.config_file = path.join(project_folder, config_filename);
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
                    msg.error(t`swaggerValidatorError ${JSON.stringify(error)}`);
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
            msg.info(t`projectConfigHasBeenInitialized`);
        }
        this.validateConfigFileAndDo(this.manageProjectConfigImpl.bind(this));
    }

    private manageProjectConfigImpl(file_data: any) {
        const web_path = path.join(__dirname, '..', 'web');
        vscode.workspace.openTextDocument(path.join(web_path, 'qorus_project_config', 'project_config.html')).then(
            doc => {
                const texts = {
                    html: {
                        environments: t`labelEnvironments`,
                        qorusInstances: t`labelQorusInstances`,
                        name: t`labelName`,
                        url: t`labelUrl`,
                        urls: t`labelUrls`,
                        buttonOk: t`buttonOk`,
                        buttonCancel: t`buttonCancel`
                    },
                    js: {
                        addEnvironment: t`labelAddEnvironment`,
                        qorusInstancesIn: t`labelQorusInstancesIn`,
                        addUrl: t`labelAddUrl`,
                        editUrl: t`labelEditUrl`,
                        editMainUrl: t`labelEditMainUrl`,
                        mainUrl: t`labelMainUrl`,
                        urls: t`labelUrls`,
                        urlsOf: t`labelUrlsOf`,
                        customUrls: t`labelCustomUrls`,
                        remove: t`labelRemove`,
                        edit: t`labelEdit`,
                        addQorus: t`labelAddQorus`,
                        editQorus: t`labelEditQorus`,
                        editEnvironment: t`labelEditEnvironment`,
                        confirmRemoveEnv: t`confirmRemoveEnv`,
                        confirmRemoveQorus: t`confirmRemoveQorus`,
                        confirmRemoveUrl: t`confirmRemoveUrl`
                    }
                }

                let html_src: string =  doc.getText().replace(/{{ path }}/g, web_path);
                Object.keys(texts.html).map(k => {
                    html_src = html_src.replace(new RegExp(`{{ ${k} }}`, 'g'), texts.html[k]);
                });

                this.config_panel = vscode.window.createWebviewPanel(
                    'qorusConfig',
                    t`qorusConfigTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                this.config_panel.webview.html = html_src;

                this.config_panel.webview.onDidReceiveMessage(message => {
                    switch (message.action) {
                        case 'get-data':
                            (<vscode.WebviewPanel>this.config_panel).webview.postMessage({
                                action: 'set-data',
                                data: QorusProject.file2web(file_data),
                                texts: texts.js
                            });
                            break;
                        case 'update-data':
                            const data = QorusProject.web2file(message.data);
                            tree.reset(data);
                            fs.writeFileSync(this.config_file, JSON.stringify(data, null, 4) + '\n');
                            break;
                    }
                });

                this.config_panel.onDidDispose(() => {
                    this.config_panel = undefined;
                });
            },
            error => {
                msg.error(t`unableOpenConfigPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    private static file2web(file_data?: any): Array<any> {
        if (!file_data) {
            return [];
        }

        let data: Array<any> = [];
        let i: number = 0;
        for (let env_name in file_data.qorus_instances) {
            const env_id = i++;
            data.push({
                id: env_id,
                name: env_name,
                qoruses: []
            });
            let ii: number = 0;
            for (let qorus of file_data.qorus_instances[env_name]) {
                const qorus_id = ii++;
                data[env_id].qoruses.push({
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
                        data[env_id].qoruses[qorus_id].urls.push({
                            id: url_id,
                            name: url.name,
                            url: url.url
                        });
                    }
                }
            }
        }
        return data;
    }

    private static web2file(data: any): any {
        let file_data: any = {qorus_instances: {}}
        for (let env_id in data) {
            let env = data[env_id];
            file_data.qorus_instances[env.name] = [];
            for (let qorus_id in env.qoruses) {
                let qorus: any = env.qoruses[qorus_id];
                let qorus_data: any = {
                    name: qorus.name,
                    url: qorus.url,
                    custom_urls: []
                };
                if (qorus.version) {
                    qorus_data.version = qorus.version;
                }
                for (let url_id in qorus.urls) {
                    let url = qorus.urls[url_id];
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

export class QorusProjects {

    private current_project_folder: string | undefined = undefined;
    private projects: any = {};

    updateCurrentWorkspaceFolder(uri?: vscode.Uri): boolean {
        const project_folder: string | undefined = QorusProjects.getProjectFolder(uri);

        let has_changed: boolean = this.current_project_folder != project_folder;
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

    private getQorusProject(uri?: vscode.Uri): QorusProject | undefined {
        const workspace_folder: string | undefined = QorusProjects.getProjectFolder(uri);
        if (!workspace_folder) {
            return undefined;
        }
        if (!(workspace_folder in this.projects)) {
            this.projects[workspace_folder] = new QorusProject(workspace_folder);
        }
        return this.projects[workspace_folder];
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
            return undefined;
        }

        const workspace_folder: vscode.WorkspaceFolder | undefined = vscode.workspace.getWorkspaceFolder(uri);
        return workspace_folder ? workspace_folder.uri.fsPath : undefined;
    }
}

export const projects = new QorusProjects();
import { Handler } from 'swagger-object-validator';
export const validator = new Handler(path.join(__dirname, '..', 'config/qorus_project_definition.json'));
