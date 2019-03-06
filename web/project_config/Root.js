import React, { Component } from 'react';
import { Intent, Radio, RadioGroup } from '@blueprintjs/core';
import { Envs } from './Environments';
import { Qoruses } from './Qoruses';
import { Urls } from './Urls';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';
import { T } from '../common/Translate';
import logo from '../../images/qorus_logo_256.png';


export class Root extends Component {
    constructor() {
        super();

        const state = vscode.getState();
        if (state) {
            this.state = {
                data: state.data,
                selected_env_id: state.selected_env_id,
                selected_qorus_id: state.selected_qorus_id,
                config_type: state.config_type,
                config_changed_on_disk_msg_open: state.config_changed_on_disk_msg_open
            };
        }
        else {
            this.state = {
                data: null,
                selected_env_id: null,
                selected_qorus_id: null,
                config_type: 'qoruses',
                config_changed_on_disk_msg_open: false
            };
            this.setVscodeState(this.state);
        }

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'return-data':
                    this.setStates({
                        data: event.data.data,
                        selected_env_id: null,
                        selected_qorus_id: null
                    });
                    break;
                case 'config-changed-on-disk':
                    this.setStates({config_changed_on_disk_msg_open: true});
                    break;
            }
        });
    }

    setVscodeState(state) {
        vscode.setState(Object.assign(vscode.getState() || {}, state));
    }

    setStates(state) {
        this.setVscodeState(state);
        this.setState(state);
    }

    componentDidMount() {
        if (this.state.data) {
            return;
        }
        vscode.postMessage({
            action: 'get-data'
        });
    }

    onConfigTypeChange = ev => {
        this.setStates({config_type: ev.target.value});
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
        this.setState({config_changed_on_disk_msg_open: false});
    }

    render() {
        if (!this.state.data) {
            return null;
        }

        const selected_env_id = this.state.selected_env_id;
        const selected_qorus_id = this.state.selected_qorus_id;
        const selected_env = (selected_env_id !== null) ? this.state.data.qorus_instances[selected_env_id] : null;
        const selected_qorus = (selected_qorus_id !== null) ? selected_env.qoruses[selected_qorus_id] : null;

        const ConfigChangedOnDiskMsg =
            <MessageDialog isOpen={this.state.config_changed_on_disk_msg_open}
                onClose={this.handleMessageDialogClose}
                text=<T t='ConfigChangedOnDiskDialogQuestion' />
                buttons={[{
                    title: <T t='ButtonReload' />,
                    intent: Intent.WARNING,
                    onClick: () => {
                        vscode.postMessage({
                            action: 'get-data',
                        });
                        this.setState({config_changed_on_disk_msg_open: false});
                    }
                },
                {
                    title: <T t='ButtonOverwrite' />,
                    intent: Intent.PRIMARY,
                    onClick: () => {
                        vscode.postMessage({
                            action: 'update-data',
                            data: this.state.data
                        });
                        this.setState({config_changed_on_disk_msg_open: false});
                    }
                }]}
            />;

        const QorusInstances =
            <div className='config-container'>
                <Envs
                    data={this.state.data.qorus_instances}
                    selected_env_id={selected_env_id}
                    onSelect={this.selectEnv}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-env')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-env-up')} />
                <Qoruses
                    selected_env={selected_env}
                    selected_qorus_id={selected_qorus_id}
                    onSelect={this.selectQorus}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-qorus')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-qorus-up')} />
                <Urls
                    env_id={selected_env_id}
                    selected_qorus={selected_qorus}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-url')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-url-up')} />
            </div>;

        const SourceDirs =
            <ul>
                {this.state.data.source_directories.map(dir => <li>dir</li>)}
            </ul>;

        return (
            <>
                {ConfigChangedOnDiskMsg}

                <div className='flex-start'>
                    <div>
                        <img style={{ maxWidth: 36, maxHeight: 36, margin: '15px 0 -18px 9px' }} src={logo} />
                    </div>
                    <div style={{ margin: '24px 0 0 54px' }}>
                        <RadioGroup
                            onChange={this.onConfigTypeChange}
                            selectedValue={this.state.config_type}
                            inline={true}
                        >
                            <Radio label=<T t='QorusInstances' /> value='qoruses' />
                            <Radio label=<T t='SourceDirs' /> value='sources' />
                        </RadioGroup>
                    </div>
                </div>

                <hr style={{ margin: '12px 0 8px'}} />

                {this.state.config_type == 'qoruses' && QorusInstances}
                {this.state.config_type == 'sources' && SourceDirs}
            </>
        );
    }

    updateQorusInstancesData(action, values) {
        let data = JSON.parse(JSON.stringify(this.state.data.qorus_instances));
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

        const all_data = {
            qorus_instances: data,
            source_directories: this.state.data.source_directories
        };

        this.setStates({data: all_data});

        vscode.postMessage({
            action: 'update-data',
            data: all_data
        });
    }
}
