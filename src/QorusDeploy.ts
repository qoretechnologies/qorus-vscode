import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import { projects } from './QorusProject';
import { qorus_request, QorusRequestTexts } from './QorusRequest';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { filesInDir, isDeployable, isService, isVersion3 } from './qorus_utils';


class QorusDeploy {

    deployCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        const file_path = editor ? editor.document.fileName : '';
        const code = editor ? editor.document.getText() : '';

        if (!file_path || !code) {
            msg.error(t`NothingToDeploy`);
            return;
        }

        const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

        if (!isDeployable(file_path)) {
            msg.error(t`NotDeployableFile ${file_relative_path}`);
            return;
        }

        if (file_path === file_relative_path) {
            msg.error(t`CannotLoadFileOutsideWorkspaceFolder ${file_path}`);
            return;
        }

        this.deployFileAndPairFile(editor.document.uri);
    }

    deployFile(uri: vscode.Uri) {
        const file_path: string = uri.fsPath;
        if (!isDeployable(file_path)) {
            msg.error(t`NotDeployableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        this.deployFileAndPairFile(uri);
    }

    private deployFileAndPairFile = (uri: vscode.Uri) => {
        const file_path: string = uri.fsPath;
        const project = projects.getProject(uri);
        const code_info = project && project.code_info;
        const pair_file_path = code_info.pairFile(file_path);

        if (pair_file_path) {
            this.doDeploy([file_path, pair_file_path]);
        }
        else {
            this.doDeploy([file_path]);
        }

    }

    deployDir(uri: vscode.Uri) {
        const dir: string = uri.fsPath;
        msg.log(t`DeployingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        const files: string[] = filesInDir(dir, isDeployable);
        this.doDeploy(files);
    }

    deployPackage(file: string): Thenable<boolean> {
        return this.doDeploy([file], true);
    }

    // returns true if the process got to the stage of checking the result
    // returns false if the process failed earlier
    private doDeploy(file_paths: string[], is_release: boolean = false): Thenable<boolean> {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            return Promise.resolve(false);
        }

        let url: string = active_instance.url;
        if (isVersion3(active_instance.version)) {
            if (is_release) {
                msg.error(t`PackageDeploymentNotSupportedForQorus3`);
                return Promise.resolve(false);
            }
            else {
                url += '/deployment';
            }
        } else {
            url += '/api/latest/development/' + (is_release ? 'release' : 'deploy');
        }

        msg.log(t`FilesToDeploy`);
        let data: object[] = [];
        if (is_release) {
            const file = file_paths[0];
            msg.log(`    ${file}`);
            const file_content = fs.readFileSync(file);
            const buffer: Buffer = Buffer.from(file_content);
            data = [{
                file_name: path.basename(file),
                file_content: buffer.toString('base64')
            }];
        }
        else {
            QorusDeploy.prepareData(file_paths, data);
        }

        msg.log(t`DeploymentHasStarted ${active_instance.name} ${active_instance.url}`);
        msg.log(t`options` + ': ' + JSON.stringify(vscode.workspace.getConfiguration('qorusDeployment')));

        const options = {
            method: 'POST',
            uri: `${url}`,
            strictSSL: false,
            body: {
                files: data,
                options: vscode.workspace.getConfiguration('qorusDeployment'),
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };

        const texts: QorusRequestTexts = {
            error: t`DeploymentStartFailed`,
            running: t`DeploymentRunning`,
            cancelling: t`CancellingDeployment`,
            cancellation_failed: t`DeploymentCancellationFailed`,
            checking_progress: t`checkingDeploymentProgress`,
            finished_successfully: t`DeploymentFinishedSuccessfully`,
            cancelled: t`DeploymentCancelled`,
            failed: t`DeploymentFailed`,
            checking_status_failed: t`CheckingDeploymentStatusFailed`,
        };

        return qorus_request.doRequestAndCheckResult(options, texts);
    }

    private static prepareData(files: string[], data: object[]) {
        for (let file_path of files) {
            const file_relative_path = vscode.workspace.asRelativePath(file_path, false);
            msg.log(`    ${file_relative_path}`);

            if (!fs.existsSync(file_path)) {
                msg.error(`fileDoesNotExist ${file_path}`);
                return;
            }
            const file_content = fs.readFileSync(file_path);
            const buffer: Buffer = Buffer.from(file_content);
            data.push({
                'file_name': file_relative_path.replace(/\\/g, '/'),
                'file_content': buffer.toString('base64')
            });

            if (isService(file_path)) {
                const resources: string[] =
                    QorusDeploy.getResources(file_content.toString(), path.dirname(file_path));
                QorusDeploy.prepareData(resources, data);
            }
        }
    }

    private static getResources(file_content: string, dir_path: string): string[] {
        let resources: string[] = [];
        for (let line of file_content.split(/\r?\n/)) {
            if (line.search(/^#\s*resource\s*:\s*(.*\S)\s*$/) > -1) {
                resources = resources.concat(RegExp.$1.split(/\s+/));
            }
        }
        if (resources.length) {
            resources = resources.map(basename => path.join(dir_path, basename));
            const pattern: string = resources.length == 1 ? `${resources}` : `{${resources}}`;
            return glob.sync(pattern, {nodir: true});
        }
        return [];
    }
}

export const deployer = new QorusDeploy();
