import timeago from 'epoch-timeago';
import { capitalize, size } from 'lodash';
import * as path from 'path';
import { Event, EventEmitter, TreeDataProvider, TreeItem, TreeItemCollapsibleState } from 'vscode';
import { QorusDraftsInstance } from './QorusDrafts';
import { qorusIcons } from './QorusIcons';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';

export type QorusDraftsTreeItem = QorusDraftItem | QorusDraftCategory;
export type QorusDraftTreeItems = QorusDraftsTreeItem[];

export const getTargetFile = (data: any) => {
  if (data?.target_dir && data?.target_file) {
    return path.join(data.target_dir, data.target_file);
  }

  if (data?.yaml_file) {
    return data.yaml_file;
  }

  return '';
};

class QorusDraftsTree implements TreeDataProvider<QorusDraftsTreeItem> {
  public code_info: QorusProjectCodeInfo;

  private onTreeDataChanged: EventEmitter<QorusDraftsTreeItem | undefined> = new EventEmitter<
    QorusDraftItem | undefined
  >();
  readonly onDidChangeTreeData: Event<QorusDraftsTreeItem | undefined> =
    this.onTreeDataChanged.event;

  notify(code_info) {
    this.code_info = code_info;
    this.refresh();
  }

  refresh() {
    // @ts-ignore
    this.onTreeDataChanged.fire();
  }

  getTreeItem(node: QorusDraftsTreeItem): QorusDraftsTreeItem {
    return node;
  }

  async getChildren(el): Promise<QorusDraftTreeItems> {
    if (!this.code_info) {
      return [];
    }
    // Fetch the draft folders if we are rendering the root
    if (!el) {
      const allDraftFolders = QorusDraftsInstance.getDraftsFolders();

      return allDraftFolders.map((folder) => {
        const interfaceCount = size(this.code_info.interfaceDataByType(folder));
        const count = QorusDraftsInstance.getDraftsCountForInterface(folder) + interfaceCount;

        return new QorusDraftCategory(
          capitalize(folder.replace('-', ' ')),
          count,
          count === 0 ? TreeItemCollapsibleState.None : TreeItemCollapsibleState.Collapsed
        );
      });
    }
    const interfaceKind = el.label.toLowerCase().replace(' ', '-');
    const allDrafts = QorusDraftsInstance.getDraftsForInterface(interfaceKind, true);
    // A category has been expanded, we need to fetch the individual drafts for this
    // folder
    const drafts = QorusDraftsInstance.getDraftsForInterface(interfaceKind).map((draft) => ({
      ...draft,
      isDraft: true,
    }));
    // Get all the interfaces for this folder
    const interfaces = this.code_info.interfaceDataByType(interfaceKind).map((interfaceData) => {
      const draft = allDrafts.find(
        (draft) => draft.associatedInterface === getTargetFile(interfaceData.data)
      );

      return {
        ...interfaceData,
        hasDraft: !!draft,
        ...(draft || {}),
        isDraft: false,
      };
    });
    // Combine the interfaces with the drafts
    const items = [...drafts, ...interfaces];

    return items.map((item) => {
      return new QorusDraftItem(item, interfaceKind);
    });
  }
}

class QorusDraftCategory extends TreeItem {
  public type: string;

  constructor(label: string, count: number, collapsibleState: TreeItemCollapsibleState) {
    super(label, collapsibleState);

    this.tooltip = label.toLowerCase();
    this.description = `(${count})`;
    this.iconPath = qorusIcons[`get${capitalize(label).replace('-', '').replace(' ', '')}Icon`]?.();
    this.contextValue = 'category';
    this.type = label.toLowerCase().replace(' ', '-');
  }
}

class QorusDraftItem extends TreeItem {
  public data: any;
  public id: string;
  public type: string;

  constructor(item, interfaceKind: string) {
    // Create the label
    const name = item.name;
    // If the item is new or existing draft, we need to add the timestamp and prefixes
    const prefix = item.hasDraft ? '✏️ ' : item.isDraft ? '✏️ 🔸 ' : '';

    super(`${prefix} ${name}`, TreeItemCollapsibleState.None);
    this.tooltip = item.data?.desc || null;

    this.description = item.date ? `[${timeago(item.date)}]` : '';
    this.description += item.data?.version ? `[${item.data.version}]` : '';
    this.iconPath = interfaceKind
      ? qorusIcons[`get${capitalize(interfaceKind).replace('-', '').replace(' ', '')}Icon`]?.()
      : undefined;

    this.data = item.data;
    this.id = item.interfaceId;
    this.type = interfaceKind;

    if (interfaceKind && item.isDraft) {
      this.contextValue = 'draft';
      this.command = {
        title: 'Open Draft',
        command: 'qorus.openDraft',
        arguments: [interfaceKind, item.interfaceId],
      };
    } else {
      this.contextValue = `interface${this.data.target_file ? '|hasCode' : ''}${
        item.hasDraft ? '|hasChanges' : ''
      }`;
      this.command = {
        title: 'Open Interface',
        command: 'qorus.views.editInterface',
        arguments: [this],
      };
    }
  }
}

export { QorusDraftItem };
export const drafts_tree = new QorusDraftsTree();
