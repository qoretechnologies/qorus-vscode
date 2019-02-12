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
                            this.requestError(error, t`LoginError`);
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
            this.doLogout(url);
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
            () => this.doLogout(url, false),
            (error: any) => {
                msg.log(JSON.stringify(error));
                this.doLogout(url);
            }
        );
    }

    private doLogout(url?: string, forget_all: boolean = true, no_message = false) {
        url = url || this.active_url;
        const was_logged_in = this.isLoggedIn(url);
        forget_all ? this.forgetAllInfo(url) : this.deleteToken(url);
        if (was_logged_in && !no_message) {
            msg.info(t`LoggedOut`);
        }
        tree.refresh();
    }

    protected requestError(error_data: any, default_error: string) {
        let url: string = error_data.options ? error_data.options.uri || '' : '';

        const params_pos = url.indexOf('?');
        if (params_pos > -1) {
            url = url.substr(0, params_pos);
        }

        if (error_data.statusCode == 401) {
            msg.error(t`Error401 ${url}`);
            this.doLogout(null, true, true);
            tree.focus();
        }
        else if (error_data.message && error_data.message.indexOf('EHOSTUNREACH') > -1) {
            msg.error(t`HostUnreachable ${url}`);
            this.doLogout();
        }
        else if (error_data.message && error_data.message.indexOf('ETIMEDOUT') > -1) {
            msg.error(t`GettingInfoTimedOut ${url}`);
        }
        else if (error_data.message && error_data.message.indexOf('ECONNREFUSED') > -1) {
            msg.error(t`ConnectionRefused ${url}`);
            this.doLogout();
        }
        else {
            if (error_data.statusCode == 409) {
                msg.error(t`Error409 ${url}`);
            }
            else if (error_data.statusCode) {
                msg.error(t`ErrorN ${error_data.statusCode} ${url}`);
            }
            else {
                msg.error(`${default_error} (${url})`);
            }
            msg.log(JSON.stringify(error_data, null, 4));
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
