import React, { FunctionComponent, useState } from 'react';
import { Button, Popover, Icon, ButtonGroup, Callout, Position } from '@blueprintjs/core';
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
import SourceDirsDialog from './sourceDirs';
import Loader from '../components/Loader';

export interface IProject {
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
    initialData: {
        path: string;
        tab: string;
        subtab: string;
        qorus_instance: { name: string; url: string } | null;
    };
}

export interface IQorusInstance {
    id: number;
    name: string;
    url: string;
    safe_url: string;
    urls: { name: string; url: string; safe_url: string }[];
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

const StyledWrapper = styled.div`
    flex: 1 1 auto;
    padding: 10px;
    overflow: auto;
`;

const StyledProjectWrapper = styled.div`
    display: flex;
    flex-flow: column;
    flex: 1 1 auto;
    overflow: hidden auto;
    padding-top: 10px;

    opacity: ${({ changedOnDisk }) => (changedOnDisk ? 0.4 : 1)};
    pointer-events: ${({ changedOnDisk }) => (changedOnDisk ? 'none' : 'initial')};
`;

const StyledProjectHeader = styled.div`
    display: flex;
    flex-flow: row wrap;
    justify-content: space-between;
`;

const StyledMasonryWrapper = styled.div`
    column-count: 2;
    column-gap: 10px;
    margin-top: 10px;
`;

const Project: FunctionComponent<IProject> = ({ addMessageListener, postMessage, initialData, t }) => {
    const [projectData, setProjectData] = useState<IProjectData>(null);
    const [changedOnDisk, setChangedOnDisk] = useState<boolean>(false);
    const [isDirsDialogOpen, setIsDirsDialogOpen] = useState<boolean>(false);

    useEffectOnce(() => {
        addMessageListener(Messages.CONFIG_RETURN_DATA, ({ data }) => {
            setProjectData(data);
        });

        addMessageListener(Messages.CONFIG_CHANGED_ON_DISK, () => {
            setChangedOnDisk(true);
        });

        postMessage(Messages.CONFIG_GET_DATA);
    });

    const isEnvironmentActive: (qoruses: IQorusInstance[]) => boolean = qoruses => {
        const { qorus_instance } = initialData;
        // Check if there is any active instance
        if (!qorus_instance) {
            return false;
        }
        // Return true if there is an instance with the same name
        return !!qoruses.find((qorus: IQorusInstance) => qorus.name === qorus_instance.name);
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

    const handleInstanceSubmit: (envId: number, name: string, url: string) => void = (envId, name, url) => {
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
                        if (envId === qorusEnv.id) {
                            // Change the name
                            newInstance.qoruses.push({
                                id: newInstance.qoruses.length,
                                name,
                                url,
                                safe_url: url,
                                urls: [],
                            });
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

    const handleInstanceDelete: (envId: number, instanceId: number) => void = (envId, instanceId) => {
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
                        if (envId === qorusEnv.id) {
                            // Filter out the deleted instance
                            newInstance.qoruses = newInstance.qoruses.filter(
                                qorusInstance => qorusInstance.id !== instanceId
                            );
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

    const handleInstanceDataChange: (
        envId: number,
        instanceId: number,
        name: string,
        url: string,
        isOtherUrl?: boolean
    ) => void = (envId, instanceId, name, url, isOtherUrl) => {
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Change the name
                newData.qorus_instances = newData.qorus_instances.reduce(
                    (newEnvs: IEnvironment[], qorusEnv: IEnvironment): IEnvironment[] => {
                        // Create new instance
                        const newEnv: IEnvironment = { ...qorusEnv };
                        // Check if the id matches
                        if (envId === qorusEnv.id) {
                            // Filter out the deleted instance
                            newEnv.qoruses = newEnv.qoruses.reduce(
                                (newInstances: IQorusInstance[], instance: IQorusInstance): IQorusInstance[] => {
                                    // Copy the instance
                                    const newInstance: IQorusInstance = { ...instance };
                                    // Check if the ID matches
                                    if (newInstance.id === instanceId) {
                                        // Check if this is main URL
                                        if (!isOtherUrl) {
                                            // Change the data
                                            newInstance.name = name;
                                            newInstance.url = url;
                                        } else {
                                            // Add the new url
                                            newInstance.urls.push({
                                                name,
                                                url,
                                                safe_url: url,
                                            });
                                        }
                                    }
                                    // Return new instances
                                    return [...newInstances, newInstance];
                                },
                                []
                            );
                        }
                        // Return new data
                        return [...newEnvs, newEnv];
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

    const handleUrlDelete: (
        envId: number,
        instanceId: number,
        name: string,
        url: string,
        isOtherUrl?: boolean
    ) => void = (envId, instanceId, name) => {
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Change the name
                newData.qorus_instances = newData.qorus_instances.reduce(
                    (newEnvs: IEnvironment[], qorusEnv: IEnvironment): IEnvironment[] => {
                        // Create new instance
                        const newEnv: IEnvironment = { ...qorusEnv };
                        // Check if the id matches
                        if (envId === qorusEnv.id) {
                            // Filter out the deleted instance
                            newEnv.qoruses = newEnv.qoruses.reduce(
                                (newInstances: IQorusInstance[], instance: IQorusInstance): IQorusInstance[] => {
                                    // Copy the instance
                                    const newInstance: IQorusInstance = { ...instance };
                                    // Check if the ID matches
                                    if (newInstance.id === instanceId) {
                                        // Remove the URL
                                        newInstance.urls = newInstance.urls.filter(url => url.name !== name);
                                    }
                                    // Return new instances
                                    return [...newInstances, newInstance];
                                },
                                []
                            );
                        }
                        // Return new data
                        return [...newEnvs, newEnv];
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

    const handleAddDirectory: (dirs: string) => void = dirs => {
        // Filter the deleted instance
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Add new directory
                newData.source_directories = [...dirs];
                // Update backend data
                updateBackendData(newData);
                // Update local state
                return newData;
            }
        );
    };

    const handleDeleteDirectory: (name: string) => void = name => {
        // Filter the deleted instance
        setProjectData(
            (current: IProjectData): IProjectData => {
                // Create new instance
                const newData: IProjectData = { ...current };
                // Remove directory
                newData.source_directories = newData.source_directories.filter(dir => dir !== name);
                // Update backend data
                updateBackendData(newData);
                // Update local state
                return newData;
            }
        );
    };

    const handleSetInstanceActive: (url: string, set: boolean) => void = (url, set = true) => {
        // Set / unset the active instance
        postMessage(set ? Messages.SET_ACTIVE_INSTANCE : Messages.UNSET_ACTIVE_INSTANCE, {
            url,
        });
    };

    const updateBackendData: (data: IProjectData) => void = data => {
        // Update the data on the backend
        postMessage(Messages.CONFIG_UPDATE_DATA, {
            data,
        });
    };

    const { qorus_instance } = initialData;

    return (
        <>
            {isDirsDialogOpen && (
                <SourceDirsDialog
                    onSubmitClick={handleAddDirectory}
                    onDeleteClick={handleDeleteDirectory}
                    onClose={() => setIsDirsDialogOpen(false)}
                />
            )}
            <StyledWrapper>
                {changedOnDisk && (
                    <Callout intent="warning" title={t('ConfigChangedOnDisk')}>
                        <p>{t('ConfigChangedOnDiskDialogQuestion')}</p>
                        <ButtonGroup>
                            <Button
                                icon="edit"
                                intent="warning"
                                text={t('Overwrite')}
                                onClick={() => {
                                    updateBackendData(projectData);
                                    setChangedOnDisk(false);
                                }}
                            />
                            <Button
                                icon="refresh"
                                intent="warning"
                                text={t('Reload')}
                                onClick={() => {
                                    postMessage(Messages.CONFIG_GET_DATA);
                                    setChangedOnDisk(false);
                                }}
                            />
                        </ButtonGroup>
                    </Callout>
                )}
                {!projectData ? (
                    <Loader text="Loading..." />
                ) : (
                    <StyledProjectWrapper changedOnDisk={changedOnDisk}>
                        <StyledProjectHeader>
                            <Add
                                onSubmit={handleEnvironmentAdd}
                                id="new-environment"
                                minimal={false}
                                big
                                text={t('AddNewEnvironment')}
                            />

                            <Button
                                icon="folder-new"
                                text={t('ManageSourceDirectories')}
                                onClick={() => setIsDirsDialogOpen(true)}
                                name="manage-source-dirs"
                            />
                        </StyledProjectHeader>
                        <StyledMasonryWrapper>
                            {map(projectData.qorus_instances, data => (
                                <EnvironmentPanel
                                    {...data}
                                    path={initialData.path}
                                    image_path={initialData.image_path}
                                    active={isEnvironmentActive(data.qoruses)}
                                    activeInstance={qorus_instance && qorus_instance.name}
                                    onEnvironmentNameChange={handleEnvironmentNameChange}
                                    onEnvironmentDeleteClick={handleEnvironmentDelete}
                                    onInstanceSubmit={handleInstanceSubmit}
                                    onInstanceDelete={handleInstanceDelete}
                                    onInstanceChange={handleInstanceDataChange}
                                    onUrlSubmit={handleInstanceDataChange}
                                    onUrlDelete={handleUrlDelete}
                                    onSetActiveInstanceClick={handleSetInstanceActive}
                                />
                            ))}
                        </StyledMasonryWrapper>
                    </StyledProjectWrapper>
                )}
            </StyledWrapper>
        </>
    );
};

export default compose(withTextContext(), withMessageHandler(), withInitialDataConsumer())(Project);
