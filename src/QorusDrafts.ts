import { mkdirSync, readdirSync, readFileSync } from 'fs';
import * as fse from 'fs-extra';
import { capitalize, find, size, sortBy } from 'lodash';
import * as os from 'os';
import * as path from 'path';
import { drafts_tree } from './QorusDraftsTree';

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
      readdirSync(path.join(process.env.HOME, this.getDraftsLocation()));
    } catch (e) {
      mkdirSync(path.join(process.env.HOME, this.getDraftsLocation()), {
        recursive: true,
      });
    }
  }

  private getDraftsLocation() {
    const os = getOs();

    const draftFilesLocation = {
      WINDOWS: '%appdata%/Code/Backups',
      LINUX: '.config/Code/Backups',
      MACOS: 'Library/Application Support/Code/Backups',
    };

    return draftFilesLocation[os];
  }

  public getDraftsFolders() {
    // Get all the folders associated with drafts
    // folder name === interface kind
    return readdirSync(path.join(process.env.HOME, this.getDraftsLocation()));
  }

  public getSingleDraftContent(interfaceKind: string, fileName: string) {
    const file = readFileSync(
      path.join(process.env.HOME, this.getDraftsLocation(), interfaceKind, fileName)
    );
    const buffer: Buffer = Buffer.from(file);
    const contents = buffer.toString();
    const draft = JSON.parse(contents);
    // build the name
    const name =
      find(draft.data || [], (field) => field.name === 'name' || field.name === 'class-class-name')
        ?.value || `Unnamed ${capitalize(interfaceKind)}`;

    return {
      ...draft,
      name,
    };
  }

  public getDraftsForInterface(interfaceKind: string) {
    const drafts: any[] = [];
    const draftFiles = readdirSync(
      path.join(process.env.HOME, this.getDraftsLocation(), interfaceKind)
    );

    draftFiles.forEach((fileName) => {
      drafts.push(this.getSingleDraftContent(interfaceKind, fileName));
    });

    return sortBy(drafts, (draft) => draft.date).reverse();
  }

  public getDraftsCountForInterface(interfaceKind: string): number {
    return size(this.getDraftsForInterface(interfaceKind));
  }

  public deleteDraftOrDrafts(
    interfaceKind: string,
    interfaceId?: string,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) {
    const loc = path.join(
      process.env.HOME,
      this.getDraftsLocation(),
      interfaceKind,
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

  public saveDraft(
    interfaceKind: string,
    interfaceId: string,
    interfaceData: any,
    onSuccess?: () => void,
    onError?: (error: string) => void
  ) {
    fse
      .outputFile(
        path.join(process.env.HOME, this.getDraftsLocation(), interfaceKind, `${interfaceId}.json`),
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
