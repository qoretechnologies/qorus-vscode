import * as fs from 'fs';
import * as path from 'path';
import { t } from 'ttag';
import * as urlParser from 'url-parse';
import * as vscode from 'vscode';

import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { instance_tree } from './QorusInstanceTree';
import { QorusProjectJavaConfig } from './QorusProjectJavaConfig';
import { qorus_webview } from './QorusWebview';
import { InterfaceInfo } from './qorus_creator/InterfaceInfo';
import * as msg from './qorus_message';
import { project_template } from './qorus_project_template';

export const config_filename = 'qorusproject.json';

export class QorusProject {
    private project_folder: string;
    private project_code_info: QorusProjectCodeInfo;
    private java_config: QorusProjectJavaConfig;

    constructor(project_folder: string) {
        this.project_folder = project_folder;
        this.project_code_info = new QorusProjectCodeInfo(this);

        this.java_config = new QorusProjectJavaConfig(project_folder);
        this.fixJavaClasspathFile();
        this.fixJavaProjectFile();
    }

    get config_file(): string {
        return path.join(this.project_folder, config_filename);
    }

    get code_info(): QorusProjectCodeInfo {
        return this.project_code_info;
    }

    get interface_info(): InterfaceInfo {
        return this.project_code_info.interface_info;
    }

    get folder(): string {
        return this.project_folder;
    }

    configFileExists(): boolean {
        return fs.existsSync(this.config_file);
    }

    relativeDirPath = dir =>
        dir === this.project_folder ? '.' : vscode.workspace.asRelativePath(dir, false)

    validateConfigFileAndDo(onSuccess: Function, onError?: Function) {
        if (!this.configFileExists()) {
            this.createConfigFileIfNotExists();
        }

        try {
            const file_content = fs.readFileSync(this.config_file);
            const file_data = JSON.parse(file_content.toString());

            let any_dir_change: boolean = false;
            let fixed_dirs: any = {};
            for (let dir of file_data.source_directories || []) {
                const possibly_fixed_dir = this.relativeDirPath(dir);
                if (fs.existsSync(path.join(this.folder, possibly_fixed_dir))) {
                    fixed_dirs[possibly_fixed_dir] = true;
                    if (possibly_fixed_dir !== dir) {
                        msg.log(t`FixedDirInConfig ${dir} ${possibly_fixed_dir}`);
                        any_dir_change = true;
                    }
                }
                else {
                    msg.log(t`InvalidDirInConfig ${dir}`);
                    any_dir_change = true;
                }
            }
            if (any_dir_change) {
                file_data.source_directories = Object.keys(fixed_dirs);
                this.writeConfig(file_data);
            }

            validator.validateModel(file_data, 'qorus_config').then(
                result => {
                    if (!result.errors || result.errors.length == 0) {
                        onSuccess(file_data);
                    } else {
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

    private createConfigFileIfNotExists() {
        if (!this.configFileExists()) {
            fs.writeFileSync(this.config_file, JSON.stringify(project_template, null, 4) + '\n');
            msg.info(t`ProjectConfigHasBeenInitialized`);
            this.fixJavaClasspathFile();
            this.fixJavaProjectFile();
        }
    }

    fixJavaClasspathFile() {
        if (!this.configFileExists()) {
            return;
        }
        if (this.java_config && !this.java_config.loadClasspath()) {
            this.java_config.fixClasspath();
            this.java_config.writeClasspathFile();
        }
    }

    fixJavaProjectFile() {
        if (!this.configFileExists()) {
            return;
        }
        if (this.java_config && !this.java_config.loadProject()) {
            this.java_config.fixProject();
            this.java_config.writeProjectFile();
        }
    }

    private addSourceDir(dir) {
        this.validateConfigFileAndDo(file_data => {
            if (file_data.source_directories.indexOf(dir) === -1) {
                file_data.source_directories.push(dir);
                this.writeConfig(file_data);
            }
        });
    }

    addSourceDirWithFilePicker() {
        this.validateConfigFileAndDo(file_data => {
            vscode.window
                .showOpenDialog({
                    canSelectFiles: false,
                    canSelectFolders: true,
                    defaultUri: vscode.Uri.file(this.folder),
                })
                .then(uris => {
                    if (!uris || !uris.length) {
                        return;
                    }
                    const full_dir = uris[0].fsPath;
                    const dir = vscode.workspace.asRelativePath(full_dir, false);
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
                data: QorusProject.file2data(file_data),
            });
        });
    }

    updateConfigFromWebview(msg_data) {
        const file_data = this.data2file(msg_data);
        instance_tree.reset(file_data.qorus_instances);
        this.writeConfig(file_data);
    }

    dirForTypePath = type_path => {
        if (['/', '\\'].includes(type_path[0])) {
            type_path = type_path.substr(1);
        }
        const relative_dir = path.dirname(type_path);
        const dir = path.join(this.project_folder, relative_dir);

        if (!fs.existsSync(dir)) {
            try {
                fs.mkdirSync(dir, {recursive: true, mode: 0o755});
                this.addSourceDir(relative_dir);
            }
            catch (e) {
                msg.error(t`FailedCreateDir ${dir}`);
                msg.log(e);
                return undefined;
            }
        }
        return dir;
    }

    private writeConfig(file_data: any) {
        const removeSubdirs = dirs => {
            const isSubdir = (dir1, dir2) =>
                dir1.search(dir2) === 0 && ['/', '\\'].includes(dir1[dir2.length]);

            for (let i = 0; i < dirs.length - 1; i++) {
                for (let ii = i + 1; ii < dirs.length; ii++) {
                    if (isSubdir(dirs[i], dirs[ii])) {
                        dirs.splice(i, 1);
                        return removeSubdirs(dirs);
                    }
                    if (isSubdir(dirs[ii], dirs[i])) {
                        dirs.splice(ii, 1);
                        return removeSubdirs(dirs);
                    }
                }
            }
            return dirs;
        }

        file_data.source_directories = removeSubdirs(file_data.source_directories);
        fs.writeFileSync(this.config_file, JSON.stringify(file_data, null, 4) + '\n');

        qorus_webview.postMessage({
            action: 'config-return-data',
            data: QorusProject.file2data(file_data),
        });
    }

    static file2data(file_data?: any): any {
        if (!file_data) {
            return {
                qorus_instances: [],
                source_directories: [],
            };
        }

        let qorus_instances: any[] = [];
        let i: number = 0;
        for (let env_name in file_data.qorus_instances) {
            const env_id = i++;
            qorus_instances.push({
                id: env_id,
                name: env_name,
                qoruses: [],
            });
            let ii: number = 0;
            for (let qorus of file_data.qorus_instances[env_name]) {
                const qorus_id = ii++;
                qorus_instances[env_id].qoruses.push({
                    id: qorus_id,
                    name: qorus.name,
                    url: qorus.url,
                    safe_url: this.createSafeUrl(qorus.url),
                    version: qorus.version,
                    urls: [],
                });
                if (qorus.custom_urls) {
                    let iii: number = 0;
                    for (let url of qorus.custom_urls) {
                        const url_id = iii++;
                        qorus_instances[env_id].qoruses[qorus_id].urls.push({
                            id: url_id,
                            name: url.name,
                            url: url.url,
                            safe_url: this.createSafeUrl(url.url),
                        });
                    }
                }
            }
        }

        return {
            qorus_instances: qorus_instances,
            source_directories: file_data.source_directories,
        };
    }

    private data2file(data: any): any {
        let fixed_source_dirs = {};
        data.source_directories.forEach(dir => {
            dir = this.relativeDirPath(dir);
            if (fs.existsSync(path.join(this.folder, dir))) {
                fixed_source_dirs[dir] = true;
            }
        });

        let file_data: any = {
            qorus_instances: {},
            source_directories: Object.keys(fixed_source_dirs)
        };

        for (let env_id in data.qorus_instances) {
            const env = data.qorus_instances[env_id];
            file_data.qorus_instances[env.name] = [];
            for (let qorus_id in env.qoruses) {
                const qorus: any = env.qoruses[qorus_id];
                let qorus_data: any = {
                    name: qorus.name,
                    url: qorus.url,
                    custom_urls: [],
                };
                if (qorus.version) {
                    qorus_data.version = qorus.version;
                }
                for (let url_id in qorus.urls) {
                    const url = qorus.urls[url_id];
                    qorus_data.custom_urls.push({
                        name: url.name,
                        url: url.url,
                    });
                }
                file_data.qorus_instances[env.name].push(qorus_data);
            }
        }
        return file_data;
    }

    static createSafeUrl(url: string): string {
        if (!url) {
            return t`WrongUrl`;
        }
        // Parse the URL
        const { protocol, slashes, host, query, pathname, username, hash }: any = urlParser(url);
        // Build the safe URL without password
        return `${protocol}${slashes ? '//' : ''}${username || ''}${
            username ? '@' : ''
        }${host}${pathname}${query}${hash}`;
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
        if (!this.projects[project_folder]) {
            this.projects[project_folder] = new QorusProject(project_folder);
        }
        return this.projects[project_folder];
    }

    projectCodeInfo(file_path): QorusProjectCodeInfo | undefined {
        return this.getProject(vscode.Uri.file(file_path))?.code_info;
    }

    currentProjectCodeInfo(): QorusProjectCodeInfo | undefined {
        return this.getProject()?.code_info;
    }

    currentInterfaceInfo(): InterfaceInfo | undefined {
        const code_info = this.currentProjectCodeInfo();
        return code_info && code_info.interface_info;
    }

    private getProjectFolder(uri?: vscode.Uri, use_current: boolean = true): string | undefined {
        if (!uri && use_current && this.current_project_folder) {
            return this.current_project_folder;
        }

        const workspace_folders = vscode.workspace?.workspaceFolders || [];

        switch (workspace_folders.length) {
            case 0:
                return undefined;
            case 1:
                return workspace_folders[0].uri.fsPath;
            default:
                if (!uri) {
                    const editor = vscode.window.activeTextEditor;
                    uri = editor?.document.uri;
                }
                if (uri) {
                    const workspace_folder = vscode.workspace.getWorkspaceFolder(uri);
                    return workspace_folder?.uri.fsPath;
                }
        }

        return undefined;
    }
}

import { Handler } from 'swagger-object-validator';
export const validator = new Handler(path.join(__dirname, '..', 'config/qorus_project_definition.json'));

export const projects = new QorusProjects();
