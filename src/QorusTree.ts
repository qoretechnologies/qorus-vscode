import * as vscode from 'vscode';
import * as path from 'path';
import { AuthNeeded } from './QorusAuth';
import { deployer as auth } from './QorusDeploy';
import { isVersion3 } from './qorus_utils';
import * as msg from './qorus_message';
import { t } from 'ttag';


class QorusTree implements vscode.TreeDataProvider<QorusTreeNode> {

    private data: any;
    private qorus_instances: any = {};

    private setQorusInstances() {
        if (!this.data) {
            msg.error(t`qorusProjectNotSet`);
            return;
        }
        this.qorus_instances = {};
        for (let env_id in this.data.qorus_instances) {
            for (let instance of this.data.qorus_instances[env_id]) {
                this.qorus_instances[instance.url] = instance;
            }
        }
    }

    getQorusInstance(url: string): any {
        return this.qorus_instances[url];
    }

    private onTreeDataChanged: vscode.EventEmitter<QorusTreeNode | undefined>
        = new vscode.EventEmitter<QorusTreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<QorusTreeNode | undefined>
        = this.onTreeDataChanged.event;

    refresh() {
        this.onTreeDataChanged.fire();
    }

    reset(data: any) {
        this.data = data;
        this.setQorusInstances();
        this.refresh();
    }

    getTreeItem(node: QorusTreeNode): QorusTreeNode {
        return node;
    }

    getChildren(node?: QorusTreeNode): QorusTreeNode[] {
        if (!node) { // root node
            if (!this.data) {
                msg.warning(t`qorusProjectNotSet`);
                return [];
            }
            let children: QorusTreeNode[] = [];
            for (let env_id in this.data.qorus_instances) {
                children.push(new QorusTreeEnvNode(env_id));
            }
            return children;
        }

        return node.getChildren(this.data);
    }
}

abstract class QorusTreeNode extends vscode.TreeItem {
    constructor(label: string, collapsibleState: vscode.TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    getChildren(_data: any): QorusTreeNode[] {
        return [];
    }
}

class QorusTreeEnvNode extends QorusTreeNode {
    env_id: string;

    constructor(env_id: string) {
        super(env_id, vscode.TreeItemCollapsibleState.Expanded);
        this.env_id = env_id;
        this.tooltip = t`environmentLabel ${env_id}`;
    }

    getChildren(data: any): QorusTreeNode[] {
        let children: QorusTreeNode[] = [];
        for (let instance of data.qorus_instances[this.env_id]) {
            children.push(new QorusTreeInstanceNode(instance));
        }
        return children;
    }
}

export class QorusTreeInstanceNode extends QorusTreeNode {
    instance: any;
    is_active: boolean;

    constructor(instance: any) {
        super(instance.name, vscode.TreeItemCollapsibleState.Expanded);

        this.is_active = auth.isActive(instance.url);
        this.instance = instance;
        this.contextValue = 'qorus';
        this.contextValue += this.is_active ? ':active' : ':inactive';

        if (this.is_active) {
            this.iconPath = path.join(__dirname, '..', 'images', 'green_circle.png');
        }

        if (auth.isLoggedIn(instance.url)) {
            this.contextValue += ':loggedIn';
        }
        else {
            switch (auth.authNeeded(instance.url)) {
                case AuthNeeded.Yes: this.contextValue += ':loggedOut'; break;
                case AuthNeeded.No:  this.contextValue += ':noAuth';    break;
                default:             this.contextValue += ':unknown';
            }
        }

        this.tooltip = t`qorusInstanceLabel ${instance.name} ${instance.url}`;
        if (this.is_active) {
            this.tooltip += '\n' + t`nowActiveLabel`;
        }
        if (isVersion3(instance.version)) {
            this.tooltip += '\n' + t`version3Label`;
        }

        this.command = {
            command: 'qorus.setActiveInstance',
            title: t`setActiveInstance`,
            arguments: [instance.url]
        };
    }

    getChildren(_data: any): QorusTreeNode[] {
        let children: QorusTreeNode[] = [];
        if (!this.is_active) {
            children.push(new QorusTreeSetActiveNode(this.instance));
        }
        children.push(new QorusTreeUrlNode(this.instance));
        if (this.instance.custom_urls) {
            for (let custom_url of this.instance.custom_urls) {
                children.push(new QorusTreeCustomUrlNode(custom_url));
            }
        }
        return children;
    }

    getUrl(): string | undefined {
        return this.instance.url;
    }
}

class QorusTreeSetActiveNode extends QorusTreeNode {
    constructor(url: any) {
        super(t`setActiveInstance`, vscode.TreeItemCollapsibleState.None)
        this.tooltip = t`setActiveInstance`;
        this.command = {
            command: 'qorus.setActiveInstance',
            title: t`setActiveInstance`,
            arguments: [url.url]
        };
    }
}

class QorusTreeUrlNode extends QorusTreeNode {
    constructor(url: any) {
        super(t`openUi`, vscode.TreeItemCollapsibleState.None)
        this.tooltip = t`openUi`;
        this.command = {
            command: 'qorus.openUrlInExternalBrowser',
            title: t`openUi`,
            arguments: [url.url, url.name]
        };
    }
}

class QorusTreeCustomUrlNode extends QorusTreeNode {
    constructor(url: any) {
        const label = `${url.name} (${url.url})`;
        super(label, vscode.TreeItemCollapsibleState.None);

        this.tooltip = url.name;
        this.command = {
            command: 'qorus.openUrlInExternalBrowser',
            title: t`openUrlLabel`,
            arguments: [url.url, url.name]
        };
    }
}

export const tree = new QorusTree();
