import {
  ReqoreBreadcrumbs,
  ReqoreH1,
  ReqoreIcon,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreModal,
  ReqorePanel,
  useReqore,
} from '@qoretechnologies/reqore';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import last from 'lodash/last';
import size from 'lodash/size';
import { FunctionComponent, useContext, useEffect, useMemo, useState } from 'react';
import { connect } from 'react-redux';
import { useEffectOnce, useMount, useUnmount } from 'react-use';
import compose from 'recompose/compose';
import { createGlobalStyle } from 'styled-components';
import packageJson from '../package.json';
import ContextMenu from './components/ContextMenu';
import Loader from './components/Loader';
import QorusBase64Image from './components/QorusBase64Image';
import {
  interfaceIcons,
  interfaceKindToName,
  interfaceNameToKind,
  viewsIcons,
  viewsNames,
} from './constants/interfaces';
import { MenuSubItems } from './constants/menu';
import { Messages } from './constants/messages';
import InterfaceCreator from './containers/InterfaceCreator';
import { InterfacesView } from './containers/InterfacesView';
import { ContextMenuContext, IContextMenu } from './context/contextMenu';
import { DialogsContext } from './context/dialogs';
import { InitialContext } from './context/init';
import { TextContext } from './context/text';
import withErrors from './hocomponents/withErrors';
import withFields from './hocomponents/withFields';
import withFunctions from './hocomponents/withFunctions';
import withGlobalOptions from './hocomponents/withGlobalOptions';
import withInitialData from './hocomponents/withInitialData';
import withMapper from './hocomponents/withMapper';
import {
  TMessageListener,
  TPostMessage,
  WS_RECONNECT_MAX_TRIES,
  addMessageListener,
  createOrGetWebSocket,
  disconnectWebSocket,
  isWebSocketSupported,
  postMessage,
} from './hocomponents/withMessageHandler';
import withMethods from './hocomponents/withMethods';
import withSteps from './hocomponents/withSteps';
import { LoginContainer } from './login/Login';
import ProjectConfig from './project_config/ProjectConfig';
import SourceDirectories from './project_config/sourceDirs';
import { DraftsProvider } from './providers/Drafts';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
import { Dashboard } from './views/dashboard';
const md5 = require('md5');

const GlobalStyle = createGlobalStyle`
  html, body, #root {
    height: 100%;
  }

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
  is_hosted_instance,
  ...rest
}) => {
  const [openedDialogs, setOpenedDialogs] = useState<{ id: string; onClose: () => void }[]>([]);
  const [contextMenu, setContextMenu] = useState<IContextMenu>(null);
  const [isDirsDialogOpen, setIsDirsDialogOpen] = useState<boolean>(false);
  const { addNotification } = useReqore();
  const { t, tabHistory, onHistoryBackClick } = useContext(InitialContext);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [websocketReconnectTry, setWebsocketReconnectTry] = useState<number>(0);
  const [hasWebsocketFailedToReconnect, setHasWebsocketFailedToReconnect] =
    useState<boolean>(false);

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

  const badges: IReqorePanelProps['badge'] = useMemo(() => {
    let badge: IReqorePanelProps['badge'] = [];

    return badge;
  }, []);

  useMount(() => {
    if (isWebSocketSupported && is_hosted_instance) {
      createOrGetWebSocket(qorus_instance, 'creator', {
        onOpen: () => {
          setWebsocketReconnectTry(0);
          setHasWebsocketFailedToReconnect(false);

          setIsLoading(false);
        },
        onClose: () => {
          setIsLoading(false);
        },
        onError: () => {
          setIsLoading(false);
        },
        onReconnecting: (reconnectNumber) => {
          setWebsocketReconnectTry(reconnectNumber);
        },
        onReconnectFailed: () => {
          setWebsocketReconnectTry(0);
          setHasWebsocketFailedToReconnect(true);
        },
      });
    } else {
      console.error('Websockets Not Supported');
      setIsLoading(false);
    }
  });

  useUnmount(() => {
    disconnectWebSocket('creator');
  });

  if (!t || isLoading) {
    return <Loader text="Loading app..." />;
  }

  return (
    <>
      <GlobalStyle />
      <DraftsProvider>
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
              {/*tab !== 'Login' && <Menu />*/}
              <ReqorePanel
                fluid
                fill
                flat
                padded={false}
                rounded={false}
                iconImage={QorusBase64Image}
                iconProps={{ size: '27px', style: { height: 'auto' } }}
                contentStyle={{ overflow: 'hidden', display: 'flex', flexFlow: 'column' }}
                label="Qorus IDE"
                badge={badges}
                headerEffect={{
                  glow: {
                    color: '#7e2d90',
                    blur: 0.5,
                    size: 0.5,
                  },
                }}
                actions={[
                  {
                    fixed: true,
                    group: [
                      {
                        onClick: () => onHistoryBackClick(),
                        disabled: size(tabHistory) <= 1,
                        icon: 'ArrowLeftSLine',

                        tooltip: {
                          noWrapper: true,
                          noArrow: true,
                          handler: 'hoverStay',
                          content: (
                            <ReqoreMenu rounded maxHeight="300px">
                              <ReqoreMenuDivider label={'History'} />
                              {[...tabHistory]
                                .reverse()
                                .map(({ subtab, tab, name }, index: number) =>
                                  index !== 0 ? (
                                    <ReqoreMenuItem
                                      icon={subtab ? interfaceIcons[subtab] : viewsIcons[tab]}
                                      onClick={() =>
                                        onHistoryBackClick(tabHistory.length - (index + 1))
                                      }
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
                          ),
                        },
                      },
                      {
                        icon: 'RefreshLine',
                        onClick: () => {
                          addNotification({
                            content: t('ReloadingWebview'),
                            intent: 'pending',
                            icon: 'RefreshLine',
                          });
                          postMessage('reload-webview');
                        },
                        tooltip: 'Reload webview',
                      },
                    ],
                  },
                  {
                    fixed: true,
                    group: [
                      {
                        icon: viewsIcons['Interfaces'],
                        onClick: () => changeTab('Interfaces'),
                        tooltip: {
                          handler: 'hoverStay',
                          noWrapper: true,
                          content: (
                            <ReqoreMenu rounded width="250px">
                              <ReqoreMenuDivider label={t('Objects')} />
                              {MenuSubItems.map((item) => (
                                <ReqoreMenuItem
                                  label={item.name}
                                  icon={item.icon}
                                  onClick={() =>
                                    changeTab('Interfaces', interfaceNameToKind[item.name])
                                  }
                                  rightIcon="AddCircleLine"
                                  rightIconColor="info"
                                  rightIconProps={{
                                    intent: 'info',
                                  }}
                                  onRightIconClick={() =>
                                    changeTab('CreateInterface', interfaceNameToKind[item.name])
                                  }
                                />
                              ))}
                            </ReqoreMenu>
                          ),
                        },
                      },
                      {
                        icon: viewsIcons['ReleasePackage'],
                        onClick: () => changeTab('ReleasePackage'),
                      },
                    ],
                  },
                  {
                    icon: 'FolderAddLine',
                    onClick: () => setIsDirsDialogOpen(true),
                    tooltip: 'Manage source directories',
                    show: !is_hosted_instance,
                  },
                  {
                    icon: 'MoreLine',
                    actions: [
                      {
                        divider: true,
                        label: 'Theme',
                      },
                      {
                        icon: 'SunFill',
                        onClick: () => changeTheme('light'),
                        selected: theme === 'light',
                        rightIcon: theme === 'light' ? 'CheckLine' : undefined,
                        label: 'Light Theme',
                      },
                      {
                        icon: 'MoonFill',
                        onClick: () => changeTheme('dark'),
                        selected: theme === 'dark',
                        rightIcon: theme === 'dark' ? 'CheckLine' : undefined,
                        label: 'Dark Theme',
                      },
                      {
                        icon: 'CodeBoxLine',
                        onClick: () => changeTheme('vscode'),
                        selected: theme === 'vscode',
                        rightIcon: theme === 'vscode' ? 'CheckLine' : undefined,
                        label: 'Follow VSCode Theme',
                      },
                      {
                        divider: true,
                        label: 'Info',
                      },
                      {
                        label: `Version: v${packageJson.version} ${
                          process.env.NODE_ENV === 'development' ? '_dev' : ''
                        }`,
                        readOnly: true,
                      },
                      {
                        label: `Project: ${project_folder}`,
                        readOnly: true,
                      },
                    ],
                  },
                ]}
              >
                <div
                  style={{
                    margin: '0',
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
                  {tab !== 'CreateInterface' &&
                  tab !== 'Dashboard' &&
                  tab !== 'Login' &&
                  tab !== 'ProjectConfig' &&
                  tab !== 'Loading' ? (
                    <ReqoreBreadcrumbs
                      size="normal"
                      flat
                      style={{
                        border: 'none',
                        paddingTop: '10px',
                        paddingBottom: '10px',
                        margin: 0,
                      }}
                      items={[
                        {
                          icon: 'Home4Fill',
                          onClick: () => {
                            changeTab(is_hosted_instance ? 'Dashboard' : 'ProjectConfig');
                          },
                        },
                        {
                          icon: viewsIcons[tab],
                          label: viewsNames[tab],
                          onClick: () => {
                            changeTab('Interfaces', tab);
                          },
                        },
                      ]}
                    />
                  ) : null}
                  <>
                    {websocketReconnectTry > 0 ? (
                      <ReqoreModal isOpen intent="warning" blur={5}>
                        <ReqoreH1 effect={{ textAlign: 'center' }}>
                          Lost connection to server. Trying to reconnect...{' '}
                          <ReqoreIcon
                            icon="Loader3Line"
                            animation="spin"
                            size="big"
                            margin="both"
                          />
                          {websocketReconnectTry} / {WS_RECONNECT_MAX_TRIES}
                        </ReqoreH1>
                      </ReqoreModal>
                    ) : null}
                    {hasWebsocketFailedToReconnect && (
                      <ReqoreModal isOpen intent="danger" blur={5}>
                        <ReqoreH1 effect={{ textAlign: 'center' }}>
                          Unable to establish a connection to the server, please try to reload the
                          page.
                        </ReqoreH1>
                      </ReqoreModal>
                    )}
                    {tab == 'Dashboard' && <Dashboard />}
                    {tab == 'Login' && <LoginContainer />}
                    {tab == 'Loading' && <Loader text={t('Loading')} />}
                    {tab == 'ProjectConfig' && <ProjectConfig />}
                    {tab == 'SourceDirs' && <SourceDirectories flat />}
                    {tab == 'ReleasePackage' && <ReleasePackage />}
                    {tab === 'Interfaces' && <InterfacesView />}
                    {!tab || (tab == 'CreateInterface' && <InterfaceCreator />)}
                  </>
                </div>
              </ReqorePanel>
            </TextContext.Provider>
          </DialogsContext.Provider>
        </ContextMenuContext.Provider>
      </DraftsProvider>
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
