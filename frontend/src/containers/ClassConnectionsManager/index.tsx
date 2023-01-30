import {
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
  ReqoreMessage,
  useReqoreTheme,
} from '@qoretechnologies/reqore';
import { cloneDeep } from 'lodash';
import every from 'lodash/every';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import Content from '../../components/Content';
import CustomDialog from '../../components/CustomDialog';
import { NegativeColorEffect, SaveColorEffect } from '../../components/Field/multiPair';
import String from '../../components/Field/string';
import { ContentWrapper, FieldWrapper, IField } from '../../components/FieldWrapper';
import Loader from '../../components/Loader';
import SidePanel from '../../components/SidePanel';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { areConnectorsCompatible } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler, { TMessageListener } from '../../hocomponents/withMessageHandler';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import TinyGrid from '../../images/graphy-dark.png';
import { resetControl, submitControl } from '../InterfaceCreator/controls';
import { StyledCompatibilityLoader } from '../InterfaceCreator/fsm';
import { MethodSelector } from '../InterfaceCreator/servicesView';
import ClassConnectionsDiagram from './diagram';

export const StyledDialogBody = styled.div`
  padding: 20px 20px 0 20px;
  margin: 0;
  display: flex;
  height: 100%;
  width: 100%;
`;

export interface IClassConnections {
  [key: string]: IClassConnection[];
}

export interface IClassConnection {
  class?: string;
  prefix?: string;
  connector?: string;
  mapper?: string;
  trigger?: string;
  isLast?: boolean;
  index?: number;
  isEditing?: boolean;
  id: number;
  [key: string]: any;
}

export interface IClassConnectionsManageDialog {
  isOpen?: boolean;
  name?: string;
}

export interface IClassConnectionsManagerProps {
  classes: any[];
  t: TTranslator;
  initialData: any;
  initialConnections?: IClassConnections;
  onSubmit: (classConnections: IClassConnections) => void;
  addMessageListener: TMessageListener;
  postMessage;
  ifaceType: string;
  baseClassName?: string;
  interfaceContext?: string;
}

export interface IClassConnectionsDraftData {
  connections: IClassConnections;
  classesData: any;
  lastConnectorId: number;
  lastConnectionId: number;
}

const getConnectorsCount = (connections) => {
  if (connections) {
    let count = 0;

    forEach(connections, (conn) => {
      count += size(conn);
    });
    return count;
  }

  return 1;
};

const ClassConnectionsManager: React.FC<IClassConnectionsManagerProps> = ({
  t,
  initialData,
  initialConnections,
  onSubmit,
  addMessageListener,
  postMessage,
  ifaceType,
  baseClassName,
  selectedFields,
  interfaceContext,
  interfaceIndex,
  onClose,
}) => {
  const [connections, setConnections] = useState<IClassConnections>(
    cloneDeep(initialConnections || {})
  );
  const [selectedConnection, setSelectedConnection] = useState(null);
  const [classesData, setClassesData] = useState(null);
  const [manageDialog, setManageDialog] = useState<IClassConnectionsManageDialog>({});
  const [lastConnectorId, setLastConnectorId] = useState<number>(
    getConnectorsCount(initialConnections)
  );
  const [lastConnectionId, setLastConnectionId] = useState<number>(
    initialConnections ? size(initialConnections) : 0
  );
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState<boolean>(false);
  const classes = selectedFields[ifaceType][interfaceIndex].find(
    (field: IField) => field.name === 'classes'
  ).value;
  const initContext = useContext(InitialContext);
  const theme = useReqoreTheme();

  // Get the classes data
  useMount(() => {
    // Listen for the classes data
    addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
      if (data.iface_kind === 'class') {
        // Add the class data
        setClassesData((current) => ({
          ...current,
          [data.class.name]: data.class,
        }));
      }
    });
    // Request data for each class
    classes.forEach((classData) => {
      const splitClass = classData.name.split(':');
      const className = splitClass[1] || splitClass[0];
      // Request the data
      postMessage(Messages.GET_INTERFACE_DATA, {
        iface_kind: 'class',
        name: className,
      });
    });
  });

  const setClassConnectionsFromDraft = (connectionsData: IClassConnectionsDraftData) => {
    setConnections(connectionsData.connections);
    setLastConnectorId(connectionsData.lastConnectorId);
    setLastConnectionId(connectionsData.lastConnectionId);
    setClassesData(connectionsData.classesData);
  };

  const checkConnectionCompatibility = async (connection: IClassConnection[]) => {
    setIsCheckingCompatibility(true);

    const data = [...connection];
    const newData = [];

    for await (const [index, connData] of data.entries()) {
      connData.previousItemData = data[index - 1];
      connData.nextItemData = data[index + 1];

      const isInputCompatible = await areConnectorsCompatible(
        'input',
        connData.connector,
        connData
      );
      const isOutputCompatible = await areConnectorsCompatible(
        'output',
        connData.connector,
        connData
      );

      newData[index] = {
        ...connData,
        isInputCompatible,
        isOutputCompatible,
      };
    }

    setIsCheckingCompatibility(false);

    return newData;
  };

  useEffect(() => {
    if (selectedConnection) {
      (async () => {
        const newData = await checkConnectionCompatibility(connections[selectedConnection]);
        setConnections((cur) => ({
          ...cur,
          [selectedConnection]: newData,
        }));
      })();
    }
  }, [selectedConnection]);

  const handleAddConnector: (
    name: string,
    data: IClassConnection,
    changedConnector?: boolean
  ) => void = async (name, data, changedConnector) => {
    let modifiedConnection: IClassConnection[] =
      !data.index && data.index !== 0
        ? [{ ...data, id: lastConnectorId }]
        : connections[name].reduce((newConnectors, connector, index) => {
            // Check if the index matches the passed index
            if (index === data.index) {
              if (data.isEditing) {
                if (changedConnector) {
                  // Replace the current data and remove the mapper
                  return [...newConnectors, omit({ ...connector, ...data }, ['mapper'])];
                }
                // Replace data without removing the mapper
                return [...newConnectors, { ...connector, ...data }];
              }
              const id = lastConnectorId;
              // Add new connector
              return [...newConnectors, connector, { ...data, id }];
            }
            // If the user changed connector, we need to remove
            // the mapper from the actual connector and from the connector
            // before
            if (changedConnector && index === data.index - 1) {
              return [...newConnectors, omit({ ...connector }, ['mapper'])];
            }
            // Return unchanged
            return [...newConnectors, connector];
          }, []);

    modifiedConnection = await checkConnectionCompatibility(modifiedConnection);

    setConnections((cur) => ({
      ...cur,
      [name]: modifiedConnection,
    }));

    if (!data.isEditing) {
      // Increase the ID
      setLastConnectorId((current) => current + 1);
    }
  };

  const handleDeleteConnector: (name: string, id: number) => void = async (name, id) => {
    let modifiedConnection: IClassConnection[] = connections[name].reduce(
      (newConnectors, connector, index) => {
        // Check if the index matches the passed index
        if (index === id) {
          // Add new connector
          return [...newConnectors];
        }
        // Return unchanged
        return [...newConnectors, connector];
      },
      []
    );

    modifiedConnection = await checkConnectionCompatibility(modifiedConnection);

    setConnections(
      (current: IClassConnections): IClassConnections => ({
        ...current,
        [name]: modifiedConnection,
      })
    );
  };

  const isConnectionValid = (name: string) => {
    let isValid = true;

    // Check if any of the item is incompatible
    for (const [name, conn] of Object.entries(connections)) {
      conn.forEach((connData) => {
        if (connData.isInputCompatible === false || connData.isOutputCompatible === false) {
          isValid = false;
          return;
        }
      });
    }

    if (connections[name].length === 0) {
      isValid = false;
    }
    // Check if there is only one connector
    // and has a trigger
    if (connections[name].length === 1 && !connections[name][0].trigger) {
      isValid = false;
    }

    // Check if the name is proper
    if (!validateField('string', name, { has_to_be_valid_identifier: true })) {
      isValid = false;
    }

    return isValid;
  };

  const areAllConnectionsValid = () => {
    return size(connections) === 0 || every(connections, (_conn, name) => isConnectionValid(name));
  };

  const getUniqueClasses = () => {
    const uniqClasses = {};
    classes.forEach((classData) => {
      const splitClass = classData.name.split(':');
      const className = splitClass[1] || splitClass[0];
      uniqClasses[className] = {};
    });
    return size(uniqClasses);
  };

  return (
    <CustomDialog
      isOpen
      label={t('ClassConnectionsManager')}
      onClose={onClose}
      contentStyle={{
        display: 'flex',
      }}
      bottomActions={[
        resetControl(() => {
          setConnections(initialConnections || {});
          setSelectedConnection(null);
        }),
        submitControl(() => onSubmit(connections), {
          disabled: !areAllConnectionsValid(),
        }),
      ]}
    >
      {size(classesData) !== getUniqueClasses() ? (
        <Loader text="Loading..." />
      ) : (
        <>
          {manageDialog.isOpen && (
            <CustomDialog
              label={t('AddConnection')}
              isOpen
              onClose={() => setManageDialog({})}
              bottomActions={[
                {
                  effect: NegativeColorEffect,
                  label: t('Remove'),
                  icon: 'DeleteBinLine',
                  onClick: () => {
                    initContext.confirmAction('ConfirmRemoveConnection', () => {
                      setConnections((current) => {
                        if (selectedConnection === manageDialog.name) {
                          setSelectedConnection(null);
                        }
                        const result = { ...current };
                        delete result[manageDialog.name];
                        // Check if there are any connections left
                        if (!size(result)) {
                          // reset the ID
                          setLastConnectionId(1);
                        }
                        return result;
                      });
                    });
                  },
                },
                {
                  effect: !validateField('string', manageDialog.newName, {
                    has_to_be_valid_identifier: true,
                  })
                    ? NegativeColorEffect
                    : SaveColorEffect,
                  position: 'right',
                  label: t('Submit'),
                  icon: 'CheckLine',
                  disabled:
                    !validateField('string', manageDialog.newName, {
                      has_to_be_valid_identifier: true,
                    }) || !!connections[manageDialog.newName],
                  onClick: () => {
                    setConnections((current: IClassConnections): IClassConnections => {
                      const result = reduce(
                        current,
                        (newConnections, connection, connName) => {
                          // If the connection matches the old name
                          if (connName === manageDialog.name) {
                            // Replace the connection
                            return {
                              ...newConnections,
                              [manageDialog.newName]: connection,
                            };
                          }
                          // Return unchanged
                          return {
                            ...newConnections,
                            [connName]: connection,
                          };
                        },
                        {}
                      );

                      return result;
                    });

                    setManageDialog({});
                    setSelectedConnection(manageDialog.newName);
                  },
                },
              ]}
            >
              <FieldWrapper
                label="Name"
                compact
                isValid={validateField('string', manageDialog.newName, {
                  has_to_be_valid_identifier: true,
                })}
              >
                <String
                  name="connection"
                  placeholder={t('Name')}
                  value={manageDialog.newName}
                  onChange={(_fieldName, value) =>
                    setManageDialog((current) => ({
                      ...current,
                      newName: value.replace(/ /g, ''),
                    }))
                  }
                />
              </FieldWrapper>
            </CustomDialog>
          )}
          <SidePanel>
            <ReqoreMenu width="250px">
              <ReqoreMenuDivider label={`${t('Connections')} (${size(connections)})`} />
              <ReqoreMenuItem
                icon="AddLine"
                onClick={() => {
                  setConnections(
                    (current: IClassConnections): IClassConnections => ({
                      ...current,
                      [`${t('Connection')}_${lastConnectionId + 1}`]: [],
                    })
                  );
                  setSelectedConnection(`${t('Connection')}_${lastConnectionId + 1}`);
                  setLastConnectionId((cur) => cur + 1);
                }}
              >
                {t('AddConnection')}
              </ReqoreMenuItem>
              {size(connections) === 0 && (
                <ReqoreMessage intent="muted">No connections added</ReqoreMessage>
              )}
              {map(connections, (connection, name: string) => (
                <MethodSelector
                  key={name}
                  selected={name === selectedConnection}
                  isValid={isConnectionValid(name)}
                  onClick={() => setSelectedConnection(name)}
                  onRemoveClick={() => setManageDialog({ isOpen: true, name, newName: name })}
                  rightIcon="EditLine"
                >
                  {name}
                </MethodSelector>
              ))}
            </ReqoreMenu>
          </SidePanel>
          <Content>
            <ContentWrapper
              style={{
                background: `${theme.main} url(${TinyGrid})`,
                padding: '10px',
              }}
            >
              {isCheckingCompatibility ? (
                <StyledCompatibilityLoader>
                  <Loader text={t('CheckingCompatibility')} />
                </StyledCompatibilityLoader>
              ) : (
                <div
                  style={{
                    width: '100%',
                    display: 'flex',
                    flex: '1 1 auto',
                    justifyContent: 'center',
                  }}
                >
                  {selectedConnection ? (
                    <ClassConnectionsDiagram
                      t={t}
                      classes={classes}
                      classesData={classesData}
                      onAddConnector={handleAddConnector}
                      onDeleteConnector={handleDeleteConnector}
                      connection={connections[selectedConnection]}
                      connectionName={selectedConnection}
                      ifaceType={ifaceType}
                      baseClassName={baseClassName}
                      interfaceContext={interfaceContext}
                    />
                  ) : (
                    <ReqoreMessage title={t('NoConnectionSelected')} icon="NodeTree">
                      {t('NoConnectionSelectedDescription')}
                    </ReqoreMessage>
                  )}
                </div>
              )}
            </ContentWrapper>
          </Content>
        </>
      )}
    </CustomDialog>
  );
};

export default compose(
  withMessageHandler(),
  withInitialDataConsumer(),
  withTextContext(),
  withMethodsConsumer(),
  withFieldsConsumer()
)(ClassConnectionsManager);
