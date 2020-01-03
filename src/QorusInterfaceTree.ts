import { basename, join } from 'path';
import { t } from 'ttag';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState, Uri } from 'vscode';

import { qorusIcons } from './QorusIcons';
import { projects, QorusProject } from './QorusProject';


class QorusInterfaceTree implements TreeDataProvider<QorusInterfaceTreeNode> {
    private extensionPath: string;
    private data: any;
    private is_folder_view: boolean = false;

    setExtensionPath(extensionPath: string) {
        this.extensionPath = extensionPath;
    }

    public static getInterfaces(iface_kind: string): Promise<any[]> {
        const project: QorusProject = projects.getProject();
        return project && project.code_info.interfaceDataByType(iface_kind);
    }

    public static getFileData(filePath: string): Promise<any> {
        const project: QorusProject = projects.getProject();
        return project && project.code_info.interfaceDataByFile(filePath);
    }

    private onTreeDataChanged: EventEmitter<QorusInterfaceTreeNode | undefined>
        = new EventEmitter<QorusInterfaceTreeNode | undefined>();
    readonly onDidChangeTreeData: Event<QorusInterfaceTreeNode | undefined>
        = this.onTreeDataChanged.event;

    treeNotify() {
        // perform refresh and eventually other things
        this.refresh();
    }

    refresh() {
        this.onTreeDataChanged.fire();
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
            const project: QorusProject = projects.getProject();
            if (project) {
                let fileTree = project.code_info.fileTree();
                for (const dir of fileTree) {
                    children.push(new QorusTreeDirectoryNode(dir.rel_path, dir, this.extensionPath));
                }
            }
        } else { // interface view
            children.push(new QorusTreeWorkflowCategoryNode());
            children.push(new QorusTreeStepCategoryNode());
            children.push(new QorusTreeServiceCategoryNode());
            children.push(new QorusTreeJobCategoryNode());
            children.push(new QorusTreeClassCategoryNode());
            children.push(new QorusTreeOtherCategoriesNode());
        }

        return children;
    }

    getChildren(node?: QorusInterfaceTreeNode): Promise<QorusInterfaceTreeNode[]> {
        if (!node) { // root node
            return this.getRootChildren();
        }

        return node.getChildren(this.data);
    }
}

class QorusInterfaceTreeNode extends TreeItem {
    public description: string | undefined;

    constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
        super(label, collapsibleState);
    }

    async getChildren(_data: any): Promise<QorusInterfaceTreeNode[]> {
        return [];
    }
}


// single interface nodes

class QorusSingleInterfaceNode extends QorusInterfaceTreeNode {
    public name: string | undefined;
    public data: any;

    constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
        super(label, collapsibleState);
        this.command = {
            command: 'qorus.views.openInterface',
            title: t`OpenInterface`,
            arguments: [this]
        };
    }
}

class QorusTreeClassNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'class';
        this.iconPath = qorusIcons.getClassIcon();
    }
}

class QorusTreeConnectionNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'connection';
        this.iconPath = qorusIcons.getConnectionIcon();
    }
}

class QorusTreeConstantNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'constant';
        this.iconPath = qorusIcons.getConstantIcon();
    }
}

class QorusTreeErrorNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'error';
        this.iconPath = qorusIcons.getErrorIcon();
    }
}

class QorusTreeEventNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'event';
        this.iconPath = qorusIcons.getEventIcon();
    }
}

class QorusTreeFunctionNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'function';
        this.iconPath = qorusIcons.getFunctionIcon();
    }
}

class QorusTreeGroupNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'group';
        this.iconPath = qorusIcons.getGroupIcon();
    }
}

class QorusTreeJobNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'job';
        this.iconPath = qorusIcons.getJobIcon();
    }
}

class QorusTreeMapperNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        name = name.split(':')[0];
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'mapper';
        this.iconPath = qorusIcons.getMapperIcon();
    }
}

class QorusTreeMapperCodeNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'mapper-code';
        this.iconPath = qorusIcons.getMapperCodeIcon();
    }
}

class QorusTreeQueueNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'queue';
        this.iconPath = qorusIcons.getQueueIcon();
    }
}

class QorusTreeServiceNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'service';
        this.iconPath = qorusIcons.getServiceIcon();
    }
}

class QorusTreeStepNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        name = name.split(':')[0];
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'step';
        this.iconPath = qorusIcons.getStepIcon();
    }
}

class QorusTreeValueMapNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
        this.name = name;
        this.data = data;
        this.tooltip = data.desc;
        this.description = data.version || '';
        this.contextValue = 'value-map';
        this.iconPath = qorusIcons.getValueMapIcon();
    }
}

class QorusTreeWorkflowNode extends QorusSingleInterfaceNode {
    constructor(name: string, data: any) {
        super(name, TreeItemCollapsibleState.None);
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

    constructor(dir: string, fileTree, extensionPath, collapsibleState?: TreeItemCollapsibleState) {
        super(basename(dir), collapsibleState || TreeItemCollapsibleState.Expanded);
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
        for (const f of this.fileTree.files) {
            if (f.name.endsWith('.yaml')) {
                let data = await QorusInterfaceTree.getFileData(join(f.abs_path, f.name));
                switch (data.type) {
                    case 'class':
                        children.push(new QorusTreeClassNode(data.name, data));
                        break;
                    case 'connection':
                        children.push(new QorusTreeConnectionNode(data.name, data));
                        break;
                    case 'constant':
                        children.push(new QorusTreeConstantNode(data.name, data));
                        break;
                    case 'error':
                        children.push(new QorusTreeErrorNode(data.name, data));
                        break;
                    case 'event':
                        children.push(new QorusTreeEventNode(data.name, data));
                        break;
                    case 'function':
                        children.push(new QorusTreeFunctionNode(data.name, data));
                        break;
                    case 'group':
                        children.push(new QorusTreeGroupNode(data.name, data));
                        break;
                    case 'job':
                        children.push(new QorusTreeJobNode(data.name, data));
                        break;
                    case 'mapper':
                        children.push(new QorusTreeMapperNode(data.name, data));
                        break;
                    case 'mapper-code':
                        children.push(new QorusTreeMapperCodeNode(data.name, data));
                        break;
                    case 'queue':
                        children.push(new QorusTreeQueueNode(data.name, data));
                        break;
                    case 'service':
                        children.push(new QorusTreeServiceNode(data.name, data));
                        break;
                    case 'step':
                        children.push(new QorusTreeStepNode(data.name, data));
                        break;
                    case 'value-map':
                        children.push(new QorusTreeValueMapNode(data.name, data));
                        break;
                    case 'workflow':
                        children.push(new QorusTreeWorkflowNode(data.name, data));
                        break;
                    default:
                        break;
                }
            }
        }
        for (const dir of this.fileTree.dirs) {
            children.push(new QorusTreeDirectoryNode(dir.rel_path, dir, this.extensionPath));
        }

        return children;
    }
}

class QorusTreeCategoryNode extends QorusInterfaceTreeNode {
    protected category: string;

    constructor(label: string, category: string, collapsibleState?: TreeItemCollapsibleState) {
        super(label, collapsibleState);
        this.category = category;
        this.tooltip = label;
        this.contextValue = category + '-category';
        this.iconPath = qorusIcons.getPackageIcon();
    }
}

class QorusTreeOtherCategoriesNode extends QorusInterfaceTreeNode {
    constructor(collapsibleState?: TreeItemCollapsibleState) {
        super(t`Other`, collapsibleState || TreeItemCollapsibleState.Collapsed);
        this.tooltip = t`Other`;
    }

    async getChildren(_node?: QorusInterfaceTreeNode): Promise<QorusInterfaceTreeNode[]> {
        let children = [];
        children.push(new QorusTreeMapperCategoryNode());
        children.push(new QorusTreeMapperCodeCategoryNode());
        children.push(new QorusTreeConnectionCategoryNode());
        children.push(new QorusTreeConstantCategoryNode());
        children.push(new QorusTreeFunctionCategoryNode());
        children.push(new QorusTreeQueueCategoryNode());
        children.push(new QorusTreeErrorCategoryNode());
        children.push(new QorusTreeEventCategoryNode());
        children.push(new QorusTreeGroupCategoryNode());
        children.push(new QorusTreeValueMapCategoryNode());

        return children;
    }
}

// interface category nodes

class QorusTreeClassCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Classes`, 'class', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeClassNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeConnectionCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Connections`, 'connection', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeConnectionNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeConstantCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Constants`, 'constant', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeConstantNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeErrorCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Errors`, 'error', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeErrorNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeEventCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Events`, 'event', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeEventNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeFunctionCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Functions`, 'function', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeFunctionNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeGroupCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Groups`, 'group', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeGroupNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeJobCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Jobs`, 'job', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeJobNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeMapperCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Mappers`, 'mapper', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeMapperNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeMapperCodeCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`MapperCode`, 'mapper-code', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeMapperCodeNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeQueueCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Queues`, 'queue', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeQueueNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeServiceCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Services`, 'service', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeServiceNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeStepCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Steps`, 'step', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeStepNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeValueMapCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`ValueMaps`, 'value-map', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeValueMapNode(iface.name, iface.data));
        }
        return children;
    }
}

class QorusTreeWorkflowCategoryNode extends QorusTreeCategoryNode {
    constructor() {
        super(t`Workflows`, 'workflow', TreeItemCollapsibleState.Expanded);
    }

    async getChildren(): Promise<QorusTreeWorkflowNode[]> {
        let interfaces = await QorusInterfaceTree.getInterfaces(this.category);
        if (interfaces === undefined) {
            return [];
        }

        let children = [];
        for (const iface of interfaces) {
            children.push(new QorusTreeWorkflowNode(iface.name, iface.data));
        }
        return children;
    }
}

export const interface_tree = new QorusInterfaceTree();
