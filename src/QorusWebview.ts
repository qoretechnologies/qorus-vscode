import * as vscode from 'vscode';
import * as path from 'path';
import * as msg from './qorus_message';
import { t, gettext } from 'ttag';
import { deleter } from './QorusDelete';


class QorusWebview {
    private panel: vscode.WebviewPanel | undefined = undefined;

    open(active_tab?: string) {
        this.panel;
        if(this.panel) {
            this.panel.reveal(vscode.ViewColumn.One);
            this.setActiveTab(active_tab);
            return;
        }

        const web_path = path.join(__dirname, '..', 'dist');
        vscode.workspace.openTextDocument(path.join(web_path, 'index.html')).then(
            doc => {
                this.panel = vscode.window.createWebviewPanel(
                    'qorusWebview',
                    t`QorusWebviewTitle`,
                    vscode.ViewColumn.One,
                    {
                        enableScripts: true
                    }
                );
                this.panel.webview.html = doc.getText().replace(/{{ path }}/g, web_path);
                this.setActiveTab(active_tab);

                this.panel.onDidDispose(() => {
                    this.panel = undefined;
                });

                this.panel.webview.onDidReceiveMessage(message => {
                    switch (message.action) {
                        case 'get-text':
                            this.panel.webview.postMessage({
                                action: 'return-text',
                                text_id: message.text_id,
                                text: gettext(message.text_id)
                            });
                            break;
                        case 'get-interfaces':
                            deleter.getInterfaces(message.iface_kind, message.columns, this.panel.webview);
                            break;
                        case 'delete-interfaces':
                            deleter.deleteInterfaces(message.iface_kind, message.ids, this.panel.webview);
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

    private setActiveTab(active_tab?: string) {
        if (!active_tab || !this.panel) {
            return;
        }
        this.panel.webview.postMessage({
            action: 'set-active-tab',
            active_tab: active_tab
        });
    }
}

export const webview = new QorusWebview();
