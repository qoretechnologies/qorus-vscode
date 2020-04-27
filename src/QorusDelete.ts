import * as vscode from 'vscode';
import * as request from 'request-promise';
import * as urlJoin from 'url-join';

import { qorus_request, QorusRequestTexts } from './QorusRequest';
import { qorus_webview } from './QorusWebview';
import { t } from 'ttag';


class QorusDelete {
    private interfaces = {};

    deleteInterfaces(iface_kind: string, ids: string[]) {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            return;
        }

        let steps = [];
        let interfaces = ids.map(id => {
            const iface = this.interfaces[iface_kind][id];
            if (iface_kind === 'workflows') {
                [].push.apply(steps, iface.stepinfo.map(step =>
                    (({ name, version }) => ({ name, version }))(step)
                ));
            }
            return (({ name, version }) => ({ name, version }))(iface);
        });

        let iface_post_kind: string;
        switch (iface_kind) {
            case 'classes': iface_post_kind = 'class'; break;
            default: iface_post_kind = iface_kind.slice(0, -1);
        }
        const config: any = vscode.workspace.getConfiguration('qorusDeployment')
                                || {reload: false, 'verbosity-level': 1};
        const options = {
            method: 'POST',
            uri: urlJoin(active_instance.url, 'api/latest/development/delete'),
            strictSSL: false,
            body: {
                [iface_post_kind]: interfaces,
                options:  {
                    reload: config.reload,
                    'allow-redef': config['allow-redef'],
                    'verbosity-level': config['verbosity-level']
                }
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };
        if (steps.length) {
            options.body.step = steps;
        }

        const texts: QorusRequestTexts = {
            error: t`DeletionStartFailed`,
            running: t`DeletionRunning`,
            cancelling: t`CancellingDeletion`,
            cancellation_failed: t`DeletionCancellationFailed`,
            checking_progress: t`checkingDeletionProgress`,
            finished_successfully: t`DeletionFinishedSuccessfully`,
            cancelled: t`DeletionCancelled`,
            failed: t`DeletionFailed`,
            checking_status_failed: t`CheckingDeletionStatusFailed`,
        };

        qorus_request.doRequestAndCheckResult(options, texts, () => {
            qorus_webview.postMessage({
                action: 'deletion-finished',
                iface_kind: iface_kind
            });
        });
    }

    getInterfaces(iface_kind: string, keys: string[]) {
        const {ok, active_instance, token} = qorus_request.activeQorusInstanceAndToken();
        if (!ok) {
            qorus_webview.postMessage({
                action: 'return-interfaces',
                iface_kind: iface_kind,
                data: []
            });
            return;
        }

        const isIdKey = (key: string): boolean => {
            switch (iface_kind) {
                case 'classes':   return key === 'classid';
                case 'functions': return key === 'function_instanceid';
                default:
                    return key.slice(-2) === 'id'
                        && key.slice(0, -2) === iface_kind.slice(0, -1);
            }
        };

        if (iface_kind === 'workflows') {
            keys.push('stepinfo');
        }

        const subData = obj => {
            let ret: any = {};
            for (let key of keys) {
                ret[key] = obj[key];
                if (isIdKey(key)) {
                    ret.id = obj[key];
                }
            }
            this.interfaces[iface_kind] || (this.interfaces[iface_kind] = {});
            this.interfaces[iface_kind][ret.id] = ret;
            return ret;
        };

        const sorter = (a, b) => {
            const nameA = a.name.toUpperCase();
            const nameB = b.name.toUpperCase();
            if (nameA < nameB) {
                return -1;
            }
            if (nameA > nameB) {
                return 1;
            }
            return 0;
        };

        request({
            method: 'GET',
            uri: urlJoin(active_instance.url, `api/latest/${iface_kind}`),
            strictSSL: false,
            headers: {
                'qorus-token': token
            },
            json: true
        }).then(
            (full_data: any) => {
                qorus_webview.postMessage({
                    action: 'return-interfaces',
                    iface_kind: iface_kind,
                    data: iface_kind === 'services'
                        ? full_data.filter(obj => obj.type !== 'system')
                                   .map(subData)
                                   .sort(sorter)
                        : full_data.map(subData)
                                   .sort(sorter)
                });
            }
        );
    }
}

export const deleter = new QorusDelete();
