import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Intent, Radio, RadioGroup } from '@blueprintjs/core';
import { Envs } from './Environments';
import { Qoruses } from './Qoruses';
import { Urls } from './Urls';
import { SourceDirs } from './SourceDirs';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';


class ProjectConfig extends Component {
    constructor() {
        super();

        window.addEventListener('message', event => {
            switch (event.data.action) {
                case 'config-return-data':
                    this.props.setData(event.data.data);
                    this.props.setSelectedQorus(null);
                    this.props.setSelectedEnv(null);
                    break;
                case 'config-changed-on-disk':
                    this.props.setConfigChangedMsgOpen(true);
                    break;
            }
        });
    }

    componentDidMount() {
        if (!this.props.data) {
            vscode.postMessage({
                action: 'config-get-data'
            });
        }
    }

    onConfigTypeChange = ev => {
        this.props.setConfigType(ev.target.value);
    }

    selectEnv = (env_id) => {
        this.props.setSelectedEnv(env_id);
        this.props.setSelectedQorus(null);
    }

    selectQorus = (qorus_id) => {
        this.props.setSelectedQorus(qorus_id);
    }

    removeSourceDir = dir => {
        vscode.postMessage({
            action: 'config-remove-dir',
            dir: dir
        });
    }

    addSourceDir = () => {
        vscode.postMessage({
            action: 'config-add-dir'
        });
    }

    render() {
        if (!this.props.data) {
            return null;
        }

        const t = this.props.t;

        const selected_env_id = this.props.selected_env_id;
        const selected_qorus_id = this.props.selected_qorus_id;
        const selected_env = (selected_env_id !== null) ? this.props.data.qorus_instances[selected_env_id] : null;
        const selected_qorus = (selected_qorus_id !== null) ? selected_env.qoruses[selected_qorus_id] : null;

        const ConfigChangedOnDiskMsg =
            <MessageDialog isOpen={this.props.config_changed_msg_open}
                text={t('ConfigChangedOnDiskDialogQuestion')}
                buttons={[{
                    title: t('ButtonReload'),
                    intent: Intent.WARNING,
                    onClick: () => {
                        vscode.postMessage({
                            action: 'config-get-data',
                        });
                        this.props.setConfigChangedMsgOpen(false);
                    }
                },
                {
                    title: t('ButtonOverwrite'),
                    intent: Intent.PRIMARY,
                    onClick: () => {
                        vscode.postMessage({
                            action: 'config-update-data',
                            data: this.props.data
                        });
                        this.props.setConfigChangedMsgOpen(false);
                    }
                }]}
            />;

        const QorusInstances =
            <div className='config-container'>
                <Envs t={t}
                    data={this.props.data.qorus_instances}
                    selected_env_id={selected_env_id}
                    onSelect={this.selectEnv}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-env')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-env-up')} />
                <Qoruses t={t}
                    selected_env={selected_env}
                    selected_qorus_id={selected_qorus_id}
                    onSelect={this.selectQorus}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-qorus')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-qorus-up')} />
                <Urls t={t}
                    env_id={selected_env_id}
                    selected_qorus={selected_qorus}
                    onEdit={this.updateQorusInstancesData.bind(this)}
                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-url')}
                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-url-up')} />
            </div>;

        return (
            <>
                {ConfigChangedOnDiskMsg}

                <div className='fg-color navbar-offset flex-start'>
                    <RadioGroup style={{ marginTop: 18 }}
                        onChange={this.onConfigTypeChange}
                        selectedValue={this.props.config_type}
                        inline={true}
                        className='config-type-radio-group'
                    >
                        <Radio label={t('QorusInstances')} value='qoruses' />
                        <Radio label={t('SourceDirs')} value='sources' />
                    </RadioGroup>
                </div>

                <hr style={{ marginBottom: 12 }} />

                {this.props.config_type == 'qoruses' && QorusInstances}
                {this.props.config_type == 'sources' &&
                    <SourceDirs
                        data={this.props.data.source_directories}
                        addSourceDir={this.addSourceDir}
                        removeSourceDir={this.removeSourceDir}
                        t={t}
                    />
                }
            </>
        );
    }

    updateQorusInstancesData(action, values) {
        let data = JSON.parse(JSON.stringify(this.props.data.qorus_instances));
        let index, env, qorus, qoruses, url, urls;

        const resetIds = (array, index) => {
            for (let i = index; i < array.length; i++) {
                array[i].id = i;
            }
        };

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
                if (this.props.selected_env_id == index) {
                    this.props.setSelectedEnv(null);
                    this.props.setSelectedQorus(null);
                }
                else if (this.props.selected_env_id > index) {
                    this.props.setSelectedEnv(this.props.selected_env_id - 1);
                }
                resetIds(data, index);
                break;
            case 'move-env-up':
                index = values.env_id;
                data[index-1] = data.splice(index, 1, data[index-1])[0]
                if (this.props.selected_env_id == index) {
                    this.props.setSelectedEnv(index - 1);
                }
                else if (this.props.selected_env_id == index - 1) {
                    this.props.setSelectedEnv(index);
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
                if (this.props.selected_qorus_id == index) {
                    this.props.setSelectedQorus(null);
                }
                else if (this.props.selected_qorus_id > index) {
                    this.props.setSelectedQorus(this.props.selected_qorus_id - 1);
                }
                resetIds(qoruses, index);
                break;
            case 'move-qorus-up':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses[index-1] = qoruses.splice(index, 1, qoruses[index-1])[0]
                if (this.props.selected_qorus_id == index) {
                    this.props.setSelectedQorus(index - 1);
                }
                else if (this.props.selected_qorus_id == index - 1) {
                    this.props.setSelectedQorus(index);
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
            source_directories: this.props.data.source_directories
        };

        this.props.setData(all_data);

        vscode.postMessage({
            action: 'config-update-data',
            data: all_data
        });
    }
}

const mapStateToProps = (state) => ({
    config_type: state.config_type,
    data: state.config_data,
    selected_env_id: state.config_selected_env,
    selected_qorus_id: state.config_selected_qorus,
    config_changed_msg_open: state.msg_open.config_changed
});

const mapDispatchToProps = dispatch => ({
    setData: data => dispatch({type: 'config_data', config_data: data}),
    setSelectedEnv: selected_env_id => dispatch({type: 'config_selected_env',
                                                 config_selected_env: selected_env_id}),
    setSelectedQorus: selected_qorus_id => dispatch({type: 'config_selected_qorus',
                                                     config_selected_qorus: selected_qorus_id}),
    setConfigType: config_type => dispatch({type: 'config_type', config_type}),
    setConfigChangedMsgOpen: open => dispatch({type: 'config_changed_msg_open', open})
});

export const ProjectConfigContainer = connect(mapStateToProps, mapDispatchToProps)(ProjectConfig);
