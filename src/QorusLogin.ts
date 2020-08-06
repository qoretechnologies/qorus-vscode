import * as vscode from 'vscode';
import * as urlJoin from 'url-join';
import * as request from 'request-promise';

import { QorusAuth, AuthNeeded } from './QorusAuth';
import { instance_tree, QorusTreeInstanceNode } from './QorusInstanceTree';
import { qorus_webview } from './QorusWebview';
import { QorusProject, projects } from './QorusProject';
import * as msg from './qorus_message';
import { t } from 'ttag';


export class QorusLogin extends QorusAuth {
    private current_login_params: any = {
        qorus_instance: undefined,
        set_active: true,
    };

    private active_instance_ping_interval_id: any;

    login(tree_item: string | vscode.TreeItem, set_active: boolean = true) {
        if (typeof tree_item !== 'string') {
            this.login((<QorusTreeInstanceNode>tree_item).getUrl(), set_active);
            return;
        }

        const url: string = tree_item;

        const qorus_instance = instance_tree.getQorusInstance(url);
        if (!qorus_instance) {
            msg.error(t`NoQorusWithGivenUrlFound ${url}`);
            return;
        }

        this.current_login_params = {
            qorus_instance: (({ name, url }) => ({ name, url }))(qorus_instance),
            set_active,
        };

        qorus_webview.open({ tab: 'Login' });
    }

    loginPost(username: string, password: string) {
        if (!this.current_login_params.qorus_instance) {
            return;
        }

        const set_active = this.current_login_params.set_active;
        const qorus_instance = this.current_login_params.qorus_instance;

        const options = {
            method: 'POST',
            uri: urlJoin(qorus_instance.url, 'api/latest/public/login', `?user=${username}&pass=${password}`),
            strictSSL: false,
        };

        msg.log(t`SendingLoginRequest`);
        request(options).then(
            response => {
                const token: string = JSON.parse(response).token;
                this.addToken(qorus_instance.url, token, set_active);
                instance_tree.refresh();
                msg.info(t`LoginSuccessful`);
                qorus_webview.setInitialData({ tab: 'ProjectConfig' });
                qorus_webview.postMessage({
                    action: 'close-login',
                    qorus_instance: set_active ? qorus_instance : null,
                });
                const code_info = projects.currentProjectCodeInfo();
                code_info && code_info.setCurrentQorusData();
                this.startConnectionCheck();
            },
            error => {
                this.requestError(error, t`LoginError`);
                qorus_webview.postMessage({
                    action: 'login-error',
                    error: t`AuthFailed`,
                });
            }
        );
    }

    loginQorusInstance(): any {
        return {
            ...this.current_login_params.qorus_instance,
            safe_url: QorusProject.createSafeUrl(this.current_login_params.qorus_instance.url),
        };
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
            uri: urlJoin(url, 'api/latest/logout'),
            strictSSL: false,
            headers: {
                'qorus-token': token,
            },
        }).then(
            () => this.doLogout(url, false),
            (error: any) => {
                msg.log(JSON.stringify(error));
                this.doLogout(url);
            }
        );
    }

    private doLogout(url?: string, forget_all: boolean = true, no_message = false) {
        clearInterval(this.active_instance_ping_interval_id);
        url = url || this.active_url;
        const was_logged_in = this.isLoggedIn(url);
        forget_all ? this.forgetAllInfo(url) : this.deleteToken(url);
        if (was_logged_in && !no_message) {
            msg.info(t`LoggedOut`);
        }
        instance_tree.refresh();
        qorus_webview.setActiveQorusInstance(undefined);
    }

    requestError(error_data: any, default_error: string) {
        let url: string = error_data.options ? error_data.options.uri || '' : '';

        const params_pos = url.indexOf('?');
        if (params_pos > -1) {
            url = url.substr(0, params_pos);
        }

        if (error_data.statusCode == 401) {
            msg.error(t`Error401 ${url}`);
            this.doLogout(undefined, true, true);
            instance_tree.focus();
        } else if (error_data.message?.indexOf('EHOSTUNREACH') > -1) {
            msg.error(t`HostUnreachable ${url}`);
            this.doLogout();
        } else if (error_data.message?.indexOf('ETIMEDOUT') > -1) {
            msg.error(t`RequestTimedOut ${url}`);
        } else if (error_data.message?.indexOf('ESOCKETTIMEDOUT') > -1) {
            msg.error(t`RequestTimedOut ${url}`);
        } else if (error_data.message?.indexOf('ECONNREFUSED') > -1) {
            msg.error(t`ConnectionRefused ${url}`);
            this.doLogout();
        } else if (
            error_data.message?.indexOf('authenticate') > -1 &&
            error_data.statusCode == 400
        ) {
            msg.error(t`AuthFailed`);
        } else {
            if (error_data.statusCode == 409) {
                msg.error(t`Error409 ${url}`);
            } else if (error_data.statusCode) {
                msg.error(t`ErrorN ${error_data.statusCode} ${url}`);
            } else {
                msg.error(`${default_error} (${url})`);
            }
            msg.log(JSON.stringify(error_data, null, 4));
        }
    }

    protected static checkNoAuth(url: string): Thenable<boolean> {
        return vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: t`GettingInfo ${url}`,
                cancellable: false,
            },
            async (progress): Promise<boolean> => {
                progress.report({ increment: -1 });

                const options = {
                    method: 'GET',
                    uri: urlJoin(url, 'api/latest/public/info'),
                    strictSSL: false,
                    timeout: 10000,
                };
                return request(options).then((response: any) => {
                    const no_auth = JSON.parse(response).noauth;
                    return !!no_auth;
                });
            }
        );
    }

    setActiveInstance(tree_item: string | vscode.TreeItem) {
        if (typeof tree_item !== 'string') {
            this.setActiveInstance((<QorusTreeInstanceNode>tree_item).getUrl());
            return;
        }

        const url = tree_item;

        if (this.isAuthorized(url)) {
            this.setActive(url);
            instance_tree.refresh();
            this.startConnectionCheck();
            return;
        }
        QorusLogin.checkNoAuth(url).then(
            (no_auth: boolean) => {
                if (no_auth) {
                    this.addNoAuth(url);
                    instance_tree.refresh();
                    msg.info(t`AuthNotNeeded ${url}`);
                } else {
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
        clearInterval(this.active_instance_ping_interval_id);
        if (tree_item) {
            const url: string = (<QorusTreeInstanceNode>tree_item).getUrl();
            if (!this.isActive(url)) {
                msg.log(t`AttemptToSetInactiveNotActiveInstance ${url}`);
            }
        }
        this.unsetActive();
        instance_tree.refresh();
    }

    activeQorusInstance = () => instance_tree.getQorusInstance(this.active_url);

    activeQorusInstanceAndToken(): any {
        if (!this.active_url) {
            msg.error(t`NoActiveQorusInstance`);
            instance_tree.focus();
            return { ok: false };
        }

        const active_instance = instance_tree.getQorusInstance(this.active_url);
        if (!active_instance) {
            msg.error(t`UnableGetActiveQorusInstanceData`);
            return { ok: false };
        }

        let token: string | undefined = undefined;
        if (this.authNeeded() != AuthNeeded.No) {
            token = this.getToken();
            if (!token) {
                msg.error(t`UnauthorizedOperationAtUrl ${this.active_url}`);
                return { ok: false };
            }
        }

        return { ok: true, active_instance, token };
    }

    protected startConnectionCheck = () => {
        const stop = () => {
            this.doLogout(undefined, true, true);
            msg.error(t`ActiveQorusLost`);
        };

        const ping = () => {
            const { ok, active_instance, token } = this.activeQorusInstanceAndToken();
            if (!ok) {
                stop();
            }

            const options = {
                method: 'GET',
                uri: urlJoin(active_instance.url, 'api/latest/system?action=ping'),
                strictSSL: false,
                headers: {
                    'qorus-token': token,
                },
                timeout: 10000,
            };
            request(options).then((response: any) => {
                const parsed_response = JSON.parse(response);
                if (parsed_response !== 'OK') {
                    stop();
                    msg.error(t`PingNotOK ${options.uri}`);
                    msg.log(parsed_response);
                }
            }, error => {
                stop();
                this.requestError(error, t`ActiveQorusPingError`);
            });
        };

        this.active_instance_ping_interval_id = setInterval(ping, 30000);
    }
}
