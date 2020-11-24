import * as vscode from 'vscode';
import * as path from 'path';
import * as urlJoin from 'url-join';
import * as fs from 'fs';
import * as glob from 'glob';

import { projects } from './QorusProject';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { qorus_request, QorusRequestTexts } from './QorusRequest';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { filesInDir, isDeployable, isVersion3, removeDuplicates } from './qorus_utils';


class QorusDeploy {

    private code_info: QorusProjectCodeInfo | undefined = undefined;

    private setCodeInfo = (paths: string[]): boolean => {
        if (!paths.length) {
            msg.error(t`NoFilesOrDirsSelected`);
            return false;
        }

        const folder0 = projects.getProjectFolder(paths[0]);
        if (!folder0) {
            msg.error(t`ProjectNotFound ${paths[0]}`);
            return false;
        }

        if (paths.some(file_or_dir => projects.getProjectFolder(file_or_dir) !== folder0)) {
            msg.error(t`SelectedFilesAndDirsNotFromOneProject`);
            return false;
        }

        this.code_info = projects.projectCodeInfo(paths[0]);
        return true;
    }

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

        if (!this.setCodeInfo([file_path])) {
            return;
        }

        this.doDeploy(this.code_info.getFilesOfReferencedObjects([file_path]));
    }

    deployFile(file_path: string) {
        if (!isDeployable(file_path)) {
            msg.error(t`NotDeployableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        if (!this.setCodeInfo([file_path])) {
            return;
        }

        this.doDeploy(this.code_info.getFilesOfReferencedObjects([file_path]));
    }

    deployDir(dir: string) {
        if (!this.setCodeInfo([dir])) {
            return;
        }

        msg.log(t`DeployingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        const files: string[] = filesInDir(dir, isDeployable);
        this.doDeploy(this.code_info.getFilesOfReferencedObjects(files));
    }

    deployFilesAndDirs = (paths: string[]) => {
        if (!this.setCodeInfo(paths)) {
            return;
        }

        let files = [];
        paths.forEach(file_or_dir => {
            if (fs.lstatSync(file_or_dir).isDirectory()) {
                files = [ ...files, ...filesInDir(file_or_dir, isDeployable)];
            } else {
                files.push(file_or_dir);
            }
        });

        this.doDeploy(this.code_info.getFilesOfReferencedObjects(removeDuplicates(files)));
    }

    // returns true if the process got to the stage of checking the result
    // returns false if the process failed earlier
    deployPackage(file: string): Thenable<boolean> {
        return this.doDeploy([file], true);
    }

    deployAllInterfaces() {
        const code_info: QorusProjectCodeInfo = this.code_info || projects.currentProjectCodeInfo();
        if (!code_info) {
            msg.error(t`QorusProjectNotSet`);
            return;
        }

        const ifaceKinds = [
            'connection', 'error', 'group', 'constant', 'event', 'function', 'queue', 'fsm', 'pipeline',
            'value-map', 'class', 'mapper-code', 'mapper', 'step', 'service', 'job', 'workflow'
        ];

        code_info.waitForPending(['yaml']).then(() => {
            for (const ifaceKind of ifaceKinds) {
                const interfaces = code_info.interfaceDataByType(ifaceKind);
                for (const iface of interfaces) {
                    if (iface.data.yaml_file) {
                        this.deployFile(iface.data.yaml_file);
                    }
                }
            }
        });
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
                url = urlJoin(url, 'deployment');
            }
        } else {
            url = urlJoin(url, 'api/latest/development', is_release ? 'release' : 'deploy');
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
            this.prepareData(file_paths, data);
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
                'qorus-token': token,
                'content-type': 'application/json;charset=utf-8'
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

    private prepareData(files: string[], data: object[]) {
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

            if (file_path.endsWith('.qsd.yaml')) {
                const resources: string[] = this.getResources(file_path);
                this.prepareData(resources, data);
            }
        }
    }

    private getResources = (file_path: string): string[] => {
        let resources = this.code_info.yaml_info.yamlDataByYamlFile(file_path)?.resource || [];

        if (resources.length) {
            const dir_path = path.dirname(file_path);
            resources = resources.map(basename => path.join(dir_path, basename));
            const pattern: string = resources.length == 1 ? `${resources}` : `{${resources}}`;
            return glob.sync(pattern, {nodir: true});
        }

        return [];
    }
}

export const deployer = new QorusDeploy();
