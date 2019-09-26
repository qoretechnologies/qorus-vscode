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
import Panel from './containers/InterfaceCreator/panel';
import Box from './components/Box';
import withMethods from './hocomponents/withMethods';
import withInitialData from './hocomponents/withInitialData';
import withSteps from './hocomponents/withSteps';
import Menu from './components/Menu';
import { MENU } from './constants/menu';
import { Classes } from '@blueprintjs/select';

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
    font-family: 'NeoLight';
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
    tab: string;
    project_folder: string;
    qorus_instance: any;
    login_visible: boolean;
    changeTab: (activeTab: string) => void;
    openLogin: () => void;
    closeLogin: () => void;
    setCurrentQorusInstance: (inst: string) => void;
    setCurrentProjectFolder: (folder: string) => void;
}

export type TTranslator = (id: string) => string;

const pastTexts: { [id: string]: { isTranslated: boolean; text: string } } = {};

const App: FunctionComponent<IApp> = ({
    addMessageListener,
    postMessage,
    changeTab,
    openLogin,
    closeLogin,
    setCurrentQorusInstance,
    setCurrentProjectFolder,
    tab,
    project_folder,
    qorus_instance,
    login_visible,
    path,
}) => {
    const [texts, setTexts] = useState<{ [key: string]: string }>({});
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
            closeLogin();
            if (data.qorus_instance) {
                setCurrentQorusInstance(data.qorus_instance);
            }
        });
        // Set project folder
        addMessageListener(Messages.SET_PROJECT_FOLDER, (data: any): void => {
            setCurrentProjectFolder(data.folder);
        });
        // Set instance
        addMessageListener(Messages.SET_QORUS_INSTANCE, (data: any): void => {
            setCurrentQorusInstance(data.qorus_instance);
        });
        // Get the current project folder
        postMessage(Messages.GET_PROJECT_FOLDER);
    });

    const t: TTranslator = text_id => {
        if (!text_id) {
            return 'Missing text id';
        }
        // Return the text if it was found
        if (!pastTexts[text_id]) {
            // Save the text
            pastTexts[text_id] = { isTranslated: false, text: text_id };
            // Otherwise ask for it
            postMessage(Messages.GET_TEXT, { text_id });
        } else if (!pastTexts[text_id].isTranslated) {
            // Ask for the translation again
            postMessage(Messages.GET_TEXT, { text_id });
        }
        // Return the text
        return pastTexts[text_id].text;
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
            </Navbar>
            <TextContext.Provider value={t}>
                <StyledApp>
                    {tab !== 'Login' && <Menu menu={MENU} />}
                    <>
                        {tab == 'Login' && <Login />}
                        {tab == 'ProjectConfig' && <ProjectConfig />}
                        {tab == 'ReleasePackage' && <ReleasePackage />}
                        {tab == 'DeleteInterfaces' && <DeleteInterfaces />}
                        {!tab || (tab == 'CreateInterface' && <InterfaceCreator />)}
                    </>
                </StyledApp>
            </TextContext.Provider>
        </>
    );
};

const mapStateToProps = state => ({
    project_folder: state.current_project_folder,
    qorus_instance: state.current_qorus_instance,
    login_visible: state.login_visible,
});

const mapDispatchToProps = dispatch => ({
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
        withInitialData(),
        withFields(),
        withMethods(),
        withSteps()
    )(App)
);
