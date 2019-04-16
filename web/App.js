import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Button, Navbar, NavbarGroup } from '@blueprintjs/core';
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
                    console.log('set-active-tab');
                    this.props.setActiveTab(event.data.active_tab);
                    break;
            }
        });
    }

    componentDidMount() {
        const state = vscode.getState();
        console.log('vscode.getState(): ' + JSON.stringify(state, null, 4));
        if (state) {
            this.props.setActiveTab(state.active_tab);
        }
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
        if (!this.texts) {
            return null;
        }

        const t = this.t;

        const Tabs = {
            'ProjectConfig': 'cog',
            'QorusRelease': 'cube',
            'DeleteInterfaces': 'trash',
            'CreateInterface': 'draw'
        };

        return (
            <>
                <Navbar fixedToTop={true}>
                    <NavbarGroup>
                        <img style={{ maxWidth: 30, maxHeight: 30, marginRight: 54 }} src={logo} />
                        {Object.keys(Tabs).map(tab_key =>
                            <Button minimal={true} icon={Tabs[tab_key]} key={tab_key}
                                active={tab_key == this.props.active_tab}
                                onClick={() => this.props.setActiveTab(tab_key)}
                                text={t(tab_key + '-buttonText')} title={t(tab_key + '-buttonTitle')}
                            />
                        )}
                    </NavbarGroup>
                </Navbar>

                {this.props.active_tab == 'DeleteInterfaces' && <DeleteInterfaces /> }
            </>
        );
    }
}

const mapStateToProps = state => ({ active_tab: state.active_tab });

const mapDispatchToProps = dispatch => ({
    setActiveTab: tab_key => {dispatch({type: 'active_tab', active_tab: tab_key});}
});

export const AppContainer = connect(mapStateToProps, mapDispatchToProps)(App);
