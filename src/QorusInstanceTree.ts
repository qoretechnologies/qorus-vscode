import * as path from 'path';
import { t } from 'ttag';
import * as vscode from 'vscode';
import { AuthNeeded } from './QorusAuth';
import { qorus_request as auth } from './QorusRequest';
import { projects, QorusProject } from './QorusProject';
import * as msg from './qorus_message';
import { isVersion3, modifyUrl } from './qorus_utils';

class QorusInstanceTree implements vscode.TreeDataProvider<QorusTreeNode> {

    private data: any;
    private qorus_instances: any = {};

    private setQorusInstances() {
        if (!Object.keys(this.data || {}).length) {
            msg.error(t`QorusProjectNotSet`);
            return;
        }
        this.qorus_instances = {};
        for (let env_name in this.data) {
            for (let instance of this.data[env_name]) {
                instance.url = modifyUrl(instance.url, 'decrypt-pwd');
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

    private maybeCreateProjectConfig() {
        const project: QorusProject = projects.getProject();
        if (project && !project.configFileExists()) {
            project.createConfigFile();
        }
    }

    refresh() {
        // @ts-ignore
        this.onTreeDataChanged.fire();
    }

    reset(data: any) {
        this.data = data;
        this.setQorusInstances();
        this.refresh();
    }

    focus() {
        vscode.commands.executeCommand('qorusInstancesExplorer.focus');
    }

    getTreeItem(node: QorusTreeNode): QorusTreeNode {
        return node;
    }

    getChildren(node?: QorusTreeNode): QorusTreeNode[] {
        if (!node) { // root node
            if (!Object.keys(this.data || {}).length) {
                this.maybeCreateProjectConfig();
                return [];
            }
            let children: QorusTreeNode[] = [];
            for (let env_name in this.data) {
                children.push(new QorusTreeEnvNode(env_name));
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
    env_name: string;

    constructor(env_name: string) {
        super(env_name, vscode.TreeItemCollapsibleState.Expanded);
        this.env_name = env_name;
        this.tooltip = t`Environment ${env_name}`;
    }

    getChildren(data: any): QorusTreeNode[] {
        let children: QorusTreeNode[] = [];
        for (let instance of data[this.env_name]) {
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

        this.tooltip = t`QorusInstance ${instance.name} ${instance.url}`;
        if (this.is_active) {
            this.tooltip += '\n' + t`nowActive`;
        }
        if (isVersion3(instance.version)) {
            this.tooltip += '\n' + t`version3`;
        }

        this.command = {
            command: 'qorus.setActiveInstance',
            title: t`SetActiveInstance`,
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
        if (this.is_active) {
            children.push(new QorusTreeLogoutNode(this.instance));
        }
        return children;
    }

    getUrl(): string {
        return this.instance.url || '';
    }
}

class QorusTreeSetActiveNode extends QorusTreeNode {
    constructor(url: any) {
        super(t`SetActiveInstance`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = t`SetActiveInstance`;
        this.command = {
            command: 'qorus.setActiveInstance',
            title: t`SetActiveInstance`,
            arguments: [url.url]
        };
    }
}

class QorusTreeUrlNode extends QorusTreeNode {
    constructor(url: any) {
        super(t`OpenUi`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = t`OpenUi`;
        this.command = {
            command: 'qorus.openUrlInExternalBrowser',
            title: t`OpenUi`,
            arguments: [url.url, url.name]
        };
    }
}


class QorusTreeLogoutNode extends QorusTreeNode {
    constructor(url) {
        super(t`Logout`, vscode.TreeItemCollapsibleState.None);
        this.tooltip = t`Logout`;
        this.command = {
            command: 'qorus.logout',
            title: t`Logout`,
            arguments: [url.url, url.name],
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
            title: t`OpenUrl`,
            arguments: [url.url, url.name]
        };
    }
}

export const instance_tree = new QorusInstanceTree();
