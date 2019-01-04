import React, { Component } from 'react';
import { Envs } from './Environments';
import { Qoruses } from './Qoruses';
import { Urls } from './Urls';
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
                selected_qorus_id: state.selected_qorus_id
            };
        }
        else {
            this.state = {
                data: null,
                selected_env_id: undefined,
                selected_qorus_id: undefined
            };
        }

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'get-data':
                    global.texts = event.data.texts,
                    this.setVscodeState({texts: global.texts});
                    this.setStates({
                        data: event.data.data,
                        selected_env_id: undefined,
                        selected_qorus_id: undefined
                    });
                    break;
                case 'config-changed-on-disk':
                    $('#config_changed_on_disk').modal({show: true});
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

    componentWillMount() {
        if (this.state.data) {
            return;
        }
        vscode.postMessage({
            action: 'get-data'
        });
    }

    componentDidMount() {
        let me = this;
        $('form.change_config').submit(function(event) {
            event.preventDefault();
            me.updateData(
                $('#action').val(),
                {
                    env_id: $('#env_id').val(),
                    qorus_id: $('#qorus_id').val(),
                    url_id: $('#url_id').val(),
                    name: $('#name').val(),
                    url: $('#url').val()
                }
            );
        });
        $('#reload').click(() => {
            vscode.postMessage({
                action: 'get-data'
            });
        });
        $('#overwrite').click(() => {
            vscode.postMessage({
                action: 'update-data',
                data: me.state.data
            });
        });
    }

    selectEnv(env_id) {
        this.setStates({
            selected_env_id: env_id,
            selected_qorus_id: undefined
        });
    }

    selectQorus(qorus_id) {
        this.setStates({selected_qorus_id: qorus_id});
    }

    render() {
        if (!this.state.data) {
            return null;
        }

        let selected_env_id = this.state.selected_env_id;
        let selected_qorus_id = this.state.selected_qorus_id;
        let selected_env = (selected_env_id !== undefined) ? this.state.data[selected_env_id] : undefined;
        let selected_qorus = (selected_qorus_id !== undefined) ? selected_env.qoruses[selected_qorus_id] : undefined;

        return (
            <div>
                <div className='config-container'>
                    <img style={{ maxWidth: '36px', maxHeight: '36px'}} src={logo} />
                </div>
                <div className='config-container'>
                    <Envs data={this.state.data}
                            selected_env_id={selected_env_id}
                            onSelect={this.selectEnv.bind(this)}
                            onEdit={this.updateData.bind(this)}
                            onRemove={this.updateData.bind(this, 'remove-env')}
                            onMoveUp={this.updateData.bind(this, 'move-env-up')} />
                    <Qoruses selected_env={selected_env}
                            selected_qorus_id={selected_qorus_id}
                            onSelect={this.selectQorus.bind(this)}
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

        let can_close = true;
        let checkNonempty = ((key, value) => {
            value = value.trim();
            if (!value) {
                can_close = false;
                $('#' + key).addClass('bg-warning').attr('placeholder', global.texts.mandatoryInput);
            }
            return value;
        });

        switch (action) {
            case 'edit-env':
                env = data[values.env_id];
                env.name = checkNonempty('name', values.name);
                break;
            case 'add-env':
                data.push({
                    id: data.length,
                    name: checkNonempty('name', values.name),
                    qoruses: []
                });
                break;
            case 'remove-env':
                index = values.env_id;
                data.splice(index, 1);
                if (this.state.selected_env_id == index) {
                    this.setStates({selected_env_id: undefined, selected_qorus_id: undefined});
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
                qorus.name = checkNonempty('name', values.name);
                qorus.url = checkNonempty('name', values.url);
                break;
            case 'add-qorus':
                qoruses = data[values.env_id].qoruses;
                qoruses.push({
                    id: qoruses.length,
                    name: checkNonempty('name', values.name),
                    url: checkNonempty('url', values.url),
                    urls: []
                });
                break;
            case 'remove-qorus':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses.splice(index, 1);
                if (this.state.selected_qorus_id == index) {
                    this.setStates({selected_qorus_id: undefined});
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
                qorus.url = checkNonempty('url', values.url);
                break;
            case 'edit-url':
                url = data[values.env_id].qoruses[values.qorus_id].urls[values.url_id];
                url.name = checkNonempty('name', values.name);
                url.url = checkNonempty('url', values.url);
                break;
            case 'add-url':
                urls = data[values.env_id].qoruses[values.qorus_id].urls;
                urls.push({
                    id: urls.length,
                    name: values.name,
                    url: checkNonempty('url', values.url)
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

        if (!can_close) {
            return;
        }

        $('.config_modal').modal('hide');

        this.setStates({data: data});

        vscode.postMessage({
            action: 'update-data',
            data: data
        });

        $('.form-control').removeClass('bg-warning').removeAttr('placeholder');
    }
}
