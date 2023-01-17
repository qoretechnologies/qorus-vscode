import { Button, ButtonGroup, Callout, Classes } from '@blueprintjs/core';
import {
  ReqoreContent,
  ReqoreHeader,
  ReqoreIcon,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqoreTag,
} from '@qoretechnologies/reqore';
import last from 'lodash/last';
import size from 'lodash/size';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useEffectOnce } from 'react-use';
import compose from 'recompose/compose';
import ContextMenu from './components/ContextMenu';
import CustomDialog from './components/CustomDialog';
import Loader from './components/Loader';
import Menu from './components/Menu';
import { AppToaster } from './components/Toast';
import { Messages } from './constants/messages';
import InterfaceCreator from './containers/InterfaceCreator';
import { ContextMenuContext, IContextMenu } from './context/contextMenu';
import { DialogsContext } from './context/dialogs';
import { DraftsContext, IDraftData } from './context/drafts';
import { ErrorsContext } from './context/errors';
import { InitialContext } from './context/init';
import { TextContext } from './context/text';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import { DraftsView } from './DraftsView';
import { callBackendBasic, getTargetFile } from './helpers/functions';
import withErrors from './hocomponents/withErrors';
import withFields from './hocomponents/withFields';
import withFunctions from './hocomponents/withFunctions';
import withGlobalOptions from './hocomponents/withGlobalOptions';
import withInitialData from './hocomponents/withInitialData';
import withMapper from './hocomponents/withMapper';
import {
  addMessageListener,
  postMessage,
  TMessageListener,
  TPostMessage,
} from './hocomponents/withMessageHandler';
import withMethods from './hocomponents/withMethods';
import withSteps from './hocomponents/withSteps';
import { LoginContainer } from './login/Login';
import ProjectConfig from './project_config/ProjectConfig';
import SourceDirectories from './project_config/sourceDirs';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
const md5 = require('md5');

export interface IApp {
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  tab: string;
  project_folder: string;
  qorus_instance: any;
  login_visible: boolean;
  changeTab: (activeTab: string, subTab?: string) => void;
  openLogin: () => void;
  closeLogin: () => void;
  setActiveInstance: (inst: string) => void;
  setCurrentProjectFolder: (folder: string) => void;
  path: string;
  main_color: string;
}

export type TTranslator = (id: string) => string;

const App: FunctionComponent<IApp> = ({
  closeLogin,
  setActiveInstance,
  setCurrentProjectFolder,
  tab,
  project_folder,
  qorus_instance,
  changeTab,
  main_color,
  path,
  image_path,
  confirmDialog,
  setConfirmDialog,
  setInterfaceId,
  setMethodsFromDraft,
  setFunctionsFromDraft,
  setMapperFromDraft,
  setSelectedFields,
  draftData,
  setDraftData,
  setStepsFromDraft,
  setFieldsFromDraft,
  ...rest
}) => {
  const [openedDialogs, setOpenedDialogs] = useState<{ id: string; onClose: () => void }[]>([]);
  const [contextMenu, setContextMenu] = useState<IContextMenu>(null);
  const [draft, setDraft] = useState<IDraftData>(null);
  const { setErrorsFromDraft }: any = useContext(ErrorsContext);
  const [isDirsDialogOpen, setIsDirsDialogOpen] = useState<boolean>(false);
  const { t } = useContext(InitialContext);

  const addDraft = (draftData: any) => {
    setDraft(draftData);
  };

  const removeDraft = () => {
    setDraft(null);
    setDraftData(null);
  };

  useEffect(() => {
    const { interfaceKind, interfaceId } = draftData || {};

    if (interfaceKind && interfaceId) {
      (async () => {
        const fetchedDraft = await callBackendBasic(Messages.GET_DRAFT, undefined, {
          interfaceKind,
          draftId: interfaceId,
        });

        if (fetchedDraft.ok) {
          addDraft({ ...fetchedDraft.data });
          changeTab('CreateInterface', fetchedDraft.data.interfaceKind);
          setDraftData(null);
        }
      })();
    }
  }, [draftData]);

  const maybeDeleteDraft = (interfaceKind: string, interfaceId: string) => {
    callBackendBasic(Messages.DELETE_DRAFT, undefined, {
      no_notify: true,
      interfaceKind,
      interfaceId,
    });
  };

  const maybeApplyDraft = async (
    ifaceKind: string,
    draftData: IDraftData,
    existingInterface?: any,
    customFunction?: (draft: IDraftData) => void,
    applyClassConnectionsFunc?: Function,
    onFinish?: () => any
  ) => {
    const shouldApplyDraft = draftData ? true : draft?.interfaceKind === ifaceKind;
    // Check if draft for this interface kind exists
    if (shouldApplyDraft || getTargetFile(existingInterface)) {
      let draftToApply = draftData || draft;
      // Fetch the draft if the draft id is provided
      if (existingInterface) {
        const fetchedDraft = await callBackendBasic(Messages.GET_DRAFT, undefined, {
          interfaceKind: ifaceKind,
          draftId: md5(getTargetFile(existingInterface)),
        });

        if (fetchedDraft.ok) {
          draftToApply = fetchedDraft.data;
        } else {
          onFinish?.();
          return;
        }
      }

      const {
        interfaceKind,
        interfaceId,
        fields,
        selectedFields,
        methods,
        selectedMethods,
        steps,
        diagram,
        classConnections,
      } = draftToApply;

      // Set the last saved draft with the interface id
      rest.setLastDraft({ interfaceId, interfaceKind });

      // If the custom function is provided, call it, remove the draft and stop here
      if (customFunction) {
        customFunction(draftToApply);
      } else {
        if (!existingInterface) {
          setInterfaceId(interfaceKind, interfaceId);
        }

        if (interfaceKind === 'service') {
          setMethodsFromDraft(selectedMethods);
          setFieldsFromDraft('service-methods', methods, selectedMethods);
        }

        if (interfaceKind === 'mapper-code') {
          setFunctionsFromDraft(selectedMethods);
          setFieldsFromDraft('mapper-methods', methods, selectedMethods);
        }

        if (interfaceKind === 'errors') {
          setErrorsFromDraft(selectedMethods);
          setFieldsFromDraft('error', methods, selectedMethods);
        }

        if (interfaceKind === 'mapper') {
          setMapperFromDraft(diagram);
        }

        if (steps) {
          setStepsFromDraft(steps.steps, steps.stepsData, steps.lastStepId);
        }

        setFieldsFromDraft(interfaceKind, fields, selectedFields);
      }

      if (classConnections) {
        applyClassConnectionsFunc?.(classConnections);
      }

      // Remove the draft
      removeDraft();
    }

    onFinish?.();
  };

  const addDialog: (id: string, onClose: any) => void = (id, onClose) => {
    // Only add dialogs that can be closed
    if (onClose) {
      setOpenedDialogs((current) => [
        ...current,
        {
          id,
          onClose,
        },
      ]);
    }
  };

  const removeDialog: (id: string) => void = (id) => {
    setOpenedDialogs((current) => {
      const newDialogs = [...current];

      return newDialogs.filter((dialog) => dialog.id !== id);
    });
  };

  useEffect(() => {
    // Check if there are any opened dialogs
    if (size(openedDialogs)) {
      // Add the event on `ESC` key that will close the last opened dialog
      document.addEventListener('keyup', handleEscapeKeyEvent);
    } else {
      document.removeEventListener('keyup', handleEscapeKeyEvent);
    }

    return () => {
      document.removeEventListener('keyup', handleEscapeKeyEvent);
    };
  }, [openedDialogs]);

  const handleEscapeKeyEvent = (event: KeyboardEvent) => {
    // If the escape was pressed
    if (event.key === 'Escape') {
      // Get the last opened dialog
      const dialogData = last(openedDialogs);
      // Run the close function
      dialogData?.onClose();
    }
  };

  useEffectOnce(() => {
    const listeners: any = [];
    // Close login
    listeners.push(
      addMessageListener(Messages.CLOSE_LOGIN, (data: any): void => {
        if (data.qorus_instance) {
          setActiveInstance(data.qorus_instance);
        }
      })
    );
    // Set project folder
    listeners.push(
      addMessageListener(Messages.SET_PROJECT_FOLDER, (data: any): void => {
        setCurrentProjectFolder(data.folder);
      })
    );
    // Set instance
    listeners.push(
      addMessageListener(Messages.SET_QORUS_INSTANCE, ({ qorus_instance }): void => {
        setActiveInstance(qorus_instance);
      })
    );
    listeners.push(
      addMessageListener('display-notifications', ({ data }) => {
        if (data.length) {
          data.forEach(({ message, intent, timeout }) => {
            AppToaster.show({
              message,
              intent,
              timeout,
            });
          });
        }
      })
    );
    // Get the current project folder
    postMessage(Messages.GET_PROJECT_FOLDER);

    return () => {
      // remove all listeners
      listeners.forEach((l) => l());
    };
  });

  if (!t) {
    return <Loader text="Loading app..." />;
  }

  return (
    <>
      <DraftsContext.Provider
        value={{
          addDraft,
          removeDraft,
          maybeApplyDraft,
          maybeDeleteDraft,
          draft,
        }}
      >
        <ContextMenuContext.Provider
          value={{
            addMenu: setContextMenu,
            removeMenu: (onClose?: () => any) => {
              setContextMenu(null);
              if (onClose) {
                onClose();
              }
            },
          }}
        >
          <DialogsContext.Provider value={{ addDialog, removeDialog }}>
            {contextMenu && <ContextMenu {...contextMenu} onClick={() => setContextMenu(null)} />}
            <TextContext.Provider value={t}>
              {tab !== 'Login' && <Menu />}
              <ReqoreContent style={{ overflow: 'hidden', display: 'flex', flexFlow: 'column' }}>
                <ReqoreHeader>
                  <ReqoreNavbarGroup position="left">
                    <ReqoreNavbarItem>
                      <ReqoreTag
                        icon="Folder3Line"
                        labelKey={t('Project')}
                        label={project_folder}
                      />
                    </ReqoreNavbarItem>
                    <ReqoreNavbarItem>
                      <ReqoreTag
                        icon="ServerLine"
                        labelKey={t('ActiveQorusInstance')}
                        label={qorus_instance ? qorus_instance.name : t('N/A')}
                        color={qorus_instance ? '#7e2d90' : undefined}
                      />
                    </ReqoreNavbarItem>
                  </ReqoreNavbarGroup>
                  <ReqoreNavbarGroup position="right">
                    <ReqoreNavbarItem interactive onClick={() => setIsDirsDialogOpen(true)}>
                      <ReqoreIcon icon="Folder3Line" size="20px" margin="right" /> Manage source
                      directories
                    </ReqoreNavbarItem>
                    <ReqoreNavbarItem
                      interactive
                      as="a"
                      href="command:workbench.action.webview.reloadWebviewAction"
                      onClick={() =>
                        AppToaster.show({
                          message: t('ReloadingWebview'),
                          intent: 'warning',
                          icon: 'refresh',
                        })
                      }
                    >
                      <ReqoreIcon icon="RefreshLine" size="20px" />
                    </ReqoreNavbarItem>
                  </ReqoreNavbarGroup>
                </ReqoreHeader>
                <div style={{ margin: '10px', overflow: 'auto', display: 'flex', flex: 1 }}>
                  {isDirsDialogOpen && (
                    <SourceDirectories onClose={() => setIsDirsDialogOpen(false)} />
                  )}
                  <>
                    {tab == 'Login' && <LoginContainer />}
                    {tab == 'Loading' && <Loader text={t('Loading')} />}
                    {tab == 'ProjectConfig' && <ProjectConfig />}
                    {tab == 'ReleasePackage' && <ReleasePackage />}
                    {tab == 'DeleteInterfaces' && <DeleteInterfaces />}
                    {tab === 'Drafts' && <DraftsView />}
                    {!tab || (tab == 'CreateInterface' && <InterfaceCreator />)}
                  </>
                </div>
              </ReqoreContent>
            </TextContext.Provider>
            {confirmDialog.isOpen && (
              <CustomDialog
                isOpen
                icon="warning-sign"
                title={t('ConfirmDialogTitle')}
                onClose={() => {
                  confirmDialog.onCancel && confirmDialog.onCancel();
                  setConfirmDialog({});
                }}
                style={{ backgroundColor: '#fff' }}
              >
                <div className={Classes.DIALOG_BODY}>
                  <Callout intent={confirmDialog.btnStyle || 'danger'}>
                    {t(confirmDialog.text)}
                  </Callout>
                </div>
                <div className={Classes.DIALOG_FOOTER}>
                  <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                    <ButtonGroup>
                      <Button
                        text={t('Cancel')}
                        onClick={() => {
                          confirmDialog.onCancel && confirmDialog.onCancel();
                          setConfirmDialog({});
                        }}
                        id="global-dialog-cancel"
                      />
                      <Button
                        id="global-dialog-confirm"
                        text={t(confirmDialog.btnText || 'Remove')}
                        intent={confirmDialog.btnStyle || 'danger'}
                        onClick={() => {
                          confirmDialog.onSubmit();
                          setConfirmDialog({});
                        }}
                      />
                    </ButtonGroup>
                  </div>
                </div>
              </CustomDialog>
            )}
          </DialogsContext.Provider>
        </ContextMenuContext.Provider>
      </DraftsContext.Provider>
    </>
  );
};

const mapStateToProps = (state) => ({
  project_folder: state.current_project_folder,
  login_visible: state.login_visible,
});

const mapDispatchToProps = (dispatch) => ({
  setCurrentProjectFolder: (folder) => {
    dispatch({ type: 'current_project_folder', current_project_folder: folder });
  },
  openLogin: () => {
    dispatch({ type: 'login_visible', login_visible: true });
  },
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  withFields(),
  withInitialData(),
  withMethods(),
  withErrors(),
  withFunctions(),
  withSteps(),
  withMapper(),
  withGlobalOptions()
)(App);
