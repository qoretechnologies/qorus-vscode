import * as vscode from 'vscode';
import * as fs from 'fs';
import { project_template } from './qorus_project_template';


class QorusProject {

    private current_project_folder: string | undefined = undefined;

    updateCurrentWorkspaceFolder(uri?: vscode.Uri): boolean {
        const workspace_folder: vscode.WorkspaceFolder | undefined = uri
            ? vscode.workspace ? vscode.workspace.getWorkspaceFolder(uri) : undefined
            : this.getWorkspaceFolder();

        const project_folder: string | undefined = workspace_folder ? workspace_folder.uri.fsPath : undefined;

        let has_changed: boolean = this.current_project_folder != project_folder;
        if (has_changed) {
            this.current_project_folder = project_folder;
        }
        return has_changed || !this.current_project_folder;
    }

    getConfigFilePath(uri?: vscode.Uri): string | undefined {
        const workspace_folder: vscode.WorkspaceFolder | undefined = uri
            ? vscode.workspace ? vscode.workspace.getWorkspaceFolder(uri) : undefined
            : this.getWorkspaceFolder();

        if (workspace_folder) {
            const project_file = `${workspace_folder.uri.fsPath}/${config_filename}`;
            fs.access(project_file, (err) => {
                if (err) {
                    fs.writeFileSync(project_file, JSON.stringify(project_template, null, 4) + '\n');
                }
            });
            return project_file;
        }

        return undefined;
    }

    getConfigFileData(config_file_path: string): object {
        const file_content = fs.readFileSync(config_file_path);
        const file_data = JSON.parse(file_content.toString());
        return file_data;
    }

    private getWorkspaceFolder(uri?: vscode.Uri): vscode.WorkspaceFolder | undefined {
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
export const validator = new Handler('./config/qorus_project_definition.json');
