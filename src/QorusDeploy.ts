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
            msg.error(t`nothingToDeploy`);
            return;
        }

        const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

        if (!isDeployable(file_path)) {
            msg.error(t`notDeployableFile ${file_relative_path}`);
            return;
        }

        if (file_path === file_relative_path) {
            msg.error(t`cannotLoadFileOutsideWorkspaceFolder ${file_path}`);
            return;
        }

        this.doDeploy([file_path]);
    }

    deployFile(uri: vscode.Uri) {
        let file_path: string = uri.fsPath;
        if (!isDeployable(file_path)) {
            msg.error(t`notDeployableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        this.doDeploy([file_path]);
    }

    deployDir(uri: vscode.Uri) {
        let dir: string = uri.fsPath;
        msg.log(t`deployingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        let files: Array<string> = [];
        QorusDeploy.getDeployableFiles(dir, files);
        this.doDeploy(files);
    }

    setActiveInstance(tree_item: string | vscode.TreeItem) {
        if (typeof tree_item === 'string') {
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
                        msg.info(t`authNotNeeded ${url}`);
                    }
                    else {
                        msg.info(t`authNeeded ${url}`);
                        this.login(url);
                    }
                },
                (error: any) => {
                    if (error.message && error.message.indexOf('EHOSTUNREACH') > -1) {
                        msg.error(t`hostUnreachable ${url}`);
                    }
                    else if (error.message && error.message.indexOf('ETIMEDOUT') > -1) {
                        msg.error(t`gettingInfoTimedOut ${url}`);
                    }
                    else {
                        msg.error(t`gettingInfoError`);
                        msg.log(JSON.stringify(error));
                    }
                }
            );
        }
        else {
            const url: string | undefined = (<QorusTreeInstanceNode>tree_item).getUrl();
            if (url) {
                this.setActiveInstance(url);
            }
            else {
                msg.error(t`setActiveQorusInstanceError`);
            }
        }
    }

    unsetActiveInstance(tree_item?: vscode.TreeItem) {
        if (tree_item) {
            const url: string | undefined = (<QorusTreeInstanceNode>tree_item).getUrl();
            if (!url) {
                msg.error(t`setInactiveQorusInstanceError`);
                return;
            }
            if (!this.isActive(url)) {
                msg.log(t`attemptToSetInactiveNotActiveInstance ${url}`);
            }
        }
        this.unsetActive();
        tree.refresh();
    }

    private doDeploy(file_paths: Array<string>) {
        if (!this.active_url) {
            msg.error(t`noActiveQorusInstance`);
            vscode.commands.executeCommand('qorusInstancesExplorer.focus');
            return;
        }

        const active_instance = tree.getQorusInstance(this.active_url);
        if (!active_instance) {
            msg.error(t`unableGetActiveQorusInstanceData`);
            return;
        }

        let token: string | undefined = undefined;
        if (this.authNeeded(this.active_url) != AuthNeeded.No) {
            token = this.getToken(this.active_url);
            if (!token) {
                msg.error(t`unauthorizedOperationAtUrl ${this.active_url}`);
                return;
            }
        }

        let data: Array<object> = [];
        QorusDeploy.prepareDataToDeploy(file_paths, data);

        msg.log(t`deploymentHasStarted ${active_instance.name} ${active_instance.url}`);

        const url_base: string = QorusDeploy.urlBase(active_instance.url, active_instance.version);

        const options = {
            method: 'POST',
            uri: `${url_base}/create`,
            strictSSL: false,
            body: {
                files: data
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };
        request(options).then(
            response => {
                msg.log(t`deploymentResponse ${JSON.stringify(response)}`);
                if (response.id === undefined) {
                    msg.error(t`responseIdUndefined`);
                    return;
                }
                QorusDeploy.checkDeploymentResult(url_base, response.id, token);
            },
            error => {
                if (error.statusCode == 401) {
                    msg.error(t`error401`);
                }
                else {
                    msg.error(t`deploymentError ${JSON.stringify(error)}`);
                }
            }
        );
    }

    private static prepareDataToDeploy(files: Array<string>, data: Array<object>) {
        msg.log(t`filesToDeploy`);
        for (let file_path of files) {
            const file_relative_path = vscode.workspace.asRelativePath(file_path, false);
            msg.log(`    ${file_relative_path}`);

            if (!fs.existsSync(file_path)) {
                msg.error(`fileDoesNotExist ${file_path}`);
                return;
            }
            const file_content = fs.readFileSync(file_path);
            let buffer: Buffer = Buffer.from(file_content);
            data.push({
                'file_name': file_relative_path,
                'file_content': buffer.toString('base64')
            });

            if (isService(file_path)) {
                let resources: Array<string> =
                    QorusDeploy.getResources(file_content.toString(), path.dirname(file_path));
                QorusDeploy.prepareDataToDeploy(resources, data);
            }
        }
    }

    private static checkDeploymentResult(url_base: string, deployment_id: string, request_token?: string) {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`deploymentRunning ${deployment_id}`,
                cancellable: true
            },
            async (progress, cancel_token): Promise<void> => {
                cancel_token.onCancellationRequested(() => {
                    msg.info(t`cancellingDeployment ${deployment_id}`);

                    const options = {
                        method: 'PUT',
                        uri: `${url_base}/cancel/${deployment_id}`,
                        strictSSL: false,
                        headers: {
                            'qorus-token': request_token
                        },
                        json: true
                    };
                    request(options).catch(
                        error => {
                            msg.error(t`deploymentCancellationFailed ${deployment_id}`);
                            msg.log(JSON.stringify(error));
                        }
                    );
                    msg.log(t`cancellationRequestSent ${deployment_id}`);
                });

                progress.report({ increment: -1});
                let sec: number = 0;
                let quit: boolean = false;

                const options = {
                    method: 'GET',
                    uri: `${url_base}/status/${deployment_id}`,
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
                        response => {
                            let status: string = response.status;
                            if (response.stdout) {
                                msg.log(t`deploymentResponse ${response.stdout} ${status}`);
                            }
                            if (response.stderr) {
                                msg.log(t`deploymentResponse ${response.stderr} ${status}`);
                            }
                            switch (status) {
                                case 'DEPLOYED':
                                    msg.info(t`deploymentFinishedSuccessfully ${deployment_id}`);
                                    quit = true;
                                    break;
                                case 'CANCELED':
                                case 'CANCELLED':
                                    msg.info(t`deploymentCancelled ${deployment_id}`);
                                    quit = true;
                                    break;
                                case 'FAILED':
                                    msg.error(t`deploymentFailed ${deployment_id}`);
                                    quit = true;
                                    break;
                                default:
                            }
                        },
                        error => {
                            msg.error(t`deploymentFailed ${deployment_id}`);
                            msg.log(JSON.stringify(error));
                            quit = true;
                        }
                    );
                }
            }
        );
    }

    private static getResources(file_content: string, dir_path: string): Array<string> {
        let resources: Array<string> = [];
        for (let line of file_content.split(/\r?\n/)) {
            if (line.search(/^#\s*resource\s*:\s*(.*\S)\s*$/) > -1) {
                resources = resources.concat(RegExp.$1.split(/\s+/));
            }
        }
        if (resources.length) {
            resources = resources.map(basename => path.join(dir_path, basename));
            let pattern: string = resources.length == 1 ? `${resources}` : `{${resources}}`;
            return glob.sync(pattern, {nodir: true});
        }
        return [];
    }

    // returns (in the referenced array) all deployable files from the directory 'dir'and its subdirectories
    private static getDeployableFiles(dir: string, deployable_files: Array<string>) {
        let dir_entries: Array<string> = fs.readdirSync(dir);
        for (let entry of dir_entries) {
            let entry_path: string = path.join(dir, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                msg.log(t`subdirectory ${entry_path}`);
                QorusDeploy.getDeployableFiles(entry_path, deployable_files);
            } else if (isDeployable(entry_path)) {
                deployable_files.push(entry_path);
            }
        }
    }

    private static urlBase(url: string, version?: string): string {
        return url + (isVersion3(version) ? '' : '/api/latest/') + '/deployment';
    }
}

export const deployer = new QorusDeploy();
