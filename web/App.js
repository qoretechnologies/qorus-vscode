import React, { Component } from 'react';
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

const StyledApp = styled.div`
    display: flex;
    flex-flow: column;
    margin-top: 50px;
    flex: 1 auto;
`;

class App extends Component {
    constructor() {
        super();

        this.texts = {};
        this.num_text_requests = 0;

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-text':
                    this.texts[event.data.text_id] = event.data.text;
                    if (--this.num_text_requests == 0) {
                        this.forceUpdate();
                    }
                    break;
                case 'set-active-tab':
                    this.props.setActiveTab(event.data.active_tab);
                    if (event.data.active_tab === 'Login') {
                        this.props.openLogin();
                    }
                    break;
                case 'close-login':
                    this.props.closeLogin(false);
                    if (event.data.qorus_instance) {
                        this.props.setCurrentQorusInstance(event.data.qorus_instance);
                    }
                    break;
                case 'current-project-folder':
                    this.props.setCurrentProjectFolder(event.data.folder);
                    break;
                case 'current-qorus-instance':
                    this.props.setCurrentQorusInstance(event.data.qorus_instance);
                    break;
            }
        });

        vscode.postMessage({ action: 'get-current-project-folder' });
    }

    t = text_id => {
        if (this.texts[text_id]) {
            return this.texts[text_id];
        }
        vscode.postMessage({
            action: 'get-text',
            text_id: text_id,
        });
        this.num_text_requests++;
    };

    render() {
        const t = this.t;
        const dict_length = Object.keys(this.texts).length;

        const Tabs = {
            Login: 'log-in',
            ProjectConfig: 'cog',
            ReleasePackage: 'cube',
            DeleteInterfaces: 'trash',
            CreateInterface: 'draw',
        };

        return (
            <>
                <Navbar fixedToTop={true}>
                    <NavbarGroup>
                        <img style={{ maxWidth: 30, maxHeight: 30, marginRight: 54 }} src={logo} />
                        {Object.keys(Tabs).map(tab_key =>
                            (tab_key !== 'Login' || this.props.login_visible) &&
                            <Button
                                minimal={true}
                                icon={Tabs[tab_key]}
                                key={tab_key}
                                active={tab_key == this.props.active_tab}
                                onClick={() => this.props.setActiveTab(tab_key)}
                                text={t(tab_key + '-buttonText')}
                                title={t(tab_key + '-buttonTitle')}
                            />
                        )}
                    </NavbarGroup>
                    <NavbarGroup align={Alignment.RIGHT} style={{ marginRight: 36 }}>
                        <NavbarDivider />
                        <HTMLTable condensed={true} className='navbar-info-table'>
                            <tr>
                                <td>{t('Project')}:</td>
                                <td><strong>{this.props.project_folder}</strong></td>
                            </tr>
                            <tr>
                                <td>{t('ActiveQorusInstance')}:</td>
                                <td>
                                    <strong>
                                        {this.props.qorus_instance ? this.props.qorus_instance.name : t('N/A')}
                                    </strong>
                                </td>
                            </tr>
                        </HTMLTable>
                    </NavbarGroup>
                </Navbar>
                <StyledApp>
                    {this.props.active_tab == 'Login' && <Login t={this.t} _={dict_length} />}
                    {this.props.active_tab == 'ProjectConfig' && <ProjectConfig t={this.t} _={dict_length} />}
                    {this.props.active_tab == 'ReleasePackage' && <ReleasePackage t={this.t} _={dict_length} />}
                    {this.props.active_tab == 'DeleteInterfaces' && <DeleteInterfaces t={this.t} _={dict_length} />}
                    {this.props.active_tab == 'CreateInterface' && <InterfaceCreator t={this.t} _={dict_length} />}
                </StyledApp>
            </>
        );
    }
}

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
        dispatch({ type: 'login_clear'});
        dispatch({ type: 'login_visible', login_visible: false });
    },
});

export const AppContainer = hot(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(App)
);
