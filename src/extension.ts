import * as child_process from 'child_process';
import * as path from 'path';
import { t } from 'ttag';
import * as vscode from 'vscode';
import { ActionDispatcher as creator } from './interface_creator/ActionDispatcher';
import { isLangClientAvailable } from './qore_vscode';
import { deployer } from './QorusDeploy';
import { QorusDraftsInstance } from './QorusDrafts';
import { drafts_tree } from './QorusDraftsTree';
import { qorusIcons } from './QorusIcons';
import { instance_tree } from './QorusInstanceTree';
import { interface_tree } from './QorusInterfaceTree';
import { QorusJavaCodeLensProvider } from './QorusJavaCodeLensProvider';
import { QorusJavaHoverProvider } from './QorusJavaHoverProvider';
import { qorus_locale } from './QorusLocale';
import { config_filename, projects } from './QorusProject';
import { QorusProjectInterfaceInfo } from './QorusProjectInterfaceInfo';
import { QorusPythonCodeLensProvider } from './QorusPythonCodeLensProvider';
import { QorusPythonHoverProvider } from './QorusPythonHoverProvider';
import { QorusQoreCodeLensProvider } from './QorusQoreCodeLensProvider';
import { QorusQoreHoverProvider } from './QorusQoreHoverProvider';
import { qorus_request } from './QorusRequest';
import { tester } from './QorusTest';
import { qorus_webview } from './QorusWebview';
import { registerQorusExplorerCommands } from './qorus_explorer_commands';
import { installQorusJavaApiSources } from './qorus_java_utils';
import * as msg from './qorus_message';
import { dash2Pascal } from './qorus_utils';
import { registerQorusViewsCommands } from './qorus_views_commands';
import { qorus_vscode } from './qorus_vscode';

qorus_locale.setLocale();

export async function activate(context: vscode.ExtensionContext) {
  isLangClientAvailable();
  qorus_vscode.context = context;
  qorusIcons.update(context.extensionPath);
  installQorusJavaApiSources(context.extensionPath);

  let disposable;
  disposable = vscode.commands.registerTextEditorCommand('qorus.deployCurrentFile', () => {
    if (!deployer.isRunning) {
      vscode.window
        .showInformationMessage(t`ConfirmDeployCurrentFile`, t`YesWithDep`, t`YesWithoutDep`, t`No`)
        .then((selection) => {
          if (selection !== t`No`) {
            deployer.deployCurrentFile(selection === t`YesWithDep`);
          }
        });
    }
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerTextEditorCommand('qorus.testCurrentFile', () =>
    tester.testCurrentFile()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.testDir', (uri: vscode.Uri) =>
    tester.testDir(uri)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.setActiveInstance',
    (tree_item: string | vscode.TreeItem) => qorus_request.setActiveInstance(tree_item)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.loginAndSetActiveInstance',
    (tree_item: vscode.TreeItem) => qorus_request.setActiveInstance(tree_item)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.logout', (tree_item: vscode.TreeItem) =>
    qorus_request.logout(tree_item)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.loginAndStayInactiveInstance',
    (tree_item: vscode.TreeItem) => qorus_request.login(tree_item, false)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.setInactiveInstanceStayLoggedIn',
    (tree_item: vscode.TreeItem) => qorus_request.unsetActiveInstance(tree_item)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.setInactiveInstance',
    (tree_item: vscode.TreeItem) => qorus_request.unsetActiveInstance(tree_item)
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.openUrlInExternalBrowser',
    openUrlInExternalBrowser
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.openWebview', () => qorus_webview.open());
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.openDrafts', () =>
    qorus_webview.open({ tab: 'Drafts' })
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.openInterfaceDrafts', (data) => {
    const [interfaceKind] = data.tooltip.split('|');

    qorus_webview.open({ tab: 'Drafts', subtab: interfaceKind });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.createInterfaceFromDrafts', (data) => {
    const [interfaceKind] = data.tooltip.split('|');

    qorus_webview.open({ tab: 'CreateInterface', subtab: interfaceKind });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.openDraft', (interfaceKind, interfaceId) => {
    qorus_webview.open({
      draftData: {
        interfaceKind,
        interfaceId,
      },
    });
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.closeWebview', () => qorus_webview.dispose());
  context.subscriptions.push(disposable);

  [
    'service',
    'job',
    'workflow',
    'step',
    'mapper',
    'mapper-code',
    'class',
    'connection',
    'group',
    'event',
    'queue',
    'type',
    'fsm',
    'pipeline',
    'value-map',
    'errors',
  ].forEach((iface_kind) => {
    const command = 'qorus.create' + dash2Pascal(iface_kind);
    disposable = vscode.commands.registerCommand(command, (data: vscode.TreeItem | vscode.Uri) => {
      const uri = data instanceof vscode.Uri ? data : undefined;

      qorus_webview.open(
        {
          tab: 'CreateInterface',
          subtab: iface_kind,
        },
        { uri }
      );
    });
    context.subscriptions.push(disposable);
  });

  disposable = vscode.commands.registerCommand('qorus.deleteDraft', (data) => {
    const [interfaceKind, interfaceId] = data.tooltip.split('|');

    vscode.window.showWarningMessage(t`DeleteDraft`, t`Yes`, t`No`).then((selection) => {
      if (selection === t`Yes`) {
        QorusDraftsInstance.deleteDraftOrDrafts(interfaceKind, interfaceId);
      }
    });
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.deleteInterfaceDrafts', (data) => {
    const [interfaceKind] = data.tooltip.split('|');

    vscode.window.showWarningMessage(t`DeleteInterfaceDrafts`, t`Yes`, t`No`).then((selection) => {
      if (selection === t`Yes`) {
        QorusDraftsInstance.deleteDraftOrDrafts(interfaceKind);
      }
    });
  });

  disposable = vscode.commands.registerCommand('qorus.createInter', (data) => {
    const [interfaceKind] = data.tooltip.split('|');

    vscode.window.showWarningMessage(t`DeleteInterfaceDrafts`, t`Yes`, t`No`).then((selection) => {
      if (selection === t`Yes`) {
        QorusDraftsInstance.deleteDraftOrDrafts(interfaceKind);
      }
    });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.deleteAllDrafts', () => {
    vscode.window.showWarningMessage(t`DeleteAllDrafts`, t`Yes`, t`No`).then((selection) => {
      if (selection === t`Yes`) {
        QorusDraftsInstance.deleteAllDrafts();
      }
    });
  });

  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.editInterface',
    (data: any, iface_kind: string, data_already_transformed: boolean = false) => {
      const code_info = projects.currentProjectCodeInfo();
      if (!code_info) {
        return;
      }

      const iface_info: QorusProjectInterfaceInfo = code_info.interface_info;
      if (!data_already_transformed) {
        data = code_info.yaml2FrontEnd(data);
      }
      const iface_id = iface_info.addIfaceById(data, iface_kind);

      code_info.checkReferencedObjects(iface_id, data);

      const message = {
        tab: 'CreateInterface',
        subtab: iface_kind,
        [iface_kind]: { ...data, iface_id },
      };

      let other_opening_params = {};

      const { target_dir, target_file, lang = 'qore' } = data;
      if (target_dir) {
        other_opening_params = { uri: vscode.Uri.file(target_dir) };

        if (target_file) {
          const file_path = path.join(target_dir, target_file);
          if (path.extname(file_path) !== '.yaml') {
            if (lang === 'qore') {
              isLangClientAvailable().then((lang_client_available) => {
                qorus_webview.open(
                  { ...message, lang_client_unavailable: !lang_client_available },
                  other_opening_params
                );
                if (lang_client_available) {
                  code_info.edit_info.setFileInfo(file_path, data);
                }
              });
              return;
            }

            code_info.edit_info.setFileInfo(file_path, data);
          }
        }
      }

      qorus_webview.open(message, other_opening_params);
    }
  );
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand('qorus.editCurrentInterface', () => {
    const editor = vscode.window.activeTextEditor;
    const code_info = projects.projectCodeInfo(editor?.document.uri);
    if (!code_info) {
      return;
    }
    const data = code_info.yaml_info.yamlDataByFile(editor.document.fileName);
    if (!data) {
      return;
    }

    vscode.commands.executeCommand('qorus.editInterface', data, data.type);
  });
  context.subscriptions.push(disposable);

  disposable = vscode.commands.registerCommand(
    'qorus.deleteMethod',
    (data: any, iface_kind: string) => creator.deleteMethod(data, iface_kind)
  );
  context.subscriptions.push(disposable);

  registerQorusExplorerCommands(context);
  registerQorusViewsCommands(context);

  disposable = vscode.window.registerTreeDataProvider('qorusInstances', instance_tree);
  context.subscriptions.push(disposable);

  interface_tree.setExtensionPath(context.extensionPath);

  disposable = vscode.window.registerTreeDataProvider('qorusInterfaces', interface_tree);
  context.subscriptions.push(disposable);

  disposable = vscode.window.registerTreeDataProvider('qorusDrafts', drafts_tree);
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerCodeLensProvider(
    [{ language: 'qore', scheme: 'file' }],
    new QorusQoreCodeLensProvider()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerCodeLensProvider(
    [{ language: 'java', scheme: 'file' }],
    new QorusJavaCodeLensProvider()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerCodeLensProvider(
    [{ language: 'python', scheme: 'file' }],
    new QorusPythonCodeLensProvider()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerHoverProvider(
    [{ language: 'qore', scheme: 'file' }],
    new QorusQoreHoverProvider()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerHoverProvider(
    [{ language: 'java', scheme: 'file' }],
    new QorusJavaHoverProvider()
  );
  context.subscriptions.push(disposable);

  disposable = vscode.languages.registerHoverProvider(
    [{ language: 'python', scheme: 'file' }],
    new QorusPythonHoverProvider()
  );
  context.subscriptions.push(disposable);

  updateQorusTree();

  vscode.window.onDidChangeActiveTextEditor(
    (editor) => {
      if (editor?.document?.uri.scheme === 'file') {
        updateQorusTree(editor.document.uri, false);
      }
    },
    null,
    context.subscriptions
  );

  vscode.workspace.onDidSaveTextDocument(
    (document) => {
      if (path.basename(document.fileName) === config_filename) {
        updateQorusTree(document.uri);
      }
    },
    null,
    context.subscriptions
  );
}

function updateQorusTree(uri?: vscode.Uri, forceTreeReset: boolean = true) {
  const workspace_folder_changed_or_unset = projects.updateCurrentWorkspaceFolder(uri);

  if (workspace_folder_changed_or_unset || forceTreeReset) {
    projects.validateConfigFileAndDo(
      (file_data: any) => {
        instance_tree.reset(file_data.qorus_instances);
        interface_tree.refresh();
      },
      () => instance_tree.reset({}),
      uri
    );
  }

  if (workspace_folder_changed_or_unset) {
    if (qorus_webview.dispose()) {
      msg.warning(t`WorkspaceFolderChangedOrUnsetCloseWebview`);
    }
  }
}

function openUrlInExternalBrowser(url: string, name: string) {
  let cfg_name: string;
  switch (process.platform) {
    case 'aix':
    case 'freebsd':
    case 'linux':
    case 'openbsd':
    case 'sunos':
      cfg_name = 'openUrlInExternalBrowser.linux';
      break;
    case 'darwin':
      cfg_name = 'openUrlInExternalBrowser.mac';
      break;
    case 'win32':
      cfg_name = 'openUrlInExternalBrowser.windows';
      break;
    default:
      cfg_name = '';
  }
  const command: string =
    vscode.workspace.getConfiguration('qorus').get(cfg_name) + ' "' + url + '"';
  msg.info(t`OpeningUrlInExternalBrowser ${name} ${url}`);
  msg.log(command);
  try {
    child_process.execSync(command);
  } catch (error) {
    msg.error(t`OpenUrlInExternalBrowserError`);
  }
}
