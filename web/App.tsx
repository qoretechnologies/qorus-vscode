import React, { Component, FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { Alignment, Button, HTMLTable, Navbar, NavbarDivider, NavbarGroup, ButtonGroup } from '@blueprintjs/core';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import InterfaceCreator from './containers/InterfaceCreator';
import { hot } from 'react-hot-loader/root';
import styled from 'styled-components';
import withMessageHandler, { TMessageListener, TPostMessage } from './hocomponents/withMessageHandler';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import { Messages } from './constants/messages';
import { TextContext } from './context/text';
import compose from 'recompose/compose';
import withFields from './hocomponents/withFields';
import withMethods from './hocomponents/withMethods';
import withInitialData from './hocomponents/withInitialData';
import withSteps from './hocomponents/withSteps';
import Menu from './components/Menu';
import { MENU } from './constants/menu';
import { LoginContainer } from './login/Login';
import ProjectConfig, { ProjectConfigContainer } from './project_config/ProjectConfig';
import withMapper from './hocomponents/withMapper';
import Pull from './components/Pull';

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
        return <p> Loading translations... </p>;
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
                    <Pull right>
                        <ButtonGroup minimal>
                            <Button icon="refresh" onClick={() => window.location.reload} />
                        </ButtonGroup>
                    </Pull>
                </NavbarGroup>
            </Navbar>
            <TextContext.Provider value={t}>
                <StyledApp>
                    {tab !== 'Login' && <Menu menu={MENU} />}
                    <>
                        {tab == 'Login' && <LoginContainer />}
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
        withSteps(),
        withMapper()
    )(App)
);
