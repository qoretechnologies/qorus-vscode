import * as vscode from 'vscode';
import * as request from 'request-promise';
import { QorusAuth } from './QorusAuth';
import { tree, QorusTreeInstanceNode } from './QorusTree';
import { qorus_webview } from './QorusWebview';
import * as msg from './qorus_message';
import { t } from 'ttag';


export class QorusLogin extends QorusAuth {
    private current_login_params: any = {
        qorus_instance: undefined,
        set_active: true,
    };

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

        this.current_login_params = {
            qorus_instance: (({ name, url }) => ({ name, url }))(qorus_instance),
            set_active
        }

        qorus_webview.open('Login');
    }

    loginPost(username: string, password: string, webview: vscode.Webview = null) {
        if (!this.current_login_params.qorus_instance) {
            return;
        }

        const set_active = this.current_login_params.set_active;
        const qorus_instance = this.current_login_params.qorus_instance;

        const options = {
            method: 'POST',
            uri: `${qorus_instance.url}/api/latest/public/login?user=${username}&pass=${password}`,
            strictSSL: false
        };

        msg.log(t`SendingLoginRequest`);
        request(options).then(
            response => {
                const token: string = JSON.parse(response).token;
                this.addToken(qorus_instance.url, token, set_active);
                tree.refresh();
                msg.info(t`LoginSuccessful`);
                if (webview) {
                    webview.postMessage({
                        action: 'close-login',
                        qorus_instance: set_active ? qorus_instance : undefined
                    });
                }
            },
            error => {
                this.requestError(error, t`LoginError`);
                if (webview) {
                    webview.postMessage({
                        action: 'login-error',
                        error: t`AuthFailed`
                    });
                }
            }
        );
    }

    loginQorusInstance(): any {
        return this.current_login_params.qorus_instance;
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
        else if (error_data.message && error_data.message.indexOf('authenticate') > -1
                        && error_data.statusCode == 400)
        {
            msg.error(t`AuthFailed`);
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
