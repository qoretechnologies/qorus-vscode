import * as fs from 'fs';
import { join } from 'path';
import { t } from 'ttag';
import { commands, ExtensionContext, Uri, window as vswindow, workspace } from 'vscode';
import { deployer } from './QorusDeploy';
import { drafts_tree, otherFilesNames, QorusDraftItem } from './QorusDraftsTree';
import { interface_tree } from './QorusInterfaceTree';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';

const maybeDeleteInterface = (data: QorusDraftItem['data']) => {
  vswindow
    .showWarningMessage(t`ConfirmDeleteInterface ${data.type} ${data.path}`, t`Yes`, t`No`)
    .then((selection) => {
      if (selection !== t`Yes`) {
        return;
      }

      if (otherFilesNames.includes(data.type)) {
        fs.unlink(data.path, (err) => {
          if (err) {
            msg.warning(t`FailedDeletingIfaceCodeFile ${data.type} ${data.path} ${err}`);
          } else {
            msg.info(t`DeletedIfaceCodeFile ${data.type} ${data.path}`);
          }
        });

        return;
      }

      QorusProjectCodeInfo.deleteInterface({ iface_kind: data.type, iface_data: data });
    });
};
const maybeDeployInterface = (data: any) => {
  if (!deployer.isRunning) {
    if (otherFilesNames.includes(data.type)) {
      vswindow.showInformationMessage(t`ConfirmDeployFile`, t`Yes`, t`No`).then((selection) => {
        if (selection !== t`No`) {
          deployer.deployFile(data.data.path, false);
        }
      });

      return;
    }

    vswindow
      .showInformationMessage(
        t`ConfirmDeployInterface ${data.type} ${data.name}`,
        t`YesWithDep`,
        t`YesWithoutDep`,
        t`No`
      )
      .then((selection) => {
        if (!selection || selection === t`No`) {
          return;
        }

        if (!data.data?.yaml_file) {
          msg.error(t`MissingDeploymentData`);
          return;
        }

        deployer.deployFile(data.data.yaml_file, selection === t`YesWithDep`);
      });
  }
};

const maybeEditInterface = (data: any) => {
  let iface_kind;
  if (data) {
    delete data.show_steps;
    switch (data.type) {
      case 'workflow-steps':
        data.show_steps = true;
        iface_kind = 'workflow';
        break;
      case 'service-methods':
        data.active_method = 1;
        iface_kind = 'service';
        break;
      case 'mapper-code-methods':
        data.active_method = 1;
        iface_kind = 'mapper-code';
        break;
      default:
        iface_kind = data.type;
    }
    commands.executeCommand('qorus.editInterface', data, iface_kind);
  }
};

export const registerQorusViewsCommands = (context: ExtensionContext) => {
  let disposable;

  disposable = vswindow.createTreeView('qorusInterfaces', { treeDataProvider: drafts_tree });
  context.subscriptions.push(disposable);

  // view switching commands
  disposable = commands.registerCommand('qorus.views.switchToFolderView', () => {
    interface_tree.setFolderView();
    disposable = vswindow.createTreeView('qorusInterfaces', {
      treeDataProvider: interface_tree,
    });

    context.subscriptions.push(disposable);
  });

  disposable = commands.registerCommand('qorus.views.switchToCategoryView', () => {
    disposable = vswindow.createTreeView('qorusInterfaces', { treeDataProvider: drafts_tree });
    context.subscriptions.push(disposable);
  });

  // deploy commands
  [
    'class',
    'connection',
    'errors',
    'event',
    'group',
    'job',
    'mapper',
    'mapper-code',
    'queue',
    'service',
    'step',
    'value-map',
    'workflow',
    'type',
    'fsm',
    'pipeline',
  ].forEach((iface_kind) => {
    const command = 'qorus.views.deploy' + dash2Pascal(iface_kind);
    disposable = commands.registerCommand(command, maybeDeployInterface);
    context.subscriptions.push(disposable);
  });

  disposable = commands.registerCommand('qorus.views.deployInterface', (data: QorusDraftItem) => {
    maybeDeployInterface(data);
  });
  context.subscriptions.push(disposable);

  // Deploy all interfaces
  disposable = commands.registerCommand('qorus.views.deployAllInterfaces', () => {
    if (!deployer.isRunning) {
      vswindow
        .showInformationMessage(t`ConfirmDeployAllInterfaces`, t`Yes`, t`No`)
        .then((selection) => {
          if (selection === t`Yes`) {
            deployer.deployAllInterfaces();
          }
        });
    }
  });

  // Deploy directory of interfaces
  disposable = commands.registerCommand('qorus.views.deployDir', (data: any) => {
    if (!deployer.isRunning) {
      vswindow
        .showInformationMessage(
          t`ConfirmDeployDirectory ${data.getDirectoryName()}`,
          t`YesWithDep`,
          t`YesWithoutDep`,
          t`No`
        )
        .then((selection) => {
          if (selection && selection !== t`No`) {
            deployer.deployDir(data.getVscodeUri(), selection === t`YesWithDep`);
          }
        });
    }
  });

  // edit commands
  [
    'class',
    'job',
    'mapper',
    'mapper-code',
    'service',
    'step',
    'workflow-steps',
    'connection',
    'workflow',
    'service-methods',
    'mapper-code-methods',
    'group',
    'event',
    'queue',
    'type',
    'fsm',
    'pipeline',
    'value-map',
    'errors',
  ].forEach((key) => {
    const command = 'qorus.views.edit' + dash2Pascal(key);
    disposable = commands.registerCommand(command, maybeEditInterface);
    context.subscriptions.push(disposable);
  });

  disposable = commands.registerCommand('qorus.views.editInterface', ({ data }: QorusDraftItem) => {
    maybeEditInterface(data);
  });
  context.subscriptions.push(disposable);

  // open interface command, used when clicking on interface in the tree
  disposable = commands.registerCommand('qorus.views.openInterface', (data: any) => {
    console.log(data);
    if (!data || !data.data) {
      return;
    }
    const iface_data = data.data;
    switch (iface_data.type) {
      case 'class':
      case 'job':
      case 'mapper-code':
      case 'service':
      case 'step':
      case 'fsm':
      case 'pipeline':
      case 'workflow':
        if (iface_data.target_dir && iface_data.target_file) {
          const filePath = join(iface_data.target_dir, iface_data.target_file);
          workspace.openTextDocument(Uri.file(filePath)).then(
            (doc) => {
              if (
                vswindow.activeTextEditor &&
                vswindow.activeTextEditor.document.fileName === filePath
              ) {
                vswindow.showTextDocument(doc, { preview: false });
              } else {
                vswindow.showTextDocument(doc);
              }
            },
            (err) => {
              console.log(t`ErrorOpeningFile ${filePath} ${err}`);
            }
          );
        }
        break;
      default:
        if (iface_data.path) {
          workspace.openTextDocument(Uri.file(iface_data.path)).then(
            (doc) => {
              if (
                vswindow.activeTextEditor &&
                vswindow.activeTextEditor.document.fileName === iface_data.path
              ) {
                vswindow.showTextDocument(doc, { preview: false });
              } else {
                vswindow.showTextDocument(doc);
              }
            },
            (err) => {
              console.log(t`ErrorOpeningFile ${iface_data.path} ${err}`);
            }
          );
        }
        break;
    }
  });

  // delete commands
  [
    'class',
    'connection',
    'errors',
    'event',
    'group',
    'job',
    'mapper',
    'mapper-code',
    'queue',
    'service',
    'step',
    'value-map',
    'workflow',
    'type',
    'fsm',
    'pipeline',
  ].forEach((iface_kind) => {
    const command = 'qorus.views.delete' + dash2Pascal(iface_kind);
    disposable = commands.registerCommand(command, maybeDeleteInterface);
    context.subscriptions.push(disposable);
  });

  disposable = commands.registerCommand(
    'qorus.views.deleteInterface',
    ({ data }: QorusDraftItem) => {
      maybeDeleteInterface(data);
    }
  );
  context.subscriptions.push(disposable);
};
