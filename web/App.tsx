import { AnchorButton, Button, ButtonGroup, Callout, Classes, Navbar, NavbarGroup } from '@blueprintjs/core';
import last from 'lodash/last';
import size from 'lodash/size';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import { useEffectOnce } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import ContextMenu from './components/ContextMenu';
import CustomDialog from './components/CustomDialog';
import Loader from './components/Loader';
import Menu from './components/Menu';
import Pull from './components/Pull';
import { AppToaster } from './components/Toast';
import { MENU } from './constants/menu';
import { Messages } from './constants/messages';
import InterfaceCreator from './containers/InterfaceCreator';
import { ContextMenuContext, IContextMenu } from './context/contextMenu';
import { DialogsContext } from './context/dialogs';
import { TextContext } from './context/text';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import withErrors from './hocomponents/withErrors';
import withFields from './hocomponents/withFields';
import withFunctions from './hocomponents/withFunctions';
import withGlobalOptions from './hocomponents/withGlobalOptions';
import withInitialData from './hocomponents/withInitialData';
import withMapper from './hocomponents/withMapper';
import { addMessageListener, postMessage, TMessageListener, TPostMessage } from './hocomponents/withMessageHandler';
import withMethods from './hocomponents/withMethods';
import withSteps from './hocomponents/withSteps';
import { LoginContainer } from './login/Login';
import ProjectConfig from './project_config/ProjectConfig';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';

const StyledApp = styled.div`
    display: flex;
    flex-flow: row;
    margin-top: 50px;
    flex: 1 1 auto;
    overflow: hidden;
`;

const StyledInfo = styled.p`
    display: inline-block;
    line-height: 20px;
    margin: 0;
    font-family: 'Arial';
    font-size: 18px;
    padding: 0 10px;
    font-weight: bold;
    color: #fff;

    span {
        display: inline-block;
        padding: 0 0 0 5px;
        font-weight: normal;
        color: unset;
    }

    &:first-of-type {
        border-right: 1px solid #474c57;
    }
`;

export interface IApp {
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    tab: string;
    project_folder: string;
    qorus_instance: any;
    login_visible: boolean;
    changeTab: (activeTab: string) => void;
    openLogin: () => void;
    closeLogin: () => void;
    setActiveInstance: (inst: string) => void;
    setCurrentProjectFolder: (folder: string) => void;
    path: string;
}

export type TTranslator = (id: string) => string;

const pastTexts: { [id: string]: { isTranslated: boolean; text: string } } = {};

const App: FunctionComponent<IApp> = ({
    closeLogin,
    setActiveInstance,
    setCurrentProjectFolder,
    tab,
    project_folder,
    qorus_instance,
    changeTab,
    path,
    image_path,
    confirmDialog,
    setConfirmDialog,
}) => {
    const [texts, setTexts] = useState<{ [key: string]: string }[]>(null);
    const [openedDialogs, setOpenedDialogs] = useState<{ id: string; onClose: () => void }[]>([]);
    const [contextMenu, setContextMenu] = useState<IContextMenu>(null);

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
            dialogData.onClose();
        }
    };

    useEffectOnce(() => {
        const listeners = [];
        // New text was received
        listeners.push(
            addMessageListener(Messages.TEXT_RECEIVED, (data: any): void => {
                setTexts((currentTexts) => {
                    // Do not modify state if the text already
                    // exists
                    if (!currentTexts[data.text_id]) {
                        pastTexts[data.text_id] = { isTranslated: true, text: data.text };
                        return {
                            ...currentTexts,
                            [data.text_id]: data.text,
                        };
                    }
                    // Return current state
                    return currentTexts;
                });
            })
        );
        // Close login
        listeners.push(
            addMessageListener(Messages.CLOSE_LOGIN, (data: any): void => {
                changeTab('ProjectConfig');

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
            addMessageListener('return-all-text', ({ data }): void => {
                setTexts(data);
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
        postMessage('get-all-text');

        return () => {
            // remove all listeners
            listeners.forEach((l) => l());
        };
    });

    if (!texts) {
        return <Loader text="Loading translations..." />;
    }

    const t: TTranslator = (text_id) => {
        return texts.find((textItem) => textItem.id === text_id)?.text || text_id;
    };

    return (
        <>
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
                    <Navbar fixedToTop={true} className="dark">
                        <NavbarGroup>
                            <img
                                style={{ maxWidth: 30, maxHeight: 30, marginRight: 10 }}
                                src={`${image_path}/images/qorus_logo_256.png`}
                            />
                            <StyledInfo>
                                {t('Project')}: <span>{project_folder}</span>
                            </StyledInfo>
                            <StyledInfo>
                                {t('ActiveQorusInstance')}:{' '}
                                <span>{qorus_instance ? qorus_instance.name : t('N/A')}</span>
                            </StyledInfo>
                        </NavbarGroup>
                        <Pull right>
                            <NavbarGroup>
                                <ButtonGroup minimal>
                                    <AnchorButton
                                        icon="refresh"
                                        href="command:workbench.action.webview.reloadWebviewAction"
                                        onClick={() =>
                                            AppToaster.show({
                                                message: t('ReloadingWebview'),
                                                intent: 'warning',
                                                icon: 'refresh',
                                            })
                                        }
                                    />
                                </ButtonGroup>
                            </NavbarGroup>
                        </Pull>
                    </Navbar>
                    <TextContext.Provider value={t}>
                        <StyledApp>
                            {tab !== 'Login' && <Menu isCollapsed menu={MENU} />}
                            <>
                                {tab == 'Login' && <LoginContainer />}
                                {tab == 'ProjectConfig' && <ProjectConfig />}
                                {tab == 'ReleasePackage' && <ReleasePackage />}
                                {tab == 'DeleteInterfaces' && <DeleteInterfaces />}
                                {!tab || (tab == 'CreateInterface' && <InterfaceCreator />)}
                            </>
                        </StyledApp>
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
                                <Callout intent={confirmDialog.btnStyle || 'danger'}>{t(confirmDialog.text)}</Callout>
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

export default hot(
    compose(
        connect(mapStateToProps, mapDispatchToProps),
        withInitialData(),
        withFields(),
        withMethods(),
        withErrors(),
        withFunctions(),
        withSteps(),
        withMapper(),
        withGlobalOptions()
    )(App)
);
