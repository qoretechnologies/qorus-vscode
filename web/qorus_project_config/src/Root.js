import React, { Component } from 'react';
import { Intent } from '@blueprintjs/core';
import { Envs } from './Environments';
import { Qoruses } from './Qoruses';
import { Urls } from './Urls';
import { MessageDialog } from './MessageDialog';
import { texts } from './global';
import logo from '../../../images/qorus_logo_256.png';
const vscode = acquireVsCodeApi();


export class Root extends Component {
    constructor() {
        super();

        let state = vscode.getState();
        if (state) {
            global.texts = state.texts;
            this.state = {
                data: state.data,
                selected_env_id: state.selected_env_id,
                selected_qorus_id: state.selected_qorus_id,
                isMessageDialogOpen: false
            };
        }
        else {
            this.state = {
                data: null,
                selected_env_id: null,
                selected_qorus_id: null
            };
        }

        this.message_params = {
            text: null,
            buttons: null
        }

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'get-data':
                    global.texts = event.data.texts,
                    this.setVscodeState({texts: global.texts});
                    this.setStates({
                        data: event.data.data,
                        selected_env_id: null,
                        selected_qorus_id: null
                    });
                    break;
                case 'config-changed-on-disk':
                    this.setMessage({
                        text: global.texts.configChangedOnDisk,
                        buttons: [
                            {
                                title: global.texts.buttonReload,
                                intent: Intent.WARNING,
                                onClick: () => {
                                    vscode.postMessage({
                                        action: 'get-data',
                                    });
                                    this.setState({isMessageDialogOpen: false});
                                }
                            },
                            {
                                title: global.texts.buttonOverwrite,
                                intent: Intent.PRIMARY,
                                onClick: () => {
                                    vscode.postMessage({
                                        action: 'update-data',
                                        data: this.state.data
                                    });
                                    this.setState({isMessageDialogOpen: false});
                                }
                            }
                        ]
                    });
                    break;
            }
        });
    }

    setMessage = (params) => {
        this.message_params = params;
        this.setState({isMessageDialogOpen: true});
    }

    setVscodeState(state) {
        vscode.setState(Object.assign(vscode.getState() || {}, state));
    }

    setStates(state) {
        this.setVscodeState(state);
        this.setState(state);
    }

    componentWillMount() {
        if (this.state.data) {
            return;
        }
        vscode.postMessage({
            action: 'get-data'
        });
    }

    selectEnv = (env_id) => {
        this.setStates({
            selected_env_id: env_id,
            selected_qorus_id: null
        });
    }

    selectQorus = (qorus_id) => {
        this.setStates({selected_qorus_id: qorus_id});
    }

    handleMessageDialogClose = () => {
        this.setState({isMessageDialogOpen: false});
    }

    render() {
        if (!this.state.data) {
            return null;
        }

        let selected_env_id = this.state.selected_env_id;
        let selected_qorus_id = this.state.selected_qorus_id;
        let selected_env = (selected_env_id !== null) ? this.state.data[selected_env_id] : null;
        let selected_qorus = (selected_qorus_id !== null) ? selected_env.qoruses[selected_qorus_id] : null;

        return (
            <div>
                <MessageDialog isOpen={this.state.isMessageDialogOpen}
                               params={this.message_params}
                               onClose={this.handleMessageDialogClose} />

                <div className='config-container'>
                    <img style={{ maxWidth: '36px', maxHeight: '36px'}} src={logo} />
                </div>

                <div className='config-container'>
                    <Envs data={this.state.data}
                            selected_env_id={selected_env_id}
                            onSelect={this.selectEnv}
                            onEdit={this.updateData.bind(this)}
                            onRemove={this.updateData.bind(this, 'remove-env')}
                            onMoveUp={this.updateData.bind(this, 'move-env-up')} />
                    <Qoruses selected_env={selected_env}
                            selected_qorus_id={selected_qorus_id}
                            onSelect={this.selectQorus}
                            onEdit={this.updateData.bind(this)}
                            onRemove={this.updateData.bind(this, 'remove-qorus')}
                            onMoveUp={this.updateData.bind(this, 'move-qorus-up')} />
                    <Urls env_id={selected_env_id}
                            selected_qorus={selected_qorus}
                            onEdit={this.updateData.bind(this)}
                            onRemove={this.updateData.bind(this, 'remove-url')}
                            onMoveUp={this.updateData.bind(this, 'move-url-up')} />
                </div>
            </div>
        );
    }

    updateData(action, values) {
        let data = JSON.parse(JSON.stringify(this.state.data));
        let index, env, qorus, qoruses, url, urls;

        let resetIds = ((array, index) => {
            for (let i = index; i < array.length; i++) {
                array[i].id = i;
            }
        });

        switch (action) {
            case 'edit-env':
                env = data[values.env_id];
                env.name = values.name;
                break;
            case 'add-env':
                data.push({
                    id: data.length,
                    name: values.name,
                    qoruses: []
                });
                break;
            case 'remove-env':
                index = values.env_id;
                data.splice(index, 1);
                if (this.state.selected_env_id == index) {
                    this.setStates({selected_env_id: null, selected_qorus_id: null});
                }
                else if (this.state.selected_env_id > index) {
                    this.setStates({selected_env_id: this.state.selected_env_id - 1});
                }
                resetIds(data, index);
                break;
            case 'move-env-up':
                index = values.env_id;
                data[index-1] = data.splice(index, 1, data[index-1])[0]
                if (this.state.selected_env_id == index) {
                    this.setStates({selected_env_id: index - 1})
                }
                else if (this.state.selected_env_id == index - 1) {
                    this.setStates({selected_env_id: index})
                }
                resetIds(data, index - 1);
                break;
            case 'edit-qorus':
                qorus = data[values.env_id].qoruses[values.qorus_id];
                qorus.name = values.name;
                qorus.url = values.url;
                break;
            case 'add-qorus':
                qoruses = data[values.env_id].qoruses;
                qoruses.push({
                    id: qoruses.length,
                    name: values.name,
                    url: values.url,
                    urls: []
                });
                break;
            case 'remove-qorus':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses.splice(index, 1);
                if (this.state.selected_qorus_id == index) {
                    this.setStates({selected_qorus_id: null});
                }
                else if (this.state.selected_qorus_id > index) {
                    this.setStates({selected_qorus_id: this.state.selected_qorus_id - 1});
                }
                resetIds(qoruses, index);
                break;
            case 'move-qorus-up':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses[index-1] = qoruses.splice(index, 1, qoruses[index-1])[0]
                if (this.state.selected_qorus_id == index) {
                    this.setStates({selected_qorus_id: index - 1})
                }
                else if (this.state.selected_qorus_id == index - 1) {
                    this.setStates({selected_qorus_id: index})
                }
                resetIds(qoruses, index - 1);
                break;
            case 'edit-main-url':
                qorus = data[values.env_id].qoruses[values.qorus_id];
                qorus.url = values.url;
                break;
            case 'edit-url':
                url = data[values.env_id].qoruses[values.qorus_id].urls[values.url_id];
                url.name = values.name;
                url.url = values.url;
                break;
            case 'add-url':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                urls.push({
                    id: urls.length,
                    name: values.name,
                    url: values.url
                });
                break;
            case 'remove-url':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                index = values.url_id;
                urls.splice(index, 1);
                resetIds(urls, index);
                break;
            case 'move-url-up':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                index = values.url_id;
                urls[index-1] = urls.splice(index, 1, urls[index-1])[0]
                resetIds(urls, index - 1);
                break;
        }

        this.setStates({data: data});

        vscode.postMessage({
            action: 'update-data',
            data: data
        });
    }
}
