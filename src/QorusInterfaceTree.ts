import { basename, join } from 'path';
import { t } from 'ttag';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import { qorusIcons } from './QorusIcons';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';


class QorusInterfaceTree implements TreeDataProvider<QorusInterfaceTreeNode> {
    private extensionPath: string;
    private data: any;
    private is_folder_view: boolean = false;
    private code_info: QorusProjectCodeInfo;

    setExtensionPath(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    private onTreeDataChanged: EventEmitter<QorusInterfaceTreeNode | undefined>
        = new EventEmitter<QorusInterfaceTreeNode | undefined>();
    readonly onDidChangeTreeData: Event<QorusInterfaceTreeNode | undefined>
        = this.onTreeDataChanged.event;

    notify(code_info) {
        this.code_info = code_info;
        this.refresh();
    }

    refresh() {
        if (this.code_info) {
            // @ts-ignore
            this.onTreeDataChanged.fire();
        }
    }

    getTreeItem(node: QorusInterfaceTreeNode): QorusInterfaceTreeNode {
        return node;
    }

    setCategoryView() {
        this.is_folder_view = false;
        this.refresh();
    }

    setFolderView() {
        this.is_folder_view = true;
        this.refresh();
    }

    private async getRootChildren(): Promise<QorusInterfaceTreeNode[]> {
        let children: QorusInterfaceTreeNode[] = [];
        if (this.is_folder_view) { // folder view
            if (this.code_info) {
                const fileTree = this.code_info.fileTree().sort((a, b) => {
                    return basename(a.rel_path).localeCompare(basename(b.rel_path));
                });
                for (const dir of fileTree) {
                    children.push(new QorusTreeDirectoryNode(this.code_info, dir.rel_path, true, dir, this.extensionPath));
                }
            }
        } else { // interface view
            children.push(new QorusTreeWorkflowCategoryNode(this.code_info));
            children.push(new QorusTreeStepCategoryNode(this.code_info));
            children.push(new QorusTreeServiceCategoryNode(this.code_info));
            children.push(new QorusTreeJobCategoryNode(this.code_info));
            children.push(new QorusTreeClassCategoryNode(this.code_info));
            children.push(new QorusTreeMapperCategoryNode(this.code_info));
            children.push(new QorusTreeMapperCodeCategoryNode(this.code_info));
            children.push(new QorusTreeTypeCategoryNode(this.code_info));
            children.push(new QorusTreePipelineCategoryNode(this.code_info));
            children.push(new QorusTreeFSMCategoryNode(this.code_info));
            children.push(new QorusTreeConnectionCategoryNode(this.code_info));
            children.push(new QorusTreeGroupCategoryNode(this.code_info));
            children.push(new QorusTreeEventCategoryNode(this.code_info));
            children.push(new QorusTreeQueueCategoryNode(this.code_info));
            children.push(new QorusTreeValueMapCategoryNode(this.code_info));
            children.push(new QorusTreeErrorsCategoryNode(this.code_info));
        }

        return children;
    }

    async getChildren(node?: QorusInterfaceTreeNode): Promise<QorusInterfaceTreeNode[]> {
        if (!this.code_info) {
            return [];
        }

        if (!node) { // root node
            return this.getRootChildren();
        }

        return node.getChildren(this.data);
    }
}

class QorusInterfaceTreeNode extends TreeItem {
    public description: string | undefined;
    protected code_info: QorusProjectCodeInfo;

    constructor(code_info, label: string, collapsibleState?: TreeItemCollapsibleState) {
        super(label, collapsibleState);
        this.code_info = code_info;
    }

    async getChildren(_data: any): Promise<QorusInterfaceTreeNode[]> {
        return [];
    }
}


// single interface nodes

class QorusSingleInterfaceNode extends QorusInterfaceTreeNode {
    public name: string | undefined;
    public data: any;

    constructor(code_info, label: string, collapsibleState?: TreeItemCollapsibleState) {
        super(code_info, label, collapsibleState);
        this.command = {
            command: 'qorus.views.openInterface',
            title: t`OpenInterface`,
            arguments: [this]
        };
    }
}

class QorusTreeClassNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'class';
        this.iconPath = qorusIcons.getClassIcon();
    }
}

class QorusTreeConnectionNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'connection';
        this.iconPath = qorusIcons.getConnectionIcon();
    }
}

class QorusTreeErrorsNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'errors';
        this.iconPath = qorusIcons.getErrorsIcon();
    }
}

class QorusTreeEventNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'event';
        this.iconPath = qorusIcons.getEventIcon();
    }
}

class QorusTreeGroupNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'group';
        this.iconPath = qorusIcons.getGroupIcon();
    }
}

class QorusTreeFSMNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'fsm';
        this.iconPath = qorusIcons.getFsmIcon();
    }
}

class QorusTreePipelineNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.contextValue = 'pipeline';
        this.iconPath = qorusIcons.getPipelineIcon();
    }
}

class QorusTreeTypeNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'type';
        this.iconPath = qorusIcons.getTypeIcon();
    }
}

class QorusTreeJobNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'job';
        this.iconPath = qorusIcons.getJobIcon();
    }
}

class QorusTreeMapperNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        name = name.split(':')[0];
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'mapper';
        this.iconPath = qorusIcons.getMapperIcon();
    }
}

class QorusTreeMapperCodeNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'mapper-code';
        this.iconPath = qorusIcons.getMapperCodeIcon();
    }
}

class QorusTreeQueueNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'queue';
        this.iconPath = qorusIcons.getQueueIcon();
    }
}

class QorusTreeServiceNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'service';
        this.iconPath = qorusIcons.getServiceIcon();
    }
}

class QorusTreeStepNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        name = name.split(':')[0];
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'step';
        this.iconPath = qorusIcons.getStepIcon();
    }
}

class QorusTreeValueMapNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'value-map';
        this.iconPath = qorusIcons.getValueMapIcon();
    }
}

class QorusTreeWorkflowNode extends QorusSingleInterfaceNode {
    constructor(code_info, name: string, data: any) {
        super(code_info, name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'workflow';
        this.iconPath = qorusIcons.getWorkflowIcon();
    }
}

class QorusTreeDirectoryNode extends QorusInterfaceTreeNode {
    protected absPath: string;
    protected directory: string;
    protected fileTree;
    protected extensionPath: string;

    constructor(code_info, dir, isRoot, fileTree, extensionPath, collapsibleState?: TreeItemCollapsibleState) {
        super(code_info, isRoot ? dir : basename(dir), collapsibleState || TreeItemCollapsibleState.Expanded);
        this.absPath = fileTree.abs_path;
        this.directory = dir;
        this.fileTree = fileTree;
        this.tooltip = dir;
        this.contextValue = 'dir';
        this.extensionPath = extensionPath;
        this.iconPath = qorusIcons.getFolderIcon();
    }

    getAbsPath(): string {
        return this.absPath;
    }

    getDirectoryName(): string {
        return this.directory;
    }

    getVscodeUri(): Uri {
        return Uri.file(this.absPath);
    }

    async getChildren(_node?: QorusInterfaceTreeNode): Promise<QorusInterfaceTreeNode[]> {
        let children = [];
        const files = this.fileTree.files.sort( (a, b) => a.name.localeCompare(b.name) );
        for (const f of files) {
            if (f.name.endsWith('.yaml')) {
                const data = this.code_info.yaml_info.yamlDataByYamlFile(join(f.abs_path, f.name)) || {};
                switch (data.type) {
                    case 'class':
                        children.push(new QorusTreeClassNode(this.code_info, data.name, data));
                        break;
                    case 'connection':
                        children.push(new QorusTreeConnectionNode(this.code_info, data.name, data));
                        break;
                    case 'errors':
                        children.push(new QorusTreeErrorsNode(this.code_info, data.name, data));
                        break;
                    case 'event':
                        children.push(new QorusTreeEventNode(this.code_info, data.name, data));
                        break;
                    case 'group':
                        children.push(new QorusTreeGroupNode(this.code_info, data.name, data));
                        break;
                    case 'job':
                        children.push(new QorusTreeJobNode(this.code_info, data.name, data));
                        break;
                    case 'mapper':
                        children.push(new QorusTreeMapperNode(this.code_info, data.name, data));
                        break;
                    case 'mapper-code':
                        children.push(new QorusTreeMapperCodeNode(this.code_info, data.name, data));
                        break;
                    case 'queue':
                        children.push(new QorusTreeQueueNode(this.code_info, data.name, data));
                        break;
                    case 'service':
                        children.push(new QorusTreeServiceNode(this.code_info, data.name, data));
                        break;
                    case 'step':
                        children.push(new QorusTreeStepNode(this.code_info, data.name, data));
                        break;
                    case 'value-map':
                        children.push(new QorusTreeValueMapNode(this.code_info, data.name, data));
                        break;
                    case 'workflow':
                        children.push(new QorusTreeWorkflowNode(this.code_info, data.name, data));
                        break;
                    case 'fsm':
                        children.push(new QorusTreeFSMNode(this.code_info, data.name, data));
                        break;
                    case 'pipeline':
                        children.push(new QorusTreePipelineNode(this.code_info, data.name, data));
                        break;
                    default:
                        break;
                }
            }
        }
        const dirs = this.fileTree.dirs.sort( (a, b) => basename(a.rel_path).localeCompare(basename(b.rel_path)) );
        for (const dir of dirs) {
            children.push(new QorusTreeDirectoryNode(this.code_info, dir.rel_path, false, dir, this.extensionPath));
        }

        return children;
    }
}

class QorusTreeCategoryNode extends QorusInterfaceTreeNode {
    protected category: string;

    constructor(code_info, label: string, category: string, collapsibleState?: TreeItemCollapsibleState) {
        super(code_info, label, collapsibleState);
        this.category = category;
        this.tooltip = label;
        this.contextValue = category + '-category';
        this.iconPath = qorusIcons.getPackageIcon();
    }
}

// interface category nodes

class QorusTreeClassCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Classes`, 'class', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeClassNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeClassNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeConnectionCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Connections`, 'connection', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeConnectionNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeConnectionNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeErrorsCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Errors`, 'errors', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeErrorsNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeErrorsNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeEventCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Events`, 'event', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeEventNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeEventNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeGroupCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Groups`, 'group', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeGroupNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeGroupNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeTypeCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Types`, 'type', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeTypeNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeTypeNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeFSMCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`FSMs`, 'fsm', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeTypeNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeFSMNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreePipelineCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Pipelines`, 'pipeline', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeTypeNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreePipelineNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeJobCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Jobs`, 'job', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeJobNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeJobNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeMapperCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Mappers`, 'mapper', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeMapperNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeMapperNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeMapperCodeCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`MapperCode`, 'mapper-code', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeMapperCodeNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeMapperCodeNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeQueueCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Queues`, 'queue', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeQueueNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeQueueNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeServiceCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Services`, 'service', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeServiceNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeServiceNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeStepCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Steps`, 'step', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeStepNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeStepNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeValueMapCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`ValueMaps`, 'value-map', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeValueMapNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeValueMapNode(this.code_info, name, data));
        });
        return children;
    }
}

class QorusTreeWorkflowCategoryNode extends QorusTreeCategoryNode {
    constructor(code_info) {
        super(code_info, t`Workflows`, 'workflow', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let children = [];
        this.code_info.interfaceDataByType(this.category).forEach(({name, data}) => {
            children.push(new QorusTreeWorkflowNode(this.code_info, name, data));
        });
        return children;
    }
}

export const interface_tree = new QorusInterfaceTree();
