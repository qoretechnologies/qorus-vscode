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
            this.login((<QorusTreeInstanceNode>tree_item).getUrl(), set_active);
            return;
        }

        const url: string = tree_item;

        const qorus_instance = tree.getQorusInstance(url);
        if (!qorus_instance) {
            msg.error(t`NoQorusWithGivenUrlFound ${url}`);
            return;
        }

        const web_path = path.join(__dirname, '..', 'web');
        const panel = vscode.window.createWebviewPanel(
            'qorusLogin',
            t`QorusLoginTitle`,
            vscode.ViewColumn.One,
            {
                enableScripts: true
            }
        );
        vscode.workspace.openTextDocument(path.join(web_path, 'qorus_login', 'login.html')).then(
            html => {
                panel.webview.html = html.getText()
                                        .replace(/{{ path }}/g, web_path)
                                        .replace(/{{ loginHeader1 }}/g, t`LoginHeader`)
                                        .replace(/{{ loginHeader2 }}/g, t`at`)
                                        .replace(/{{ name }}/g, qorus_instance.name)
                                        .replace(/{{ url }}/g, url)
                                        .replace(/{{ labelUsername }}/g, t`LabelUsername`)
                                        .replace(/{{ labelPassword }}/g, t`LabelPassword`)
                                        .replace(/{{ buttonOk }}/g, t`ButtonOk`)
                                        .replace(/{{ buttonCancel }}/g, t`ButtonCancel`);

                panel.webview.onDidReceiveMessage(message => {
                    if (message.command != 'ok') {
                        msg.info(t`LoginCancelled`);
                        panel.dispose();
                        return;
                    }

                    const options = {
                        method: 'POST',
                        uri: `${url}/api/latest/public/login?user=${message.username}&pass=${message.password}`,
                        strictSSL: false
                    };

                    msg.log(t`SendingLoginRequest`);
                    request(options).then(
                        response => {
                            const token: string = JSON.parse(response).token;
                            this.addToken(url, token, set_active);
                            tree.refresh();
                            msg.info(t`LoginSuccessful`);
                            panel.dispose();
                        },
                        error => {
                            msg.requestError(error, t`LoginError`);
                            panel.dispose();
                        }
                    );
                });
            },
            error => {
                msg.error(t`UnableOpenLoginPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    logout(tree_item: vscode.TreeItem) {
        const url: string = (<QorusTreeInstanceNode>tree_item).getUrl();

        const token = this.getToken(url);
        if (!token) {
            msg.log(t`NoTokenForUrl ${url}`);
            this.doLogout(url, true);
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
            () => this.doLogout(url),
            (error: any) => {
                msg.log(JSON.stringify(error));
                this.doLogout(url, true);
            }
        );
    }

    protected doLogout(url: string, is_error: boolean = false, do_message: boolean = true) {
    is_error ? this.forgetAllInfo(url) : this.deleteToken(url);
        tree.refresh();
        if (do_message) {
            msg.info(t`LoggedOut`);
        }
    }

    protected static checkNoAuth(url:string): Thenable<boolean> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`GettingInfo ${url}`,
                cancellable: false
            },
            async (progress): Promise<boolean> => {
                progress.report({increment: -1});

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
