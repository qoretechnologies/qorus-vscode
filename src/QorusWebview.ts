import * as fs from 'fs-extra';
import * as map from 'lodash/map';
import * as os from 'os';
import * as path from 'path';
import { gettext, t } from 'ttag';
import * as vscode from 'vscode';
import { deleter } from './QorusDelete';
import { QorusDraftsInstance } from './QorusDrafts';
import { drafts_tree } from './QorusDraftsTree';
import { instance_tree } from './QorusInstanceTree';
import { qorus_locale } from './QorusLocale';
import { QorusProject, config_filename, projects } from './QorusProject';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { releaser } from './QorusRelease';
import { qorus_request } from './QorusRequest';
import { ActionDispatcher as creator } from './interface_creator/ActionDispatcher';
import { FormChangesResponder } from './interface_creator/FormChangesResponder';
import { triggers } from './interface_creator/standard_methods';
import { isLangClientAvailable } from './qore_vscode';
import * as msg from './qorus_message';
import { deepCopy } from './qorus_utils';
import { maybeDeployInterface } from './qorus_views_commands';

const web_path = path.join(__dirname, '..', 'frontend', 'build');
const public_path = path.join(__dirname, '..', 'frontend', 'public');
const images_path = path.join(__dirname, '..', 'images');

export const unsavedFilesLocation = {
  WINDOWS: '%appdata%/Code/Backups',
  LINUX: '.config/Code/Backups',
  MACOS: 'Library/Application Support/Code/Backups',
};

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

class QorusWebview {
  private panel: vscode.WebviewPanel | undefined = undefined;
  private config_file_watcher: vscode.FileSystemWatcher | undefined = undefined;
  private message_on_config_file_change: boolean = true;
  private uri: vscode.Uri;
  private initial_data: any = {};
  private previous_initial_data: any = {};

  setInitialData(data: any, do_post: boolean = false) {
    this.initial_data = data;
    if (do_post) {
      this.postInitialData();
    }
  }

  setPreviousInitialDataIfCreateInterface() {
    if (this.previous_initial_data?.tab === 'CreateInterface') {
      this.initial_data = this.previous_initial_data;
      this.postInitialData();
    }
  }

  private postInitialData = () => {
    const { authority, path, scheme } = this.panel.webview.asWebviewUri(vscode.Uri.file(web_path));
    const project: QorusProject = projects.getProject();

    project.validateConfigFileAndDo(async (file_data) => {
      const data = QorusProject.file2data(file_data);

      this.postMessage({
        action: 'return-initial-data',
        data: {
          path: web_path,
          theme: data.theme,
          image_path: `${scheme}://${authority}${path}`,
          qorus_instance: qorus_request.activeQorusInstance(),
          is_qore_installed: await isLangClientAvailable(),
          ...this.initial_data,
        },
      });

      // clear initial data except uri
      if (Object.keys(this.initial_data).length && this.initial_data.tab !== 'Login') {
        this.previous_initial_data = deepCopy(this.initial_data);
      }
      this.initial_data = {};
    });
  };

  private checkError = (code_info: QorusProjectCodeInfo) => {
    const initial_data = { ...this.initial_data, ...this.previous_initial_data };
    const iface_kind = initial_data.subtab;
    if (iface_kind && initial_data[iface_kind]) {
      const { target_dir, target_file, iface_id } = initial_data[iface_kind];

      code_info.sendErrorMessages(iface_id);

      if (target_dir && target_file) {
        code_info.edit_info.checkError(path.join(target_dir, target_file), iface_id, iface_kind);
      }
    }
  };

  private getNonce() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  open(initial_data: any = {}, other_params: any = {}) {
    const project: QorusProject = projects.getProject();

    if (!project) {
      msg.error(t`WorkspaceFolderUnsetCannotOpenWebview`);
      return;
    }

    if (!project.configFileExists()) {
      project.createConfigFile();
      return;
    }

    this.initial_data = initial_data;
    this.uri = other_params.uri;

    if (this.panel) {
      if (this.uri) {
        if (projects.updateCurrentWorkspaceFolder(this.uri)) {
          this.dispose();
          msg.warning(t`WorkspaceFolderChangedResetWebview`);
          return this.open(initial_data);
        }
        if (!projects.getProject()) {
          this.dispose();
          msg.error(t`WorkspaceFolderUnsetCloseWebview`);
          return;
        }
      }

      this.panel.reveal(vscode.ViewColumn.One);
      this.postInitialData();
      return;
    }

    vscode.workspace.openTextDocument(path.join(public_path, 'index.html')).then(
      (doc) => {
        this.panel = vscode.window.createWebviewPanel(
          'qorusWebview',
          t`QorusWebviewTitle`,
          vscode.ViewColumn.One,
          {
            enableScripts: true,
            retainContextWhenHidden: true,
            enableCommandUris: true,
            enableFindWidget: true,
            localResourceRoots: [vscode.Uri.file(path.join(web_path))],
          }
        );

        this.panel.iconPath = {
          light: vscode.Uri.file(path.join(images_path, 'QorusDeveloperTools_Small.png')),
          dark: vscode.Uri.file(path.join(images_path, 'QorusDeveloperTools_Small.png')),
        };

        const uri = this.panel.webview.asWebviewUri(vscode.Uri.file(web_path));

        let html = doc.getText().replace(/%PUBLIC_URL%/g, uri.toString());
        html = html.replace(/%MAIN_SCRIPT_NAME%/g, `${uri.toString()}/static/js/bundle.js`);
        //html = html.replace(/%MAIN_SCRIPT_MAP_NAME%/g, `${uri.toString()}/static/js/bundle.js.map`);
        html = html.replace(/%MAIN_CSS_NAME%/g, `${uri.toString()}/static/css/bundle.css`);
        this.panel.webview.html = html.replace(/%URL%/g, uri.toString());

        this.config_file_watcher = vscode.workspace.createFileSystemWatcher(
          '**/' + config_filename
        );
        this.message_on_config_file_change =
          other_params.message_on_config_file_change === undefined
            ? true
            : other_params.message_on_config_file_change;
        this.config_file_watcher.onDidChange(() => {
          if (!this.message_on_config_file_change) {
            this.message_on_config_file_change = true;
            return;
          }
          msg.warning(t`ProjectConfigFileHasChangedOnDisk`);
          this.panel.webview.postMessage({
            action: 'config-changed-on-disk',
          });
        });

        this.panel.onDidDispose(() => {
          this.panel = undefined;
          if (this.config_file_watcher) {
            this.config_file_watcher.dispose();
          }
        });

        this.panel.webview.onDidReceiveMessage(async (message) => {
          const project: QorusProject = projects.getProject();
          if (!project) {
            this.dispose();
            msg.error(t`WorkspaceFolderUnsetCloseWebview`);
            return;
          }
          const interface_info = project.interface_info;

          switch (message.action) {
            case 'get-text':
              this.panel.webview.postMessage({
                action: 'return-text',
                text_id: message.text_id,
                text: gettext(message.text_id),
              });
              break;
            case 'get-all-text':
              this.panel.webview.postMessage({
                action: 'return-all-text',
                data: qorus_locale.translations
                  ? map(qorus_locale.translations, (parsed_data) => ({
                      id: parsed_data.msgid,
                      text: gettext(parsed_data.msgid),
                    }))
                  : {},
              });
              break;
            case 'get-active-tab':
              this.setActiveTab(this.initial_data.tab);
              break;
            case 'get-current-project-folder':
              this.panel.webview.postMessage({
                action: 'current-project-folder',
                folder: path.basename(project.folder),
              });
              break;
            case 'login-get-data':
              this.panel.webview.postMessage({
                action: 'login-return-data',
                login_instance: qorus_request.loginQorusInstance(),
              });
              break;
            case 'login-submit':
              qorus_request.loginPost(message.username, message.password);
              break;
            case 'login-cancel':
              msg.info(t`LoginCancelled`);
              this.panel.webview.postMessage({
                action: 'close-login',
              });
              break;
            case 'create-directory':
              this.message_on_config_file_change = false;
              project.createDirectory(message);
              break;
            case 'config-get-data':
              project.getConfigForWebview();
              break;
            case 'config-update-data':
              this.message_on_config_file_change = false;
              project.updateConfigFromWebview(message.data);
              break;
            case 'config-update-custom-data':
              this.message_on_config_file_change = false;
              project.updateIncrementalConfigFromWebview(message.data);
              break;
            case 'config-add-dir':
              this.message_on_config_file_change = false;
              project.addSourceDirWithFilePicker();
              break;
            case 'config-remove-dir':
              this.message_on_config_file_change = false;
              project.removeSourceDir(message.dir);
              break;
            case 'get-interfaces':
              deleter.getInterfaces(message.iface_kind, message.columns);
              break;
            case 'get-all-interfaces':
              this.panel.webview.postMessage({
                action: 'get-all-interfaces-complete',
                data: drafts_tree.getObjectWithAllInterfaces(),
                request_id: message.request_id,
                ok: true,
              });
              break;
            case 'delete-interfaces':
              deleter.deleteInterfaces(message.iface_kind, message.ids);
              break;
            case 'release-get-branch':
              releaser.makeRelease();
              break;
            case 'release-get-commits':
              releaser.getCommits(message.filters);
              break;
            case 'release-get-diff':
              releaser.getDiff(message.commit);
              break;
            case 'release-create-package':
              if (message.custom) {
                releaser.createCustomPackage(message.files);
              } else {
                releaser.createPackage(message.full);
              }
              break;
            case 'release-deploy-package':
              releaser.deployPackage();
              break;
            case 'release-get-package':
              releaser.getPackage();
              break;
            case 'release-save-package':
              releaser.savePackage();
              break;
            case 'creator-get-fields':
              creator
                .getSortedFields({
                  ...message,
                  interface_info,
                  default_target_dir: message.context?.target_dir || this.uri?.fsPath,
                  limited_editing: !(await isLangClientAvailable()),
                })
                .then((fields) => {
                  this.panel.webview.postMessage({
                    action: 'creator-return-fields',
                    iface_kind: message.iface_kind,
                    fields,
                  });
                });
              break;
            case 'get-file-contents':
              // Read the file contents
              const fileData = fs.readFileSync(message.file, 'utf8');
              // Send the response to the webview
              this.panel.webview.postMessage({
                action: 'get-file-contents-complete',
                request_id: message.request_id,
                fileData,
                ok: true,
              });
              break;
            case 'creator-get-objects':
            case 'creator-get-resources':
            case 'creator-get-directories':
              project.code_info.getObjects(message);
              break;
            case 'get-all-directories':
              project.code_info.getObjects({ object_type: 'all_dirs' });
              break;
            case 'get-initial-data':
              this.postInitialData();
              break;
            case 'creator-create-interface':
              creator.editInterface({
                ...message,
                edit_type: 'create',
                interface_info,
              });
              break;
            case 'creator-edit-interface':
              creator.editInterface({
                ...message,
                edit_type: 'edit',
                interface_info,
              });
              break;
            case 'check-edit-data':
              this.checkError(project.code_info);
              break;
            case 'creator-field-added':
              FormChangesResponder.fieldAdded(message);
              break;
            case 'creator-field-removed':
              FormChangesResponder.fieldRemoved({ ...message, interface_info });
              break;
            case 'creator-set-fields':
              project.code_info.setFields(message);
              break;
            case 'get-list-of-interfaces':
              project.code_info.getListOfInterfaces(message.iface_kind);
              break;
            case 'get-interface-data':
              project.code_info.getInterfaceData(message);
              break;
            case 'get-config-items':
              interface_info.getConfigItems(message);
              break;
            case 'remove-config-items':
              interface_info.removeConfigItems(message);
              break;
            case 'get-config-item':
              interface_info.getConfigItem(message);
              break;
            case 'get-mapper-code-methods':
              project.code_info.getMapperCodeMethods(message.name);
              break;
            case 'get-mappers':
              project.code_info.getMappers(message.data);
              break;
            case 'update-config-item-value':
              interface_info.updateConfigItemValue(message);
              break;
            case 'reset-config-items':
              interface_info.resetConfigItemsToOrig(message);
              break;
            case 'submit-fsm-state':
            case 'submit-processor':
              interface_info.setOrigConfigItems(message);
              break;
            case 'delete-config-item':
              interface_info.deleteConfigItem(message);
              break;
            case 'config-item-type-changed':
              FormChangesResponder.configItemTypeChanged(message);
              break;
            case 'remove-fsm-state':
              interface_info.removeSpecificData(message);
              break;
            case 'lang-changed':
              FormChangesResponder.langChanged(message, project.code_info);
              break;
            case 'stateless-changed':
              FormChangesResponder.statelessChanged({ ...message, interface_info });
              break;
            case 'valuetype-changed':
              FormChangesResponder.valueTypeChanged(message);
              break;
            case 'error-status-changed':
              FormChangesResponder.errorStatusChanged(message);
              break;
            case 'target-dir-changed':
              interface_info.last_target_directory = message.target_dir;
              break;
            case 'get-objects-with-static-data':
              project.code_info.getObjectsWithStaticData(message);
              break;
            case 'get-fields-from-type':
              project.code_info.getFieldsFromType(message);
              break;
            case 'set-active-instance':
              qorus_request.setActiveInstance(message.url);
              break;
            case 'unset-active-instance':
              qorus_request.unsetActiveInstance();
              break;
            case 'fetch-data':
              qorus_request.fetchData(message);
              break;
            case 'get-triggers':
              this.panel.webview.postMessage({
                action: 'return-triggers',
                data: {
                  ...message.data,
                  triggers: triggers(project.code_info, message.data).map((name) => ({ name })),
                },
              });
              break;
            case 'open-file':
              vscode.workspace
                .openTextDocument(message.file_path)
                .then((doc) => vscode.window.showTextDocument(doc));
              break;
            case 'delete-interface':
              project.code_info.deleteInterfaceFromWebview(message);
              break;
            case 'deploy-interface':
              maybeDeployInterface(message.data);
              break;
            case 'get-all-drafts':
              this.panel.webview.postMessage({
                action: 'get-all-drafts-complete',
                request_id: message.request_id,
                ok: true,
                data: {
                  drafts: QorusDraftsInstance.getAllDraftCategoriesWithCount(),
                },
              });
              break;
            case 'get-drafts':
              this.panel.webview.postMessage({
                action: 'get-drafts-complete',
                request_id: message.request_id,
                ok: true,
                data: {
                  drafts: QorusDraftsInstance.getDraftsForInterface(message.iface_kind),
                },
              });
              break;
            case 'get-draft': {
              try {
                const data = QorusDraftsInstance.getSingleDraftContent(
                  message.interfaceKind,
                  `${message.draftId}.json`
                );

                // Apply config items to draft if they exist
                if (data.configItems) {
                  project.interface_info.iface_by_id[data.interfaceId] = {
                    ...(project?.interface_info?.iface_by_id?.[data.interfaceId] || {}),
                    'config-items': data.configItems,
                  };
                }

                this.panel.webview.postMessage({
                  action: 'get-draft-complete',
                  request_id: message.request_id,
                  ok: true,
                  data,
                });
              } catch (e) {
                this.panel.webview.postMessage({
                  action: 'get-draft-complete',
                  request_id: message.request_id,
                  ok: false,
                });
              }
              break;
            }
            case 'delete-all-drafts': {
              QorusDraftsInstance.deleteAllDrafts();
              break;
            }
            case 'delete-draft':
              QorusDraftsInstance.deleteDraftOrDrafts(
                message.iface_kind,
                message.iface_id,
                () => {
                  if (!message.no_notify) {
                    this.panel.webview.postMessage({
                      action: 'delete-draft-complete',
                      request_id: message.request_id,
                      ok: true,
                      message: t`DeletingDraftCompleted`,
                    });
                  }
                },
                (e) => {
                  this.panel.webview.postMessage({
                    action: 'delete-draft-complete',
                    request_id: message.request_id,
                    ok: false,
                    message: t`DeletingDraftFailed` + e,
                  });
                }
              );
              break;
            case 'save-draft':
              QorusDraftsInstance.saveDraft(
                message.iface_kind,
                message.iface_id,
                {
                  ...message.fileData,
                  configItems:
                    project.interface_info.iface_by_id?.[message.fileData.interfaceId]?.[
                      'config-items'
                    ],
                },
                () => {
                  this.panel.webview.postMessage({
                    action: 'save-draft-complete',
                    request_id: message.request_id,
                    ok: true,
                    message: t`DraftSaved`,
                  });
                },
                (e) => {
                  this.panel.webview.postMessage({
                    action: 'save-draft-complete',
                    request_id: message.request_id,
                    ok: false,
                    message: t`SavingDraftFailed` + e,
                  });
                }
              );
              break;
            default:
              msg.log(t`UnknownWebviewMessage ${JSON.stringify(message, null, 4)}`);
          }
        });
      },
      (error) => {
        msg.error(t`UnableOpenQorusConfigPage`);
        msg.log(JSON.stringify(error));
      }
    );
  }

  postMessage(message: any) {
    this.postMessages([message]);
  }

  postMessages(messages: any[]) {
    if (!this.panel) {
      return;
    }

    for (const message of messages) {
      this.panel.webview.postMessage(message);
    }
  }

  dispose() {
    if (this.panel) {
      this.panel.dispose();
      return true;
    }
    return false;
  }

  setCurrentProjectFolder(project_folder: string | undefined) {
    this.postMessage({
      action: 'current-project-folder',
      folder: project_folder,
    });
  }

  setActiveQorusInstance(url?: string, token?: string) {
    this.postMessage({
      action: 'current-qorus-instance',
      qorus_instance: url && instance_tree.getQorusInstance(url),
      token,
    });
  }

  private setActiveTab(tab?: string) {
    if (!tab) {
      return;
    }
    this.postMessage({
      action: 'set-active-tab',
      tab,
    });
  }
}

export const qorus_webview = new QorusWebview();
