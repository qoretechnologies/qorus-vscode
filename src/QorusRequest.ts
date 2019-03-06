import * as vscode from 'vscode';
import * as request from 'request-promise';
import { tree, QorusTreeInstanceNode } from './QorusTree';
import { AuthNeeded } from './QorusAuth';
import { QorusLogin } from './QorusLogin';
import * as msg from './qorus_message';
import { t } from 'ttag';


export interface QorusRequestTexts {
    error: string,
    running: string,
    cancelling: string,
    cancellation_failed: string,
    checking_progress: string,
    finished_successfully: string,
    cancelled: string,
    failed: string,
    checking_status_failed: string
}

export class QorusRequest extends QorusLogin {
    doRequestAndCheckResult(options: any, texts: QorusRequestTexts, onFinished?): Thenable<boolean> {
        return request(options).then(
            (response: any) => {
                msg.log(t`requestResponse ${JSON.stringify(response)}`);
                if (response.id === undefined) {
                    msg.error(t`ResponseIdUndefined`);
                    return false;
                }
                this.checkRequestResult(options.uri, response.id, texts, onFinished);
                return true;
            },
            (error: any) => {
                this.requestError(error, texts.error);
                return false;
            }
        );
    }

    private checkRequestResult = (url: string, request_id: string, texts: QorusRequestTexts, onFinished?) => {
        const id_info = t`RequestIdInfo ${request_id}`;

        const token: string | undefined = this.getToken();

        vscode.window.withProgress(
            {
                location: vscode.ProgressLocation.Notification,
                title: texts.running + id_info,
                cancellable: true
            },
            async (progress, cancel_token): Promise<void> => {
                cancel_token.onCancellationRequested(() => {
                    msg.info(texts.cancelling + id_info);

                    const options = {
                        method: 'DELETE',
                        uri: `${url}/${request_id}`,
                        strictSSL: false,
                        headers: {
                            'qorus-token': token
                        },
                        json: true
                    };
                    request(options).catch(
                        error => {
                            msg.error(texts.cancellation_failed + id_info);
                            msg.log(JSON.stringify(error));
                        }
                    );
                    msg.log(t`CancellationRequestSent ${request_id}`);
                });

                progress.report({ increment: -1});
                let sec: number = 0;
                let quit: boolean = false;

                const options = {
                    method: 'GET',
                    uri: `${url}/${request_id}`,
                    strictSSL: false,
                    headers: {
                        'qorus-token': token
                    },
                    json: true
                };

                msg.log('uri ' + options.uri);

                while (!quit) {
                    await new Promise(resolve => setTimeout(resolve, 1000)); // sleep(1s)
                    msg.log(t`seconds ${++sec}` + '   ' + texts.checking_progress + id_info + ' ... ');

                    await request(options).then(
                        (response: any) => {
                            const status: string = response.status;
                            if (response.stdout) {
                                msg.log(t`requestResponse ${response.stdout} ${status}`);
                            }
                            if (response.stderr) {
                                msg.log(t`requestResponse ${response.stderr} ${status}`);
                            }
                            switch (status) {
                                case 'FINISHED':
                                    msg.info(texts.finished_successfully + id_info);
                                    quit = true;
                                    break;
                                case 'CANCELED':
                                case 'CANCELLED':
                                    msg.info(texts.cancelled + id_info);
                                    quit = true;
                                    break;
                                case 'FAILED':
                                    msg.error(texts.failed + id_info);
                                    quit = true;
                                    break;
                                default:
                            }
                        },
                        (error: any) => {
                            this.requestError(error, texts.checking_status_failed + id_info);
                            quit = true;
                        }
                    );
                }
                if (onFinished) {
                    onFinished();
                }
            }
        );
    };

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

    activeQorusInstanceAndToken(): any {
        if (!this.active_url) {
            msg.error(t`NoActiveQorusInstance`);
            tree.focus();
            return {ok: false};
        }

        const active_instance = tree.getQorusInstance(this.active_url);
        if (!active_instance) {
            msg.error(t`UnableGetActiveQorusInstanceData`);
            return {ok: false};
        }

        let token: string | undefined = undefined;
        if (this.authNeeded() != AuthNeeded.No) {
            token = this.getToken();
            if (!token) {
                msg.error(t`UnauthorizedOperationAtUrl ${this.active_url}`);
                return {ok: false};
            }
        }

        return {
            ok: true,
            active_instance: active_instance,
            token: token
        };
    }
}

export const qorus_request = new QorusRequest();
