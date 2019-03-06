import * as vscode from 'vscode';
import * as request from 'request-promise';
import * as path from 'path';
import * as fs from 'fs';
import { QorusLogin } from './QorusLogin';
import { AuthNeeded } from './QorusAuth';
import { tree, QorusTreeInstanceNode } from './QorusTree';
import * as msg from './qorus_message';
import { t } from 'ttag';
import { isTest, isVersion3 } from './qorus_utils';


class QorusTest extends QorusLogin {

    testCurrentFile() {
        const editor = vscode.window.activeTextEditor;
        const file_path = editor ? editor.document.fileName : '';
        const code = editor ? editor.document.getText() : '';

        if (!file_path || !code) {
            msg.error(t`NothingToTest`);
            return;
        }

        const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

        if (!isTest(file_path)) {
            msg.error(t`NotExecutableFile ${file_relative_path}`);
            return;
        }

        if (file_path === file_relative_path) {
            msg.error(t`CannotLoadFileOutsideWorkspaceFolder ${file_path}`);
            return;
        }

        this.doTest([file_path]);
    }

    testFile(uri: vscode.Uri) {
        const file_path: string = uri.fsPath;
        if (!isTest(file_path)) {
            msg.error(t`NotExecutableFile ${vscode.workspace.asRelativePath(file_path, false)}`);
            return;
        }

        this.doTest([file_path]);
    }

    testDir(uri: vscode.Uri) {
        const dir: string = uri.fsPath;
        msg.log(t`TestingDirectory ${vscode.workspace.asRelativePath(dir, false)}`);

        let files: string[] = [];
        if (!QorusTest.getAllFiles(dir, files)) {
            msg.error(t`NoExecutableFilesInDir ${vscode.workspace.asRelativePath(dir, false)}`);
            return;
        }
        this.doTest(files);
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
                this.requestError(error, t`GettingInfoError`);
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
    private doTest(file_paths: string[]): Thenable<boolean> {
        if (!this.active_url) {
            msg.error(t`NoActiveQorusInstance`);
            tree.focus();
            return Promise.resolve(false);
        }

        const active_instance = tree.getQorusInstance(this.active_url);
        if (!active_instance) {
            msg.error(t`UnableGetActiveQorusInstanceData`);
            return Promise.resolve(false);
        }

        if (isVersion3(active_instance.version)) {
            msg.error(t`TestNotSupportedForQorus3`);
            return Promise.resolve(false);
        }

        let url: string = this.active_url + '/api/latest/development/test';
        let token: string | undefined = undefined;
        if (this.authNeeded(this.active_url) != AuthNeeded.No) {
            token = this.getToken(this.active_url);
            if (!token) {
                msg.error(t`UnauthorizedOperationAtUrl ${this.active_url}`);
                return Promise.resolve(false);
            }
        }

        msg.log(t`FilesToTest`);
        let data: object[] = [];
        QorusTest.prepareData(file_paths, data);

        msg.log(t`TestHasStarted ${active_instance.name} ${active_instance.url}`);
        msg.log(t`options` + ': ' + JSON.stringify(vscode.workspace.getConfiguration('qorusTest')));

        const options = {
            method: 'POST',
            uri: `${url}`,
            strictSSL: false,
            body: {
                files: data,
                options: vscode.workspace.getConfiguration('qorusTest'),
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };

        return request(options).then(
            (response: any) => {
                msg.log(t`testResponse ${JSON.stringify(response)}`);
                if (response.id === undefined) {
                    msg.error(t`ResponseIdUndefined`);
                    return false;
                }
                this.checkTestResult(url, response.id, token);
                return true;
            },
            (error: any) => {
                this.requestError(error, t`TestStartFailed`);
                return false;
            }
        );
    }

    private static prepareData(files: string[], data: object[]) {
        for (let file_path of files) {
            const file_relative_path = vscode.workspace.asRelativePath(file_path, false);

            if (isTest(file_relative_path)) {
                msg.log(`    ${file_relative_path}`);
            }

            if (!fs.existsSync(file_path)) {
                msg.error(`fileDoesNotExist ${file_path}`);
                return;
            }
            const file_content = fs.readFileSync(file_path);
            const buffer: Buffer = Buffer.from(file_content);
            var file = {
                'file_name': file_relative_path.replace(/\\/g, '/'),
                'file_content': buffer.toString('base64')
            };

            if (isTest(file_path)) {
                // TODO: file += {args: {}}
            }
            data.push(file);
        }
    }

    private checkTestResult(url: string, test_id: string, request_token?: string) {
        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`TestRunning ${test_id}`,
                cancellable: true
            },
            async (progress, cancel_token): Promise<void> => {
                cancel_token.onCancellationRequested(() => {
                    msg.info(t`CancellingTest ${test_id}`);

                    const options = {
                        method: 'DELETE',
                        uri: `${url}/${test_id}`,
                        strictSSL: false,
                        headers: {
                            'qorus-token': request_token
                        },
                        json: true
                    };
                    request(options).catch(
                        error => {
                            msg.error(t`TestCancellationFailed ${test_id}`);
                            msg.log(JSON.stringify(error));
                        }
                    );
                    msg.log(t`CancellationRequestSent ${test_id}`);
                });

                progress.report({ increment: -1});
                let sec: number = 0;
                let quit: boolean = false;

                const options = {
                    method: 'GET',
                    uri: `${url}/${test_id}`,
                    strictSSL: false,
                    headers: {
                        'qorus-token': request_token
                    },
                    json: true
                };

                while (!quit) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // sleep(1s)
                    msg.log(t`checkingTestProgress ${test_id} ${++sec}`);

                    await request(options).then(
                        (response: any) => {
                            const status: string = response.status;
                            if (response.stdout) {
                                msg.log(t`testResponse ${response.stdout} ${status}`);
                            }
                            if (response.stderr) {
                                msg.log(t`testResponse ${response.stderr} ${status}`);
                            }
                            switch (status) {
                                case 'FINISHED':
                                    msg.info(t`TestFinishedSuccessfully ${test_id}`);
                                    quit = true;
                                    break;
                                case 'CANCELED':
                                case 'CANCELLED':
                                    msg.info(t`TestCancelled ${test_id}`);
                                    quit = true;
                                    break;
                                case 'FAILED':
                                    msg.error(t`TestFailed ${test_id}`);
                                    quit = true;
                                    break;
                                default:
                            }
                        },
                        (error: any) => {
                            this.requestError(error, t`CheckingTestStatusFailed ${test_id}`);
                            quit = true;
                        }
                    );
                }
            }
        );
    }

    // returns (in the referenced array) all files from the directory 'dir'and its subdirectories
    private static getAllFiles(dir: string, files: string[]): boolean {
        var result = false;
        const dir_entries: string[] = fs.readdirSync(dir);
        for (let entry of dir_entries) {
            const entry_path: string = path.join(dir, entry);
            if (fs.lstatSync(entry_path).isDirectory()) {
                QorusTest.getAllFiles(entry_path, files);
            } else if (isTest(entry_path)) {
                result = true;
                files.push(entry_path);
            } else {
                files.push(entry_path);
            }
        }
        return result;
    }
}

export const tester = new QorusTest();
