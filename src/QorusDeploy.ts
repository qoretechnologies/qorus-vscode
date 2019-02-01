import * as vscode from 'vscode';
import * as request from 'request-promise';
import * as path from 'path';
import * as fs from 'fs';
import * as glob from 'glob';
import { QorusLogin } from './QorusLogin';
import { AuthNeeded } from './QorusAuth';
import { tree, QorusTreeInstanceNode } from './QorusTree';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { isDeployable, isService, isVersion3 } from './qorus_utils';


class QorusDeploy extends QorusLogin {

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

        this.doDeploy([file_path]);
    }

    deployFile(uri: vscode.Uri) {
        const file_path: string = uri.fsPath;
        if (!isDeployable(file_path)) {
            msg.error(t`NotDeployableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        this.doDeploy([file_path]);
    }

    deployDir(uri: vscode.Uri) {
        const dir: string = uri.fsPath;
        msg.log(t`DeployingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        let files: string[] = [];
        QorusDeploy.getDeployableFiles(dir, files);
        this.doDeploy(files);
    }

    deployPackage(file: string): Thenable<boolean> {
        return this.doDeploy([file], true);
    }

    setActiveInstance(tree_item: string | vscode.TreeItem) {
        if (typeof tree_item !== 'string') {
            this.setActiveInstance((<QorusTreeInstanceNode>tree_item).getUrl());
            return;
        }

        const url = tree_item;
        if (this.isAuthorized(url)) {
            this.setActive(url);
            tree.refresh();
            return;
        }
        QorusLogin.checkNoAuth(url).then(
            (no_auth: boolean) => {
                if (no_auth) {
                    this.addNoAuth(url);
                    tree.refresh();
                    msg.info(t`AuthNotNeeded ${url}`);
                }
                else {
                    msg.info(t`AuthNeeded ${url}`);
                    this.login(url);
                }
            },
            (error: any) => {
                msg.requestError(error, t`GettingInfoError`);
            }
        );
    }

    unsetActiveInstance(tree_item?: vscode.TreeItem) {
        if (tree_item) {
            const url: string = (<QorusTreeInstanceNode>tree_item).getUrl();
            if (!this.isActive(url)) {
                msg.log(t`AttemptToSetInactiveNotActiveInstance ${url}`);
            }
        }
        this.unsetActive();
        tree.refresh();
    }

    // returns true if the process got to the stage of checking the result
    // returns false if the process failed earlier
    private doDeploy(file_paths: string[], is_release: boolean = false): Thenable<boolean> {
        if (!this.active_url) {
            msg.error(t`NoActiveQorusInstance`);
            vscode.commands.executeCommand('qorusInstancesExplorer.focus');
            return Promise.resolve(false);
        }

        const active_instance = tree.getQorusInstance(this.active_url);
        if (!active_instance) {
            msg.error(t`UnableGetActiveQorusInstanceData`);
            return Promise.resolve(false);
        }

        let url_base: string = active_instance.url;
        if (isVersion3(active_instance.version)) {
            if (is_release) {
                msg.error(t`PackageDeploymentNotSupportedForQorus3`);
                return Promise.resolve(false);
            }
            else {
                url_base += '/deployment';
            }
        } else {
            url_base += '/api/latest/development/' + (is_release ? 'release' : 'deploy');
        }

        let token: string | undefined = undefined;
        if (this.authNeeded(this.active_url) != AuthNeeded.No) {
            token = this.getToken(this.active_url);
            if (!token) {
                msg.error(t`UnauthorizedOperationAtUrl ${this.active_url}`);
                return Promise.resolve(false);
            }
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
            QorusDeploy.prepareDataToDeploy(file_paths, data);
        }

        msg.log(t`DeploymentHasStarted ${active_instance.name} ${active_instance.url}`);
        msg.log(t`options` + ': ' + JSON.stringify(vscode.workspace.getConfiguration('qorusDeployment')));

        const options = {
            method: 'POST',
            uri: `${url_base}`,
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

        return request(options).then(
            (response: any) => {
                msg.log(t`deploymentResponse ${JSON.stringify(response)}`);
                if (response.id === undefined) {
                    msg.error(t`ResponseIdUndefined`);
                    return false;
                }
                this.checkDeploymentResult(url_base, active_instance.url, response.id, token);
                return true;
            },
            (error: any) => {
                msg.requestError(error, t`DeploymentStartFailed`);
                this.doLogout(active_instance.url, true, false);         // ???
                return false;
            }
        );
    }

    private static prepareDataToDeploy(files: string[], data: object[]) {
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
                QorusDeploy.prepareDataToDeploy(resources, data);
            }
        }
    }

    private checkDeploymentResult(request_url_base: string,
                                  instance_url: string,
                                  deployment_id: string,
                                  request_token?: string)
    {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`DeploymentRunning ${deployment_id}`,
                cancellable: true
            },
            async (progress, cancel_token): Promise<void> => {
                cancel_token.onCancellationRequested(() => {
                    msg.info(t`CancellingDeployment ${deployment_id}`);

                    const options = {
                        method: 'DELETE',
                        uri: `${request_url_base}/${deployment_id}`,
                        strictSSL: false,
                        headers: {
                            'qorus-token': request_token
                        },
                        json: true
                    };
                    request(options).catch(
                        error => {
                            msg.error(t`DeploymentCancellationFailed ${deployment_id}`);
                            msg.log(JSON.stringify(error));
                        }
                    );
                    msg.log(t`CancellationRequestSent ${deployment_id}`);
                });

                progress.report({ increment: -1});
                let sec: number = 0;
                let quit: boolean = false;

                const options = {
                    method: 'GET',
                    uri: `${request_url_base}/${deployment_id}`,
                    strictSSL: false,
                    headers: {
                        'qorus-token': request_token
                    },
                    json: true
                };

                while (!quit) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // sleep(1s)
                    msg.log(t`checkingDeploymentProgress ${deployment_id} ${++sec}`);

                    await request(options).then(
                        (response: any) => {
                            const status: string = response.status;
                            if (response.stdout) {
                                msg.log(t`deploymentResponse ${response.stdout} ${status}`);
                            }
                            if (response.stderr) {
                                msg.log(t`deploymentResponse ${response.stderr} ${status}`);
                            }
                            switch (status) {
                                case 'FINISHED':
                                    msg.info(t`DeploymentFinishedSuccessfully ${deployment_id}`);
                                    quit = true;
                                    break;
                                case 'CANCELED':
                                case 'CANCELLED':
                                    msg.info(t`DeploymentCancelled ${deployment_id}`);
                                    quit = true;
                                    break;
                                case 'FAILED':
                                    msg.error(t`DeploymentFailed ${deployment_id}`);
                                    quit = true;
                                    break;
                                default:
                            }
                        },
                        (error: any) => {
                            msg.requestError(error, t`CheckingDeploymentStatusFailed ${deployment_id}`);
                            this.doLogout(instance_url, true, false);
                            quit = true;
                        }
                    );
                }
            }
        );
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

    // returns (in the referenced array) all deployable files from the directory 'dir'and its subdirectories
    private static getDeployableFiles(dir: string, deployable_files: string[]) {
        const dir_entries: string[] = fs.readdirSync(dir);
        for (let entry of dir_entries) {
            const entry_path: string = path.join(dir, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                QorusDeploy.getDeployableFiles(entry_path, deployable_files);
            } else if (isDeployable(entry_path)) {
                deployable_files.push(entry_path);
            }
        }
    }
}

export const deployer = new QorusDeploy();
