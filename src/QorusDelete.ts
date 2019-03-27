import * as vscode from 'vscode';
import * as path from 'path';
import * as request from 'request-promise';
import { qorus_request, QorusRequest, QorusRequestTexts } from './QorusRequest';
import * as msg from './qorus_message';
import { t, gettext } from 'ttag';


class QorusDelete {
    private request: QorusRequest;
    private web_panel: vscode.WebviewPanel | undefined = undefined;
    private interfaces = {};

    constructor() {
        this.request = qorus_request;
    }

    openPage() {
        if(this.web_panel) {
            this.web_panel.reveal(vscode.ViewColumn.One);
            return;
        }

        const web_path = path.join(__dirname, '..', 'dist');
        vscode.workspace.openTextDocument(path.join(web_path, 'delete_interfaces.html')).then(
            doc => {
                this.web_panel = vscode.window.createWebviewPanel(
                    'qorusDelete',
                    t`QorusDeleteInterfacesTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                this.web_panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);

                this.web_panel.onDidDispose(() => {
                    this.web_panel = undefined;
                });

                this.web_panel.webview.onDidReceiveMessage(message => {
                    switch (message.action) {
                        case 'get-text':
                            this.web_panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id)
                            });
                            break;
                        case 'get-interfaces':
                            this.getInterfaces(message.iface_kind, message.columns);
                            break;
                        case 'delete-interfaces':
                            this.deleteInterfaces(message.iface_kind, message.ids);
                            break;
                    }
                });
            },
            error => {
                msg.error(t`UnableOpenDeleteInterfacesPage`);
                msg.log(JSON.stringify(error));
            }
        );
    }

    private deleteInterfaces(iface_kind: string, ids: string[]) {
        const {ok, active_instance, token} = this.request.activeQorusInstanceAndToken();
        if (!ok) {
            return;
        }
        let interfaces = ids.map(id => (({ name, version }) => ({ name, version }))(this.interfaces[iface_kind][id]));
        let iface_post_kind: string;
        switch (iface_kind) {
            case 'classes': iface_post_kind = 'class'; break;
            default: iface_post_kind = iface_kind.slice(0, -1);
        }
        const config = vscode.workspace.getConfiguration('qorusDeployment') || {reload: false, 'verbosity-level': 1};
        const options = {
            method: 'POST',
            uri: `${active_instance.url}/api/latest/development/delete`,
            strictSSL: false,
            body: {
                [iface_post_kind]: interfaces,
                options:  {
                    reload: config.reload,
                    'verbosity-level': config['verbosity-level']
                }
            },
            headers: {
                'qorus-token': token
            },
            json: true
        };

        const texts: QorusRequestTexts = {
            error: t`DeletionStartFailed`,
            running: t`DeletionRunning`,
            cancelling: t`CancellingDeletion`,
            cancellation_failed: t`DeletionCancellationFailed`,
            checking_progress: t`checkingDeletionProgress`,
            finished_successfully: t`DeletionFinishedSuccessfully`,
            cancelled: t`DeletionCancelled`,
            checking_status_failed: t`CheckingDeletionStatusFailed`,
        };

        this.request.doRequestAndCheckResult(options, texts, () => {
            this.web_panel.webview.postMessage({
                action: 'deletion-finished',
                iface_kind: iface_kind
            });
        });
    }

    private getInterfaces(iface_kind: string, keys: string[]) {
        const {ok, active_instance, token} = this.request.activeQorusInstanceAndToken();
        if (!ok) {
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
            uri: `${active_instance.url}/api/latest/${iface_kind}`,
            strictSSL: false,
            headers: {
                'qorus-token': token
            },
            json: true
        }).then(
            (full_data: any) => {
                this.web_panel.webview.postMessage({
                    action: 'return-interfaces',
                    iface_kind: iface_kind,
                    data: full_data.filter(obj => (obj.type !== 'system' || iface_kind !== 'services'))
                                   .map(subData)
                                   .sort(sorter)
                });
            }
        );
    }
}

export const deleter = new QorusDelete();
