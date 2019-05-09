import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Navbar, NavbarGroup } from '@blueprintjs/core';
import { LoginContainer as Login } from './login/Login';
import { ProjectConfigContainer as ProjectConfig } from './project_config/ProjectConfig';
import { ReleasePackageContainer as ReleasePackage } from './release_package/ReleasePackage';
import { DeleteInterfacesContainer as DeleteInterfaces } from './delete_interfaces/DeleteInterfaces';
import { vscode } from './common/vscode';
import logo from '../images/qorus_logo_256.png';


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
                    break;
            }
        });
    }

    t = text_id => {
        if (this.texts[text_id]) {
            return this.texts[text_id];
        }
        vscode.postMessage({
            action: 'get-text',
            text_id: text_id
        });
        this.num_text_requests++;
    }

    render() {
        const t = this.t;
        const dict_length = Object.keys(this.texts).length;

        const Tabs = {
            Login: 'log-in',
            ProjectConfig: 'cog',
            ReleasePackage: 'cube',
            DeleteInterfaces: 'trash',
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
                </Navbar>
                {this.props.active_tab == 'Login' && <Login t={this.t} _={dict_length} />}
                {this.props.active_tab == 'ProjectConfig' && <ProjectConfig t={this.t} _={dict_length} />}
                {this.props.active_tab == 'ReleasePackage' && <ReleasePackage t={this.t} _={dict_length} />}
                {this.props.active_tab == 'DeleteInterfaces' && <DeleteInterfaces t={this.t} _={dict_length} />}
            </>
        );
    }
}

const mapStateToProps = state => ({
    active_tab: state.active_tab_queue[0],
    login_visible: state.login_visible,
});

const mapDispatchToProps = dispatch => ({
    setActiveTab: tab_key => { dispatch({ type: 'set_active_tab', active_tab: tab_key }); },
    openLogin: () => {
        dispatch({ type: 'login_visible', login_visible: true });
    },
    closeLogin: () => {
        dispatch({ type: 'close_tab', tab: 'Login' });
        dispatch({ type: 'login_clear'});
        dispatch({ type: 'login_visible', login_visible: false });
    },
});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);
