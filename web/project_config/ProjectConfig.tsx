import React, { Component, FunctionComponent, useState } from 'react';
import { connect } from 'react-redux';
import { Intent, Radio, RadioGroup, Tabs, Tab } from '@blueprintjs/core';
import { Envs } from './Environments';
import { Qoruses } from './Qoruses';
import { Urls } from './Urls';
import { SourceDirs } from './SourceDirs';
import { MessageDialog } from '../common/MessageDialog';
import { vscode } from '../common/vscode';
import Box from '../components/Box';
import compose from 'recompose/compose';
import withTextContext from '../hocomponents/withTextContext';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../hocomponents/withMessageHandler';
import { TTranslator } from '../App';
import { Messages } from '../constants/messages';
import styled from 'styled-components';
import map from 'lodash/map';
import EnvironmentPanel from './environment';
import Add from './add';

export interface IProject {
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
    initialData: {
        path: string;
    };
}

export interface IQorusInstance {
    id: number;
    name: string;
    url: string;
    urls: string[];
}

export interface IEnvironment {
    id: number;
    name: string;
    qoruses: IQorusInstance[];
}

export interface IProjectData {
    qorus_instances: IEnvironment[];
    source_directories: string[];
}

const StyledProjectWrapper = styled.div`
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;
    overflow: hidden auto;
    padding: 10px;
`;

const StyledMasonryWrapper = styled.div`
    column-count: 2;
    column-gap: 10px;
`;

const Project: FunctionComponent<IProject> = ({ addMessageListener, postMessage, initialData }) => {
    const [projectData, setProjectData] = useState<IProjectData>(null);
    const [activeInstance, setActiveInstance] = useState<{ name: string; url: string } | null>(null);

    useEffectOnce(() => {
        addMessageListener(Messages.CONFIG_RETURN_DATA, ({ data }) => {
            console.log(data);
            setProjectData(data);
        });

        addMessageListener(Messages.SET_QORUS_INSTANCE, ({ qorus_instance }) => {
            setActiveInstance(qorus_instance);
        });

        postMessage(Messages.CONFIG_GET_DATA);
    });

    const isEnvironmentActive: (qoruses: IQorusInstance[]) => boolean = qoruses => {
        // Check if there is any active instance
        if (!activeInstance) {
            return false;
        }
        // Return true if there is an instance with the same name
        return !!qoruses.find((qorus: IQorusInstance) => qorus.name === activeInstance.name);
    };

    const handleEnvironmentNameChange: (id: number, newName: string) => void = (id, newName) => {
        // Change the name of the environment
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Change the name
                newData.qorus_instances = newData.qorus_instances.reduce(
                    (newEnvs: IEnvironment[], qorusEnv: IEnvironment): IEnvironment[] => {
                        // Create new instance
                        const newInstance: IEnvironment = { ...qorusEnv };
                        // Check if the id matches
                        if (id === qorusEnv.id) {
                            // Change the name
                            newInstance.name = newName;
                        }
                        // Return new data
                        return [...newEnvs, newInstance];
                    },
                    []
                );
                // Update backend data
                updateBackendData(newData);
                // Update local state
                return newData;
            }
        );
    };

    const handleEnvironmentDelete: (id: number) => void = id => {
        // Filter the deleted instance
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Filter the deleted instance
                newData.qorus_instances = newData.qorus_instances.filter((env: IEnvironment) => env.id !== id);
                // Update backend data
                updateBackendData(newData);
                // Update local state
                return newData;
            }
        );
    };

    const handleEnvironmentAdd: (name: string) => void = name => {
        // Filter the deleted instance
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Filter the deleted instance
                newData.qorus_instances.push({
                    id: newData.qorus_instances.length,
                    name,
                    qoruses: [],
                });
                // Update backend data
                updateBackendData(newData);
                // Update local state
                return newData;
            }
        );
    };

    const updateBackendData: (data: IProjectData) => void = data => {
        // Update the data on the backend
        postMessage(Messages.CONFIG_UPDATE_DATA, {
            data,
        });
    };

    if (!projectData) {
        return <p>Loading...</p>;
    }

    return (
        <StyledProjectWrapper>
            <Add onSubmit={handleEnvironmentAdd} />
            <StyledMasonryWrapper>
                {map(projectData.qorus_instances, data => (
                    <EnvironmentPanel
                        {...data}
                        path={initialData.path}
                        active={isEnvironmentActive(data.qoruses)}
                        onEnvironmentNameChange={handleEnvironmentNameChange}
                        onEnvironmentDeleteClick={handleEnvironmentDelete}
                    />
                ))}
            </StyledMasonryWrapper>
        </StyledProjectWrapper>
    );
};

export default compose(
    withTextContext(),
    withMessageHandler(),
    withInitialDataConsumer()
)(Project);

/*class ProjectConfig extends Component {
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
                action: 'config-get-data',
            });
        }
    }

    onConfigTypeChange = ev => {
        this.props.setConfigType(ev.target.value);
    };

    selectEnv = env_id => {
        this.props.setSelectedEnv(env_id);
        this.props.setSelectedQorus(null);
    };

    selectQorus = qorus_id => {
        this.props.setSelectedQorus(qorus_id);
    };

    removeSourceDir = dir => {
        vscode.postMessage({
            action: 'config-remove-dir',
            dir: dir,
        });
    };

    addSourceDir = () => {
        vscode.postMessage({
            action: 'config-add-dir',
        });
    };

    render() {
        if (!this.props.data) {
            return null;
        }

        const { t, initialData } = this.props;

        const selected_env_id = this.props.selected_env_id;
        const selected_qorus_id = this.props.selected_qorus_id;
        const selected_env = selected_env_id !== null ? this.props.data.qorus_instances[selected_env_id] : null;
        const selected_qorus = selected_qorus_id !== null ? selected_env.qoruses[selected_qorus_id] : null;

        const ConfigChangedOnDiskMsg = (
            <MessageDialog
                isOpen={this.props.config_changed_msg_open}
                text={t('ConfigChangedOnDiskDialogQuestion')}
                buttons={[
                    {
                        title: t('ButtonReload'),
                        intent: Intent.WARNING,
                        onClick: () => {
                            vscode.postMessage({
                                action: 'config-get-data',
                            });
                            this.props.setConfigChangedMsgOpen(false);
                        },
                    },
                    {
                        title: t('ButtonOverwrite'),
                        intent: Intent.PRIMARY,
                        onClick: () => {
                            vscode.postMessage({
                                action: 'config-update-data',
                                data: this.props.data,
                            });
                            this.props.setConfigChangedMsgOpen(false);
                        },
                    },
                ]}
            />
        );

        return (
            <>
                {ConfigChangedOnDiskMsg}
                <Tabs
                    id="ProjectConfigTabs"
                    onChange={newTabId => {
                        initialData.changeTab('ProjectConfig', newTabId);
                    }}
                    selectedTabId={initialData.subtab || 'qoruses'}
                    renderActiveTabPanelOnly
                >
                    <Tab
                        id="qoruses"
                        title={t('QorusInstances')}
                        panel={
                            <div className="config-container">
                                <Envs
                                    data={this.props.data.qorus_instances}
                                    selected_env_id={selected_env_id}
                                    onSelect={this.selectEnv}
                                    onEdit={this.updateQorusInstancesData.bind(this)}
                                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-env')}
                                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-env-up')}
                                />
                                <Qoruses
                                    selected_env={selected_env}
                                    selected_qorus_id={selected_qorus_id}
                                    onSelect={this.selectQorus}
                                    onEdit={this.updateQorusInstancesData.bind(this)}
                                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-qorus')}
                                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-qorus-up')}
                                />
                                <Urls
                                    env_id={selected_env_id}
                                    selected_qorus={selected_qorus}
                                    onEdit={this.updateQorusInstancesData.bind(this)}
                                    onRemove={this.updateQorusInstancesData.bind(this, 'remove-url')}
                                    onMoveUp={this.updateQorusInstancesData.bind(this, 'move-url-up')}
                                />
                            </div>
                        }
                    />
                    <Tab
                        id="sources"
                        title={t('SourceDirs')}
                        panel={
                            <SourceDirs
                                data={this.props.data.source_directories}
                                addSourceDir={this.addSourceDir}
                                removeSourceDir={this.removeSourceDir}
                            />
                        }
                    />
                </Tabs>
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
                    qoruses: [],
                });
                break;
            case 'remove-env':
                index = values.env_id;
                data.splice(index, 1);
                if (this.props.selected_env_id == index) {
                    this.props.setSelectedEnv(null);
                    this.props.setSelectedQorus(null);
                } else if (this.props.selected_env_id > index) {
                    this.props.setSelectedEnv(this.props.selected_env_id - 1);
                }
                resetIds(data, index);
                break;
            case 'move-env-up':
                index = values.env_id;
                data[index - 1] = data.splice(index, 1, data[index - 1])[0];
                if (this.props.selected_env_id == index) {
                    this.props.setSelectedEnv(index - 1);
                } else if (this.props.selected_env_id == index - 1) {
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
                    urls: [],
                });
                break;
            case 'remove-qorus':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses.splice(index, 1);
                if (this.props.selected_qorus_id == index) {
                    this.props.setSelectedQorus(null);
                } else if (this.props.selected_qorus_id > index) {
                    this.props.setSelectedQorus(this.props.selected_qorus_id - 1);
                }
                resetIds(qoruses, index);
                break;
            case 'move-qorus-up':
                qoruses = data[values.env_id].qoruses;
                index = values.qorus_id;
                qoruses[index - 1] = qoruses.splice(index, 1, qoruses[index - 1])[0];
                if (this.props.selected_qorus_id == index) {
                    this.props.setSelectedQorus(index - 1);
                } else if (this.props.selected_qorus_id == index - 1) {
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
                    url: values.url,
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
                urls[index - 1] = urls.splice(index, 1, urls[index - 1])[0];
                resetIds(urls, index - 1);
                break;
        }

        const all_data = {
            qorus_instances: data,
            source_directories: this.props.data.source_directories,
        };

        this.props.setData(all_data);

        vscode.postMessage({
            action: 'config-update-data',
            data: all_data,
        });
    }
}

const mapStateToProps = state => ({
    config_type: state.config_type,
    data: state.config_data,
    selected_env_id: state.config_selected_env,
    selected_qorus_id: state.config_selected_qorus,
    config_changed_msg_open: state.msg_open.config_changed,
});

const mapDispatchToProps = dispatch => ({
    setData: data => dispatch({ type: 'config_data', config_data: data }),
    setSelectedEnv: selected_env_id => dispatch({ type: 'config_selected_env', config_selected_env: selected_env_id }),
    setSelectedQorus: selected_qorus_id =>
        dispatch({ type: 'config_selected_qorus', config_selected_qorus: selected_qorus_id }),
    setConfigType: config_type => dispatch({ type: 'config_type', config_type }),
    setConfigChangedMsgOpen: open => dispatch({ type: 'config_changed_msg_open', open }),
});

export default compose(
    connect(
        mapStateToProps,
        mapDispatchToProps
    ),
    withTextContext(),
    withInitialDataConsumer()
)(ProjectConfig);*/
