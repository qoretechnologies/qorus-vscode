import { mkdirSync, readdirSync, readFileSync } from 'fs';
import * as fse from 'fs-extra';
import { capitalize, find, size, sortBy } from 'lodash';
import * as os from 'os';
import * as path from 'path';
import * as vscode from 'vscode';
import { drafts_tree } from './QorusDraftsTree';
const md5 = require('md5');

export const getOs = () => {
  switch (os.platform()) {
    case 'darwin':
      return 'MACOS';
    case 'win32':
      return 'WINDOWS';
    default:
      return 'LINUX';
  }
};

class QorusDrafts {
  constructor() {
    // Precreate the backups folder if it does not exist
    try {
      readdirSync(this.getDraftsLocation());
    } catch (e) {
      mkdirSync(this.getDraftsLocation(), {
        recursive: true,
      });
    }
  }

  private getDraftsLocation() {
    const os = getOs();

    // prevent the extension from refusing to load with a confusing error when there is no current workspace
    const dir_hash = vscode.workspace.workspaceFolders
      ? md5(vscode.workspace.workspaceFolders[0].uri.toString())
      : 'x';

    if (os == 'WINDOWS') {
      return path.join(process.env.APPDATA, 'Code\\Backups', dir_hash);
    }

    const draftFilesLocation = {
      LINUX: '.config/Code/Backups',
      MACOS: 'Library/Application Support/Code/Backups',
    };

    return path.join(require('os').homedir(), draftFilesLocation[os], dir_hash);
  }

  public getDraftsFolders() {
    // Get all the folders associated with drafts
    // folder name === interface kind
    const folders = [
      'workflow',
      'step',
      'job',
      'service',
      'mapper-code',
      'value-map',
      'queue',
      'event',
      'class',
      'mapper',
      'type',
      'pipeline',
      'fsm',
      'connection',
      'group',
      'errors',
    ].sort();

    return folders;
  }

  public getSingleDraftContent(interfaceKind: string, fileName: string) {
    const file = readFileSync(
      path.join(this.getDraftsLocation(), interfaceKind.toLowerCase().replace(/ /g, '-'), fileName)
    );
    const buffer: Buffer = Buffer.from(file);
    const contents = buffer.toString();
    const draft = JSON.parse(contents);
    // build the name
    const name =
      draft.name ||
      find(
        draft.selectedFields || [],
        (field) => field.name === 'name' || field.name === 'class-class-name'
      )?.value ||
      `Unnamed ${capitalize(interfaceKind)}`;

    return {
      ...draft,
      fileName,
      name,
    };
  }

  public getDraftsForInterface(interfaceKind: string, withExisting?: boolean) {
    const drafts: any[] = [];
    try {
      const draftFiles = readdirSync(
        path.join(this.getDraftsLocation(), interfaceKind.toLowerCase().replace(/ /g, '-'))
      );

      draftFiles.forEach((fileName) => {
        drafts.push(this.getSingleDraftContent(interfaceKind, fileName));
      });

      return sortBy(drafts, (draft) => draft.date)
        .filter((draft) => (withExisting ? true : !draft.associatedInterface))
        .reverse();
    } catch (e) {
      return [];
    }
  }

  public getDraftsCountForInterface(interfaceKind: string): number {
    return size(this.getDraftsForInterface(interfaceKind));
  }

  public getAllDraftCategoriesWithCount(): { [interfaceKind: string]: number } {
    const folders = this.getDraftsFolders();

    return folders.reduce(
      (newFolders, folder) => ({
        ...newFolders,
        [folder]: this.getDraftsCountForInterface(folder),
      }),
      {}
    );
  }

  public deleteDraftOrDrafts(
    interfaceKind: string,
    interfaceId?: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) {
    const loc = path.join(
      this.getDraftsLocation(),
      interfaceKind.toLowerCase().replace(/ /g, '-'),
      interfaceId && interfaceId !== 'undefined' ? `${interfaceId}.json` : ''
    );

    fse
      .remove(loc)
      .then(() => {
        drafts_tree.refresh();
        onSuccess?.();
      })
      .catch((e) => {
        onError?.(e);
      });
  }

  public deleteAllDrafts(onSuccess?: () => void, onError?: (error: string) => void) {
    const loc = this.getDraftsLocation();
    fse
      .remove(loc)
      .then(() => {
        mkdirSync(this.getDraftsLocation(), {
          recursive: true,
        });
        drafts_tree.refresh();
        onSuccess?.();
      })
      .catch((e) => {
        onError?.(e);
      });
  }

  public saveDraft(
    interfaceKind: string,
    interfaceId: string,
    interfaceData: any,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) {
    console.log('SAVING DRAFT WITH THIS DATA', interfaceKind, interfaceId, interfaceData);
    fse
      .outputFile(
        path.join(this.getDraftsLocation(), interfaceKind, `${interfaceId}.json`),
        JSON.stringify({
          date: Date.now(),
          interfaceId,
          interfaceKind,
          ...interfaceData,
        })
      )
      .then(() => {
        drafts_tree.refresh();
        onSuccess?.();
      })
      .catch((e) => {
        onError?.(e);
      });
  }
}

export default QorusDrafts;
export const QorusDraftsInstance = new QorusDrafts();
