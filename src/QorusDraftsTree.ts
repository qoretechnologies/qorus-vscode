const tago = require('javascript-time-ago');
import * as en from 'javascript-time-ago/locale/en.json';
import { capitalize } from 'lodash';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { QorusDraftsInstance } from './QorusDrafts';
import { qorusIcons } from './QorusIcons';

tago.addDefaultLocale(en);
const timeAgo = new tago('en-US');

class QorusDraftsTree implements TreeDataProvider<QorusDraftItem> {
    private onTreeDataChanged: EventEmitter<QorusDraftItem | undefined> = new EventEmitter<
        QorusDraftItem | undefined
    >();
    readonly onDidChangeTreeData: Event<QorusDraftItem | undefined> = this.onTreeDataChanged.event;

    notify() {
        this.refresh();
    }

    refresh() {
        // @ts-ignore
        this.onTreeDataChanged.fire();
    }

    getTreeItem(node: QorusDraftItem): QorusDraftItem {
        return node;
    }

    async getChildren(el): Promise<QorusDraftItem[]> {
        // Fetch the draft folders if we are rendering the root
        if (!el) {
            const allDraftFolders = QorusDraftsInstance.getDraftsFolders();

            return allDraftFolders.map((folder) => {
                return new QorusDraftItem(
                    capitalize(folder.replace('-', ' ')),
                    `(${QorusDraftsInstance.getDraftsCountForInterface(folder).toString()})`,
                    TreeItemCollapsibleState.Collapsed,
                    folder
                );
            });
        }
        const label = el.label.toLowerCase();
        // A category has been expanded, we need to fetch the individual drafts for this
        // folder
        const sortedDrafts = QorusDraftsInstance.getDraftsForInterface(label);

        return sortedDrafts.map((draft) => {
            return new QorusDraftItem(
                draft.name,
                `[${timeAgo.format(draft.date)}]` as string,
                TreeItemCollapsibleState.None,
                el.label.toLowerCase(),
                draft.interfaceId
            );
        });
    }
}

class QorusDraftItem extends TreeItem {
    constructor(
        public readonly label: string,
        private date: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        interfaceKind: string,
        interfaceId?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${interfaceKind}${interfaceId ? `|${interfaceId}` : ''}`;
        this.description = this.date;
        this.iconPath = qorusIcons[`get${capitalize(interfaceKind).replace('-', '')}Icon`]?.();

        if (interfaceId) {
            this.contextValue = 'draft';
        }
    }
}

export const drafts_tree = new QorusDraftsTree();
