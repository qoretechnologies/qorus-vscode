import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { project_template } from './qorus_project_template';


export class QorusProject {

    private current_project_folder: string | undefined = undefined;

    updateCurrentWorkspaceFolder(uri?: vscode.Uri): boolean {
        const workspace_folder: vscode.WorkspaceFolder | undefined = uri
            ? vscode.workspace ? vscode.workspace.getWorkspaceFolder(uri) : undefined
            : QorusProject.getWorkspaceFolder();

        const project_folder: string | undefined = workspace_folder ? workspace_folder.uri.fsPath : undefined;

        let has_changed: boolean = this.current_project_folder != project_folder;
        if (has_changed) {
            this.current_project_folder = project_folder;
        }
        return has_changed || !this.current_project_folder;
    }

    static getConfigFileData(uri?: vscode.Uri): object | undefined {
        const config_file_path: string | undefined = QorusProject.getConfigFilePath(uri);
        if (!config_file_path || !fs.existsSync(config_file_path)) {
            return undefined;
        }
        const file_content = fs.readFileSync(<string>config_file_path);
        const file_data = JSON.parse(file_content.toString());
        return file_data;
    }

    static createProjectConfig(uri: vscode.Uri) {
        const config_file_path: string | undefined = QorusProject.getConfigFilePath(uri);
        if (!config_file_path) {
            return;
        }

        if (fs.existsSync(config_file_path)) {
            vscode.window.showWarningMessage(
                    t`projectConfigFileAlreadyExists ${config_file_path}`,
                    {title: t`buttonOk`, is_ok: true},
                    {title: t`buttonCancel`, isCloseAffordance: true})
            .then((button: any) => {
                if (button.is_ok) {
                    QorusProject.editProjectConfig(uri);
                }
            });
            return;
        }

        vscode.window.showInformationMessage(
                t`aboutToCreateProjectConfigFile ${config_file_path}`,
                {title: t`buttonOk`, is_ok: true},
                {title: t`buttonCancel`, isCloseAffordance: true})
        .then((button: any) => {
            if (button.is_ok) {
                fs.writeFileSync(config_file_path, JSON.stringify(project_template, null, 4) + '\n');
                QorusProject.editProjectConfig(uri);
                msg.info(t`projectConfigFileHasBeenCreated`);
            }
        });
    }

    static editProjectConfig(uri: vscode.Uri) {
        const config_file_path: string | undefined = QorusProject.getConfigFilePath(uri);
        if (!config_file_path) {
            return;
        }
        if (!fs.existsSync(config_file_path)) {
            vscode.window.showWarningMessage(
                    t`projectConfigFileDoesNotExist`,
                    {title: t`buttonOk`, is_ok: true},
                    {title: t`buttonCancel`, isCloseAffordance: true})
            .then((button: any) => {
                if (button.is_ok) {
                    fs.writeFileSync(config_file_path, JSON.stringify(project_template, null, 4) + '\n');
                    QorusProject.editProjectConfig(uri);
                    msg.info(t`projectConfigFileHasBeenCreated`);
                }
            });
            return;
        }

        vscode.workspace.openTextDocument(config_file_path).then(doc => vscode.window.showTextDocument(doc));
    }

    private static getConfigFilePath(uri?: vscode.Uri): string | undefined {
        const workspace_folder: vscode.WorkspaceFolder | undefined = uri
            ? vscode.workspace ? vscode.workspace.getWorkspaceFolder(uri) : undefined
            : this.getWorkspaceFolder();

        if (workspace_folder) {
             return `${workspace_folder.uri.fsPath}/${config_filename}`;
        }

        msg.error(t`unableToDetermineProjectPath`);
        return undefined;
    }

    private static getWorkspaceFolder(uri?: vscode.Uri): vscode.WorkspaceFolder | undefined {
        if (!vscode.workspace) {
            return undefined;
        }

        if (uri) {
            return vscode.workspace.getWorkspaceFolder(uri);
        }

        const editor = vscode.window.activeTextEditor;
        uri = editor ? editor.document.uri : undefined;

        return uri ? vscode.workspace.getWorkspaceFolder(uri) : undefined;
    }
}

export const project = new QorusProject();
export const config_filename = 'qorusproject.json';
import { Handler } from 'swagger-object-validator';
export const validator = new Handler(path.join(__dirname, '..', 'config/qorus_project_definition.json'));
