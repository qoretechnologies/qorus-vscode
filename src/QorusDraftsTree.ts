const tago = require('javascript-time-ago');
import * as en from 'javascript-time-ago/locale/en.json';
import { capitalize, size } from 'lodash';
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

      if (!size(allDraftFolders)) {
        return [new QorusDraftItem('No drafts found', ``, TreeItemCollapsibleState.None)];
      }

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
      console.log(draft);

      return new QorusDraftItem(
        `${draft.name} ${draft.isValid ? '✅' : '❌'}`,
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
    interfaceKind?: string,
    interfaceId?: string
  ) {
    super(label, collapsibleState);
    this.tooltip = interfaceKind
      ? `${interfaceKind}${interfaceId ? `|${interfaceId}` : ''}`
      : undefined;
    this.description = this.date;
    this.iconPath = interfaceKind
      ? qorusIcons[`get${capitalize(interfaceKind).replace('-', '').replace(' ', '')}Icon`]?.()
      : undefined;

    if (!interfaceKind) {
      this.contextValue = 'empty';
    }

    if (interfaceKind && interfaceId) {
      this.contextValue = 'draft';
      this.command = {
        title: 'Open Draft',
        command: 'qorus.openDraft',
        arguments: [interfaceKind, interfaceId],
      };
    }
  }
}

export const drafts_tree = new QorusDraftsTree();
