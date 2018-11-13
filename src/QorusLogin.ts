import * as vscode from 'vscode';
import * as request from 'request-promise';
import { QorusAuth } from './QorusAuth';
import { tree, QorusTreeInstanceNode } from './QorusTree';
import * as path from 'path';
import * as msg from './qorus_message';
import { t } from 'ttag';

export class QorusLogin extends QorusAuth {

    login(tree_item: string | vscode.TreeItem, set_active: boolean = true) {

        if (typeof tree_item !== 'string') {
            const url: string | undefined = (<QorusTreeInstanceNode>tree_item).getUrl();
            if (url) {
                this.login(url, set_active);
            }
            else {
                msg.error(t`loginError`);
            }
            return;
        }

        const url: string = tree_item;

        const qorus_instance = tree.getQorusInstance(url);
        if (!qorus_instance) {
            msg.error(t`noQorusWithGivenUrlFound ${url}`);
            return;
        }

        const web_path = path.join(__dirname, '..', 'web');
        const panel = vscode.window.createWebviewPanel(
            'qorusLogin',
            t`qorusLoginTitle`,
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );
        vscode.workspace.openTextDocument(path.join(web_path, 'login', 'login.html')).then(
            doc => {
                panel.webview.html = doc.getText()
                                        .replace(/{{ path }}/g, web_path)
                                        .replace(/{{ loginHeader1 }}/g, t`loginHeader`)
                                        .replace(/{{ loginHeader2 }}/g, t`at`)
                                        .replace(/{{ name }}/g, qorus_instance.name)
                                        .replace(/{{ url }}/g, url)
                                        .replace(/{{ labelUsername }}/g, t`labelUsername`)
                                        .replace(/{{ labelPassword }}/g, t`labelPassword`)
                                        .replace(/{{ buttonOk }}/g, t`buttonOk`)
                                        .replace(/{{ buttonCancel }}/g, t`buttonCancel`)

                panel.webview.onDidReceiveMessage(message => {
                    if (message.command != 'ok') {
                        msg.info(t`loginCancelled`);
                        panel.dispose();
                        return;
                    }

                    const options = {
                        method: 'POST',
                        uri: `${url}/api/latest/public/login?user=${message.username}&pass=${message.password}`,
                        strictSSL: false
                    };

                    msg.log(t`sendingLoginRequest`);
                    request(options).then(
                        response => {
                            const token: string = JSON.parse(response).token;
                            this.addToken(url, token, set_active);
                            tree.refresh();
                            msg.info(t`loginSuccessful`);
                            panel.dispose();
                        },
                        error => {
                            if (error.name == 'StatusCodeError') {
                                const err_msg_prefix = `${error.statusCode} - `;
                                if (error.message.indexOf(err_msg_prefix) == 0) {
                                    const err_msg = JSON.parse(JSON.parse(error.message.substr(err_msg_prefix.length)));
                                    msg.error(`${err_msg.err} - ${err_msg.desc} `);
                                } else {
                                    msg.error(t`loginError`);
                                    msg.log(error);
                                }
                            } else {
                                msg.error(t`loginError`);
                                msg.log(error);
                            }
                            panel.dispose();
                        }
                    );
                });
            },
            error => {
                msg.error(t`unableOpenLoginPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    logout(tree_item: vscode.TreeItem) {
        const url: string | undefined = (<QorusTreeInstanceNode>tree_item).getUrl();

        if (url) {
            const token = this.getToken(url);
            if (!token) {
                msg.error(t`unauthorizedOperationAtUrl ${url}`);
                msg.log(t`noTokenForUrl ${url}`);
                return;
            }

            request({
                method: 'POST',
                uri: `${url}/api/latest/logout`,
                strictSSL: false,
                headers: {
                    'qorus-token': token
                }
            }).then(
                () => {
                    this.deleteToken(url);
                    tree.refresh();
                    msg.info(t`logoutSuccessful`);
                },
                (error: any) => {
                    msg.error(t`logoutError`);
                    msg.log(JSON.stringify(error));
                }
            );
        }
        else {
            msg.error(t`logoutError`);
        }
    }

    protected static checkNoAuth(url:string): Thenable<boolean> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`gettingInfo ${url}`,
                cancellable: false
            },
            async (progress): Promise<boolean> => {
                progress.report({ increment: -1});

                const options = {
                    method: 'GET',
                    uri: `${url}/api/latest/public/info`,
                    strictSSL: false,
                    timeout: 30000
                };
                return request(options).then(
                    (response: any) => {
                        const no_auth = JSON.parse(response).noauth;
                        return !!no_auth;
                    }
                );
            }
        );
    }
}
