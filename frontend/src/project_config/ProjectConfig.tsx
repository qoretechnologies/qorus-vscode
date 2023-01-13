import {
  ReqoreButton,
  ReqoreCollection,
  ReqoreContext,
  ReqoreControlGroup,
  ReqoreInput,
  ReqoreMessage,
  ReqoreSpacer,
} from '@qoretechnologies/reqore';
import { IReqoreCollectionProps } from '@qoretechnologies/reqore/dist/components/Collection';
import { IReqoreCollectionItemProps } from '@qoretechnologies/reqore/dist/components/Collection/item';
import { size } from 'lodash';
import map from 'lodash/map';
import { FunctionComponent, useContext, useState } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../App';
import Loader from '../components/Loader';
import { Messages } from '../constants/messages';
import withInitialDataConsumer from '../hocomponents/withInitialDataConsumer';
import withMessageHandler, {
  TMessageListener,
  TPostMessage,
} from '../hocomponents/withMessageHandler';
import withTextContext from '../hocomponents/withTextContext';
import Add from './add';
import Environment from './environment';

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

const StyledProjectWrapper: React.FC<IReqoreCollectionProps> = styled(ReqoreCollection)`
  opacity: ${({ changedOnDisk }) => (changedOnDisk ? 0.4 : 1)};
  pointer-events: ${({ changedOnDisk }) => (changedOnDisk ? 'none' : 'initial')};
`;

const Project: FunctionComponent<IProject> = ({
  addMessageListener,
  postMessage,
  initialData,
  t,
}) => {
  const [projectData, setProjectData] = useState<IProjectData>(null);
  const [changedOnDisk, setChangedOnDisk] = useState<boolean>(false);
  const [selectedEnvironmentForEditing, selectEnvironmentForEditing] = useState<string | undefined>(
    undefined
  );
  const [envName, setEnvName] = useState('');
  const { confirmAction } = useContext(ReqoreContext);

  useEffectOnce(() => {
    addMessageListener(Messages.CONFIG_RETURN_DATA, ({ data }) => {
      setProjectData(data);
    });

    addMessageListener(Messages.CONFIG_CHANGED_ON_DISK, () => {
      setChangedOnDisk(true);
    });

    postMessage(Messages.CONFIG_GET_DATA);
  });

  const isEnvironmentActive: (qoruses: IQorusInstance[]) => boolean = (qoruses) => {
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
    setProjectData((current: IProjectData): IProjectData => {
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
    });
  };

  const handleEnvironmentDelete: (id: number) => void = (id) => {
    // Filter the deleted instance
    setProjectData((current: IProjectData): IProjectData => {
      // Create new instance
      const newData: IProjectData = { ...current };
      // Filter the deleted instance
      newData.qorus_instances = newData.qorus_instances.filter(
        (env: IEnvironment) => env.id !== id
      );
      // Update backend data
      updateBackendData(newData);
      // Update local state
      return newData;
    });
  };

  const handleEnvironmentAdd: (name: string) => void = (name) => {
    // Filter the deleted instance
    setProjectData((current: IProjectData): IProjectData => {
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
    });
  };

  const handleInstanceSubmit: (envId: number, name: string, url: string) => void = (
    envId,
    name,
    url
  ) => {
    setProjectData((current: IProjectData): IProjectData => {
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
    });
  };

  const handleInstanceDelete: (envId: number, instanceId: number) => void = (envId, instanceId) => {
    setProjectData((current: IProjectData): IProjectData => {
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
              (qorusInstance) => qorusInstance.id !== instanceId
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
    });
  };

  const handleInstanceDataChange: (
    envId: number,
    instanceId: number,
    name: string,
    url: string,
    isOtherUrl?: boolean
  ) => void = (envId, instanceId, name, url, isOtherUrl) => {
    setProjectData((current: IProjectData): IProjectData => {
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
    });
  };

  const handleUrlDelete: (
    envId: number,
    instanceId: number,
    name: string,
    url: string,
    isOtherUrl?: boolean
  ) => void = (envId, instanceId, name) => {
    setProjectData((current: IProjectData): IProjectData => {
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
                  newInstance.urls = newInstance.urls.filter((url) => url.name !== name);
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
    });
  };

  const handleSetInstanceActive: (url: string, set: boolean) => void = (url, set = true) => {
    // Set / unset the active instance
    postMessage(set ? Messages.SET_ACTIVE_INSTANCE : Messages.UNSET_ACTIVE_INSTANCE, {
      url,
    });
  };

  const updateBackendData: (data: IProjectData) => void = (data) => {
    // Update the data on the backend
    postMessage(Messages.CONFIG_UPDATE_DATA, {
      data,
    });
  };

  const { qorus_instance } = initialData;

  return (
    <>
      <StyledWrapper>
        {changedOnDisk && (
          <ReqoreMessage intent="warning" title={t('ConfigChangedOnDisk')} inverted>
            <div>
              {t('ConfigChangedOnDiskDialogQuestion')}
              <ReqoreSpacer height={10} />
              <ReqoreControlGroup stack>
                <ReqoreButton
                  icon="Edit2Line"
                  intent="warning"
                  onClick={() => {
                    updateBackendData(projectData);
                    setChangedOnDisk(false);
                  }}
                >
                  {t('Overwrite')}
                </ReqoreButton>
                <ReqoreButton
                  icon="RefreshLine"
                  intent="warning"
                  onClick={() => {
                    postMessage(Messages.CONFIG_GET_DATA);
                    setChangedOnDisk(false);
                  }}
                >
                  {t('Reload')}
                </ReqoreButton>
              </ReqoreControlGroup>
            </div>
          </ReqoreMessage>
        )}
        {!projectData ? (
          <Loader text="Loading..." />
        ) : (
          <StyledProjectWrapper
            //@ts-expect-error
            changedOnDisk={changedOnDisk}
            flat
            opacity={0}
            label={`Environments`}
            badge={size(projectData.qorus_instances)}
            headerSize={1}
            minColumnWidth="500px"
            filterable
            fill
            sortable
            actions={[
              {
                as: Add,
                props: {
                  onSubmit: handleEnvironmentAdd,
                  id: 'new-environment',
                  minimal: false,
                  big: true,
                  text: 'Add new environment',
                },
              },
            ]}
            items={map(
              projectData.qorus_instances,
              (data): IReqoreCollectionItemProps => ({
                icon: 'ServerLine',
                intent: isEnvironmentActive(data.qoruses) ? 'info' : undefined,
                badge: size(data.qoruses),
                label:
                  selectedEnvironmentForEditing && selectedEnvironmentForEditing === data.name ? (
                    <ReqoreControlGroup stack>
                      <ReqoreInput
                        value={envName}
                        // @ts-ignore
                        name="environment-edit-input"
                        onClearClick={() => setEnvName('')}
                        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                          setEnvName(event.target.value)
                        }
                        onKeyUp={(event: React.KeyboardEvent) => {
                          if (event.key === 'Enter') {
                            handleEnvironmentNameChange(data.id, envName);
                            selectEnvironmentForEditing(undefined);
                          }
                        }}
                      />
                      <ReqoreButton
                        icon="CheckLine"
                        onClick={() => {
                          handleEnvironmentNameChange(data.id, envName);
                          selectEnvironmentForEditing(undefined);
                        }}
                        intent="success"
                      />
                      <ReqoreButton
                        icon="CloseLine"
                        onClick={() => selectEnvironmentForEditing(undefined)}
                      />
                    </ReqoreControlGroup>
                  ) : (
                    `${data.name}`
                  ),
                actions: [
                  {
                    label: t('Edit'),
                    icon: 'Edit2Line',
                    onClick: () => {
                      setEnvName(data.name);
                      selectEnvironmentForEditing(data.name);
                    },
                  },
                  {
                    label: t('Delete'),
                    icon: 'DeleteBinLine',
                    onClick: () => {
                      confirmAction({
                        title: t('DeleteEnvironment'),
                        description: t('ConfirmRemoveEnv'),
                        onConfirm: () => handleEnvironmentDelete(data.id),
                      });
                    },
                  },
                ],
                content: (
                  <Environment
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
                ),
              })
            )}
          />
        )}
      </StyledWrapper>
    </>
  );
};

export default compose(withTextContext(), withMessageHandler(), withInitialDataConsumer())(Project);
