import { readdirSync, readFileSync } from 'fs';
import { capitalize, size, sortBy } from 'lodash';
import * as path from 'path';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { qorusIcons } from './QorusIcons';
import { getOs, unsavedFilesLocation } from './QorusWebview';

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
            const allDraftFolders = readdirSync(
                path.join(process.env.HOME, unsavedFilesLocation[getOs()])
            );

            return allDraftFolders.map((folder) => {
                // Get the number of drafts for this interface
                const draftFiles = readdirSync(
                    path.join(process.env.HOME, unsavedFilesLocation[getOs()], folder)
                );

                return new QorusDraftItem(
                    capitalize(folder),
                    `(${size(draftFiles).toString()})`,
                    TreeItemCollapsibleState.Collapsed,
                    folder
                );
            });
        }
        // A category has been expanded, we need to fetch the individual drafts for this
        // folder
        const drafts: any[] = [];
        const draftFiles = readdirSync(
            path.join(process.env.HOME, unsavedFilesLocation[getOs()], el.label.toLowerCase())
        );

        draftFiles.forEach((fileName) => {
            const fileContent = readFileSync(
                path.join(
                    process.env.HOME,
                    unsavedFilesLocation[getOs()],
                    el.label.toLowerCase(),
                    fileName
                )
            );
            const buffer: Buffer = Buffer.from(fileContent);
            const contents = buffer.toString();
            drafts.push(JSON.parse(contents));
        });

        const sortedDrafts = sortBy(drafts, (draft) => draft.date).reverse();

        return sortedDrafts.map((draft) => {
            console.log(draft);
            const name =
                (draft.data || []).find(
                    (field) => field.name === 'name' || field.name === 'class-class-name'
                )?.value || 'Unnamed Interface';

            return new QorusDraftItem(
                name,
                draft.date.toString(),
                TreeItemCollapsibleState.None,
                el.label.toLowerCase()
            );
        });
    }
}

class QorusDraftItem extends TreeItem {
    constructor(
        public readonly label: string,
        private date: string,
        public readonly collapsibleState: TreeItemCollapsibleState,
        interfaceKind: string
    ) {
        super(label, collapsibleState);
        this.tooltip = `${this.label}-${this.date}`;
        this.description = this.date;
        this.iconPath = qorusIcons[`get${capitalize(interfaceKind).replace('-', '')}Icon`]?.();
    }
}

export const drafts_tree = new QorusDraftsTree();
