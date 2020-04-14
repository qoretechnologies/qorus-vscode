import React, { FunctionComponent, useState } from 'react';

import { hot } from 'react-hot-loader/root';
import { connect } from 'react-redux';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import compose from 'recompose/compose';
import styled from 'styled-components';

import { AnchorButton, Button, ButtonGroup, Callout, Classes, Dialog, Navbar, NavbarGroup } from '@blueprintjs/core';

import Loader from './components/Loader';
import Menu from './components/Menu';
import Pull from './components/Pull';
import { AppToaster } from './components/Toast';
import { MENU } from './constants/menu';
import { Messages } from './constants/messages';
import InterfaceCreator from './containers/InterfaceCreator';
import { TextContext } from './context/text';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import withFields from './hocomponents/withFields';
import withFunctions from './hocomponents/withFunctions';
import withGlobalOptions from './hocomponents/withGlobalOptions';
import withInitialData from './hocomponents/withInitialData';
import withMapper from './hocomponents/withMapper';
import withMessageHandler, { TMessageListener, TPostMessage } from './hocomponents/withMessageHandler';
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
    addMessageListener,
    postMessage,
    closeLogin,
    setActiveInstance,
    setCurrentProjectFolder,
    tab,
    project_folder,
    qorus_instance,
    changeTab,
    path,
    confirmDialog,
    setConfirmDialog,
}) => {
    const [texts, setTexts] = useState<{ [key: string]: string }[]>(null);

    useEffectOnce(() => {
        // New text was received
        addMessageListener(Messages.TEXT_RECEIVED, (data: any): void => {
            setTexts(currentTexts => {
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
        });
        // Close login
        addMessageListener(Messages.CLOSE_LOGIN, (data: any): void => {
            changeTab('ProjectConfig');

            if (data.qorus_instance) {
                setActiveInstance(data.qorus_instance);
            }
        });
        // Set project folder
        addMessageListener(Messages.SET_PROJECT_FOLDER, (data: any): void => {
            setCurrentProjectFolder(data.folder);
        });
        // Set instance
        addMessageListener(Messages.SET_QORUS_INSTANCE, ({ qorus_instance }): void => {
            setActiveInstance(qorus_instance);
        });
        addMessageListener('return-all-text', ({ data }): void => {
            setTexts(data);
        });
        // Get the current project folder
        postMessage(Messages.GET_PROJECT_FOLDER);
        postMessage('get-all-text');
    });

    if (!texts) {
        return <Loader text="Loading translations..." />;
    }

    const t: TTranslator = text_id => {
        return texts.find(textItem => textItem.id === text_id)?.text || text_id;
    };

    return (
        <>
            <Navbar fixedToTop={true} className="dark">
                <NavbarGroup>
                    <img
                        style={{ maxWidth: 30, maxHeight: 30, marginRight: 10 }}
                        src={`vscode-resource:${path}/images/qorus_logo_256.png`}
                    />
                    <StyledInfo>
                        {t('Project')}: <span>{project_folder}</span>
                    </StyledInfo>
                    <StyledInfo>
                        {t('ActiveQorusInstance')}: <span>{qorus_instance ? qorus_instance.name : t('N/A')}</span>
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
                <Dialog
                    isOpen
                    icon="warning-sign"
                    title={t('ConfirmDialogTitle')}
                    onClose={() => setConfirmDialog({})}
                    style={{ backgroundColor: '#fff' }}
                >
                    <div className={Classes.DIALOG_BODY}>
                        <Callout intent={confirmDialog.btnStyle || 'danger'}>{t(confirmDialog.text)}</Callout>
                    </div>
                    <div className={Classes.DIALOG_FOOTER}>
                        <div className={Classes.DIALOG_FOOTER_ACTIONS}>
                            <ButtonGroup>
                                <Button text={t('Cancel')} onClick={() => setConfirmDialog({})} id="remove-cancel" />
                                <Button
                                    id="remove-confirm"
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
                </Dialog>
            )}
        </>
    );
};

const mapStateToProps = state => ({
    project_folder: state.current_project_folder,
    login_visible: state.login_visible,
});

const mapDispatchToProps = dispatch => ({
    setCurrentProjectFolder: folder => {
        dispatch({ type: 'current_project_folder', current_project_folder: folder });
    },
    openLogin: () => {
        dispatch({ type: 'login_visible', login_visible: true });
    },
});

export default hot(
    compose(
        withMessageHandler(),
        connect(mapStateToProps, mapDispatchToProps),
        withInitialData(),
        withFields(),
        withMethods(),
        withFunctions(),
        withSteps(),
        withMapper(),
        withGlobalOptions()
    )(App)
);
