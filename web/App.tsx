import React, { Component, FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { Alignment, Button, HTMLTable, Navbar, NavbarDivider, NavbarGroup } from '@blueprintjs/core';
import { LoginContainer as Login } from './login/Login';
import { ProjectConfigContainer as ProjectConfig } from './project_config/ProjectConfig';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import InterfaceCreator from './containers/InterfaceCreator';
import { vscode } from './common/vscode';
import logo from '../images/qorus_logo_256.png';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import withMessageHandler, { TMessageListener, TPostMessage } from './hocomponents/withMessageHandler';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { Messages } from './constants/messages';
import { TextContext } from './context/text';
import compose from 'recompose/compose';
import withFields from './hocomponents/withFields';

const StyledApp = styled.div`
    display: flex;
    flex-flow: column;
    margin-top: 50px;
    flex: 1 auto;
`;

const Tabs = {
    Login: 'log-in',
    ProjectConfig: 'cog',
    ReleasePackage: 'cube',
    DeleteInterfaces: 'trash',
    CreateInterface: 'draw',
};

export interface IApp {
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    active_tab: string;
    project_folder: string;
    qorus_instance: any;
    login_visible: boolean;
    setActiveTab: (activeTab: string) => void;
    openLogin: () => void;
    closeLogin: () => void;
    setCurrentQorusInstance: (inst: string) => void;
    setCurrentProjectFolder: (folder: string) => void;
}

export type TTranslator = (id: string) => string;

const App: FunctionComponent<IApp> = ({
    addMessageListener,
    postMessage,
    setActiveTab,
    openLogin,
    closeLogin,
    setCurrentQorusInstance,
    setCurrentProjectFolder,
    active_tab,
    project_folder,
    qorus_instance,
    login_visible,
}) => {
    const [texts, setTexts] = useState<{ [key: string]: string }>({});

    useEffectOnce(() => {
        // New text was received
        addMessageListener(
            Messages.TEXT_RECEIVED,
            (data: any): void => {
                setTexts(currentTexts => {
                    // Do not modify state if the text alread
                    // exists
                    if (!currentTexts[data.text_id]) {
                        return {
                            ...currentTexts,
                            [data.text_id]: data.text,
                        };
                    }
                    // Return current state
                    return currentTexts;
                });
            }
        );
        // Set the active tab
        addMessageListener(
            Messages.SET_ACTIVE_TAB,
            (data: any): void => {
                setActiveTab(data.active_tab);
                if (data.active_tab === 'Login') {
                    openLogin();
                }
            }
        );
        // Close login
        addMessageListener(
            Messages.CLOSE_LOGIN,
            (data: any): void => {
                closeLogin();
                if (data.qorus_instance) {
                    setCurrentQorusInstance(data.qorus_instance);
                }
            }
        );
        // Set project folder
        addMessageListener(
            Messages.SET_PROJECT_FOLDER,
            (data: any): void => {
                setCurrentProjectFolder(data.folder);
            }
        );
        // Set instance
        addMessageListener(
            Messages.SET_QORUS_INSTANCE,
            (data: any): void => {
                setCurrentQorusInstance(data.qorus_instance);
            }
        );
        // Get the current active tab
        postMessage(Messages.GET_ACTIVE_TAB);
        // Get the current project folder
        postMessage(Messages.GET_PROJECT_FOLDER);
    });

    const t: TTranslator = text_id => {
        // Return the text if it was found
        if (texts[text_id]) {
            return texts[text_id];
        }
        // Otherwise ask for it
        postMessage(Messages.GET_TEXT, { text_id });
        return '';
    };

    return (
        <>
            <Navbar fixedToTop={true}>
                <NavbarGroup>
                    <img style={{ maxWidth: 30, maxHeight: 30, marginRight: 54 }} src={logo} />
                    {Object.keys(Tabs).map(
                        tab_key =>
                            (tab_key !== 'Login' || login_visible) && (
                                <Button
                                    minimal={true}
                                    icon={Tabs[tab_key]}
                                    key={tab_key}
                                    active={tab_key == active_tab}
                                    onClick={() => setActiveTab(tab_key)}
                                    text={t(tab_key + '-buttonText')}
                                    title={t(tab_key + '-buttonTitle')}
                                />
                            )
                    )}
                </NavbarGroup>
                <NavbarGroup align={Alignment.RIGHT} style={{ marginRight: 36 }}>
                    <NavbarDivider />
                    <HTMLTable condensed={true} className={'navbar-info-table'}>
                        <tr>
                            <td>{t('Project')}:</td>
                            <td>
                                <strong>{project_folder}</strong>
                            </td>
                        </tr>
                        <tr>
                            <td>{t('ActiveQorusInstance')}:</td>
                            <td>
                                <strong>{qorus_instance ? qorus_instance.name : t('N/A')}</strong>
                            </td>
                        </tr>
                    </HTMLTable>
                </NavbarGroup>
            </Navbar>
            <TextContext.Provider value={t}>
                <StyledApp>
                    {active_tab == 'Login' && <Login />}
                    {active_tab == 'ProjectConfig' && <ProjectConfig />}
                    {active_tab == 'ReleasePackage' && <ReleasePackage />}
                    {active_tab == 'DeleteInterfaces' && <DeleteInterfaces />}
                    {active_tab == 'CreateInterface' && <InterfaceCreator />}
                </StyledApp>
            </TextContext.Provider>
        </>
    );
};

const mapStateToProps = state => ({
    active_tab: state.active_tab_queue[0],
    project_folder: state.current_project_folder,
    qorus_instance: state.current_qorus_instance,
    login_visible: state.login_visible,
});

const mapDispatchToProps = dispatch => ({
    setActiveTab: tab_key => {
        dispatch({ type: 'active_tab', active_tab: tab_key });
    },
    setCurrentProjectFolder: folder => {
        dispatch({ type: 'current_project_folder', current_project_folder: folder });
    },
    setCurrentQorusInstance: qorus_instance => {
        dispatch({ type: 'current_qorus_instance', current_qorus_instance: qorus_instance });
    },
    openLogin: () => {
        dispatch({ type: 'login_visible', login_visible: true });
    },
    closeLogin: () => {
        dispatch({ type: 'close_tab', tab: 'Login' });
        dispatch({ type: 'login_clear' });
        dispatch({ type: 'login_visible', login_visible: false });
    },
});

export default hot(
    compose(
        withMessageHandler(),
        connect(
            mapStateToProps,
            mapDispatchToProps
        ),
        withFields()
    )(App)
);
