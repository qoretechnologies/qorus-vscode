import {
  ReqoreContent,
  ReqoreHeader,
  ReqoreIcon,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreNavbarDivider,
  ReqoreNavbarGroup,
  ReqoreNavbarItem,
  ReqorePopover,
  ReqoreTag,
  useReqore,
} from '@qoretechnologies/reqore';
import last from 'lodash/last';
import size from 'lodash/size';
import { FunctionComponent, useContext, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { useEffectOnce } from 'react-use';
import compose from 'recompose/compose';
import { createGlobalStyle } from 'styled-components';
import { DraftsView } from './DraftsView';
import ContextMenu from './components/ContextMenu';
import Loader from './components/Loader';
import Menu from './components/Menu';
import { interfaceIcons, interfaceKindToName, viewsIcons } from './constants/interfaces';
import { Messages } from './constants/messages';
import InterfaceCreator from './containers/InterfaceCreator';
import { InterfacesView } from './containers/InterfacesView';
import { ContextMenuContext, IContextMenu } from './context/contextMenu';
import { DialogsContext } from './context/dialogs';
import { DraftsContext, IDraftData } from './context/drafts';
import { ErrorsContext } from './context/errors';
import { InitialContext } from './context/init';
import { TextContext } from './context/text';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import { callBackendBasic, getTargetFile } from './helpers/functions';
import withErrors from './hocomponents/withErrors';
import withFields from './hocomponents/withFields';
import withFunctions from './hocomponents/withFunctions';
import withGlobalOptions from './hocomponents/withGlobalOptions';
import withInitialData from './hocomponents/withInitialData';
import withMapper from './hocomponents/withMapper';
import {
  TMessageListener,
  TPostMessage,
  addMessageListener,
  postMessage,
} from './hocomponents/withMessageHandler';
import withMethods from './hocomponents/withMethods';
import withSteps from './hocomponents/withSteps';
import { LoginContainer } from './login/Login';
import ProjectConfig from './project_config/ProjectConfig';
import SourceDirectories from './project_config/sourceDirs';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
const md5 = require('md5');

const GlobalStyle = createGlobalStyle`
  .reqore-tree, .reqore-tree-textarea {
    height: 100%;
  }
`;

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
  is_qore_installed,
  changeTab,
  main_color,
  path,
  theme,
  setTheme,
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
  const { addNotification } = useReqore();
  const { t, tabHistory, onHistoryBackClick } = useContext(InitialContext);

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
        const fetchedDraft = await callBackendBasic(
          Messages.GET_DRAFT,
          undefined,
          {
            interfaceKind,
            draftId: interfaceId,
          },
          null,
          addNotification
        );

        if (fetchedDraft.ok) {
          addDraft({ ...fetchedDraft.data });
          changeTab('CreateInterface', fetchedDraft.data.interfaceKind);
          setDraftData(null);
        }
      })();
    }
  }, [draftData]);

  const maybeDeleteDraft = (interfaceKind: string, interfaceId: string) => {
    callBackendBasic(
      Messages.DELETE_DRAFT,
      undefined,
      {
        no_notify: true,
        interfaceKind,
        interfaceId,
      },
      null,
      addNotification
    );
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
        const fetchedDraft = await callBackendBasic(
          Messages.GET_DRAFT,
          undefined,
          {
            interfaceKind: ifaceKind,
            draftId: md5(getTargetFile(existingInterface)),
          },
          null,
          addNotification
        );

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
            addNotification({
              content: message,
              intent,
              duration: timeout,
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

  const changeTheme = (theme: string) => {
    setTheme(theme);
    postMessage(Messages.CONFIG_UPDATE_CUSTOM_DATA, {
      data: {
        theme,
      },
    });
  };

  if (!t) {
    return <Loader text="Loading app..." />;
  }

  return (
    <>
      <GlobalStyle />
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
                        size="small"
                        icon="Folder3Line"
                        labelKey={t('Project')}
                        label={project_folder}
                      />
                    </ReqoreNavbarItem>
                    <ReqoreNavbarItem>
                      <ReqoreTag
                        size="small"
                        icon="ServerLine"
                        labelKey={t('ActiveQorusInstance')}
                        label={qorus_instance ? qorus_instance.name : t('N/A')}
                        effect={
                          qorus_instance
                            ? { gradient: { colors: '#7e2d90' }, weight: 'bold' }
                            : undefined
                        }
                      />
                    </ReqoreNavbarItem>
                    {!is_qore_installed && (
                      <ReqoreNavbarItem>
                        <ReqoreTag
                          size="small"
                          icon="ErrorWarningLine"
                          labelKey="qore"
                          label="missing"
                          effect={{ gradient: { colors: '#ac1728' }, weight: 'bold' }}
                        />
                      </ReqoreNavbarItem>
                    )}
                  </ReqoreNavbarGroup>
                  <ReqoreNavbarGroup position="right">
                    <ReqorePopover
                      component={ReqoreNavbarItem}
                      componentProps={{
                        interactive: true,
                        onClick: () => onHistoryBackClick(),
                        disabled: size(tabHistory) <= 1,
                      }}
                      handler="hoverStay"
                      isReqoreComponent
                      noWrapper
                      content={
                        <ReqoreMenu rounded maxHeight="300px">
                          <ReqoreMenuDivider label={'History'} />
                          {[...tabHistory].reverse().map(({ subtab, tab, name }, index: number) =>
                            index !== 0 ? (
                              <ReqoreMenuItem
                                icon={subtab ? interfaceIcons[subtab] : viewsIcons[tab]}
                                onClick={() => onHistoryBackClick(tabHistory.length - (index + 1))}
                                description={
                                  name || (tab === 'CreateInterface' ? 'New' : undefined)
                                }
                              >
                                {t(tab)}
                                {subtab ? ` : ${interfaceKindToName[subtab]}` : ''}
                              </ReqoreMenuItem>
                            ) : null
                          )}
                        </ReqoreMenu>
                      }
                    >
                      <ReqoreIcon icon="ArrowLeftSLine" size="huge" />
                    </ReqorePopover>
                    <ReqorePopover
                      component={ReqoreNavbarItem}
                      componentProps={{
                        interactive: true,
                        as: 'a',
                        href: 'command:workbench.action.webview.reloadWebviewAction',
                        onClick: () =>
                          addNotification({
                            content: t('ReloadingWebview'),
                            intent: 'warning',
                            icon: 'RefreshLine',
                          }),
                      }}
                      content={'Reload webview'}
                    >
                      <ReqoreIcon icon="RefreshLine" size="20px" />
                    </ReqorePopover>
                    <ReqoreNavbarDivider />
                    <ReqorePopover
                      isReqoreComponent
                      component={ReqoreNavbarItem}
                      componentProps={{
                        interactive: true,
                        onClick: () => setIsDirsDialogOpen(true),
                      }}
                      content={'Manage source directories'}
                    >
                      <ReqoreIcon icon="FolderAddLine" size="20px" />
                    </ReqorePopover>
                    <ReqorePopover
                      component={ReqoreNavbarItem}
                      componentProps={{ interactive: true }}
                      handler="click"
                      isReqoreComponent
                      noWrapper
                      content={
                        <ReqoreMenu rounded>
                          <ReqoreMenuDivider label={'Change theme'} />
                          <ReqoreMenuItem
                            icon="SunFill"
                            onClick={() => changeTheme('light')}
                            selected={theme === 'light'}
                            rightIcon={theme === 'light' ? 'CheckLine' : undefined}
                          >
                            Light theme
                          </ReqoreMenuItem>
                          <ReqoreMenuItem
                            icon="MoonFill"
                            onClick={() => changeTheme('dark')}
                            selected={theme === 'dark'}
                            rightIcon={theme === 'dark' ? 'CheckLine' : undefined}
                          >
                            Dark theme
                          </ReqoreMenuItem>
                          <ReqoreMenuItem
                            icon="CodeBoxLine"
                            onClick={() => changeTheme('vscode')}
                            selected={theme === 'vscode'}
                            rightIcon={theme === 'vscode' ? 'CheckLine' : undefined}
                          >
                            Follow VSCode theme
                          </ReqoreMenuItem>
                        </ReqoreMenu>
                      }
                    >
                      <ReqoreIcon icon="PaletteLine" size="20px" tooltip="Change theme" />
                    </ReqorePopover>
                  </ReqoreNavbarGroup>
                </ReqoreHeader>
                <div
                  style={{
                    margin: '0 10px',
                    overflow: 'auto',
                    display: 'flex',
                    flex: 1,
                    flexFlow: 'column',
                  }}
                >
                  <SourceDirectories
                    isOpen={isDirsDialogOpen}
                    onClose={() => setIsDirsDialogOpen(false)}
                  />
                  <>
                    {tab == 'Login' && <LoginContainer />}
                    {tab == 'Loading' && <Loader text={t('Loading')} />}
                    {tab == 'ProjectConfig' && <ProjectConfig />}
                    {tab == 'SourceDirs' && <SourceDirectories flat />}
                    {tab == 'ReleasePackage' && <ReleasePackage />}
                    {tab == 'DeleteInterfaces' && <DeleteInterfaces />}
                    {tab === 'Drafts' && <DraftsView />}
                    {tab === 'Interfaces' && <InterfacesView />}
                    {!tab || (tab == 'CreateInterface' && <InterfaceCreator />)}
                  </>
                </div>
              </ReqoreContent>
            </TextContext.Provider>
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
