import React, { useState } from 'react';
import withMessageHandler, { TMessageListener } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import SidePanel from '../../components/SidePanel';
import { ContentWrapper, ActionsWrapper, IField } from '../InterfaceCreator/panel';
import { MethodSelector, Selected, RemoveButton } from '../InterfaceCreator/servicesView';
import { ButtonGroup, Button, Dialog, ControlGroup, Classes, NonIdealState } from '@blueprintjs/core';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import forEach from 'lodash/forEach';
import size from 'lodash/size';
import omit from 'lodash/omit';
import compose from 'recompose/compose';
import { PanelWrapper } from '../InterfaceCreator/servicesView';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import String from '../../components/Field/string';
import styled from 'styled-components';
import { validateField } from '../../helpers/validations';
import ClassConnectionsDiagram from './diagram';
import { TTranslator } from '../../App';
import Content from '../../components/Content';
import every from 'lodash/every';
import useMount from 'react-use/lib/useMount';
import { Messages } from '../../constants/messages';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import Loader from '../../components/Loader';

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
}

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
}) => {
    const getConnectorsCount = connections => {
        if (connections) {
            let count = 0;

            forEach(connections, conn => {
                count += size(conn);
            });
            return count;
        }

        return 1;
    };

    const [connections, setConnections] = useState<IClassConnections>(initialConnections || {});
    const [selectedConnection, setSelectedConnection] = useState(null);
    const [classesData, setClassesData] = useState(null);
    const [manageDialog, setManageDialog] = useState<IClassConnectionsManageDialog>({});
    const [lastConnectorId, setLastConnectorId] = useState<number>(getConnectorsCount(initialConnections));
    const [lastConnectionId, setLastConnectionId] = useState<number>(initialConnections ? size(initialConnections) : 0);
    const classes = selectedFields[ifaceType].find((field: IField) => field.name === 'classes').value;

    // Get the classes data
    useMount(() => {
        // Listen for the classes data
        addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
            if (data.iface_kind === 'class') {
                // Add the class data
                setClassesData(current => ({
                    ...current,
                    [data.class.name]: data.class,
                }));
            }
        });
        // Request data for each class
        classes.forEach(classData => {
            const splitClass = classData.name.split(':');
            const className = splitClass[1] || splitClass[0];
            // Request the data
            postMessage(Messages.GET_INTERFACE_DATA, {
                iface_kind: 'class',
                class_name: className,
            });
        });
    });

    const handleAddConnector: (name: string, data: IClassConnection, changedConnector?: boolean) => void = (
        name,
        data,
        changedConnector
    ) => {
        setConnections(
            (current: IClassConnections): IClassConnections => ({
                ...current,
                [name]:
                    !data.index && data.index !== 0
                        ? [{ ...data, id: lastConnectorId }]
                        : current[name].reduce((newConnectors, connector, index) => {
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
                          }, []),
            })
        );
        if (!data.isEditing) {
            // Increase the ID
            setLastConnectorId(current => current + 1);
        }
    };

    const handleDeleteConnector: (name: string, id: number) => void = (name, id) => {
        setConnections(
            (current: IClassConnections): IClassConnections => ({
                ...current,
                [name]: current[name].reduce((newConnectors, connector, index) => {
                    // Check if the index matches the passed index
                    if (index === id) {
                        // Add new connector
                        return [...newConnectors];
                    }
                    // If this is the previous connector
                    // or the connector after
                    // remove the mapper, since the relations
                    // are no longer valid
                    if (index === id - 1 || index === id + 1) {
                        // Remove the mapper
                        return [...newConnectors, omit(connector, ['mapper'])];
                    }
                    // Return unchanged
                    return [...newConnectors, connector];
                }, []),
            })
        );
    };

    const isConnectionValid = (name: string) => {
        if (connections[name].length > 1) {
            return true;
        }
        // Check if there is only one connector
        // and has a trigger
        if (connections[name].length === 1) {
            return !!connections[name][0].trigger;
        }

        return false;
    };

    const areAllConnectionsValid = () => {
        return size(connections) === 0 || every(connections, (_conn, name) => isConnectionValid(name));
    };

    const getUniqueClasses = () => {
        const uniqClasses = {};
        classes.forEach(classData => {
            const splitClass = classData.name.split(':');
            const className = splitClass[1] || splitClass[0];
            uniqClasses[className] = {};
        });
        return size(uniqClasses);
    };

    // Check if all classes are loaded
    if (size(classesData) !== getUniqueClasses()) {
        return <Loader text="Loading..." />;
    }

    return (
        <>
            <Dialog title={t('AddConnection')} isOpen={manageDialog.isOpen} onClose={() => setManageDialog({})}>
                <StyledDialogBody>
                    <ControlGroup fill>
                        <String
                            name="connection"
                            placeholder={t('Name')}
                            value={manageDialog.newName}
                            onChange={(fieldName, value) =>
                                setManageDialog(current => ({ ...current, newName: value }))
                            }
                        />
                        <Button
                            intent="success"
                            text={t('Submit')}
                            icon="small-tick"
                            disabled={
                                !validateField('string', manageDialog.newName) || !!connections[manageDialog.newName]
                            }
                            onClick={() => {
                                setConnections(
                                    (current: IClassConnections): IClassConnections => {
                                        const result = reduce(
                                            current,
                                            (newConnections, connection, connName) => {
                                                // If the connection matches the old name
                                                if (connName === manageDialog.name) {
                                                    // Replace the connection
                                                    return { ...newConnections, [manageDialog.newName]: connection };
                                                }
                                                // Return unchanged
                                                return { ...newConnections, [connName]: connection };
                                            },
                                            {}
                                        );

                                        return result;
                                    }
                                );

                                setManageDialog({});
                                setSelectedConnection(manageDialog.newName);
                            }}
                        />
                    </ControlGroup>
                </StyledDialogBody>
            </Dialog>
            <PanelWrapper style={{ padding: '20px 20px 0 20px', margin: 0 }}>
                <SidePanel title={t('AddClassConnectionsTitle')}>
                    <ContentWrapper>
                        {size(connections) === 0 && <p className={Classes.TEXT_MUTED}>No connections added</p>}
                        {map(connections, (connection, name: string) => (
                            <MethodSelector
                                key={name}
                                active={name === selectedConnection}
                                valid={isConnectionValid(name)}
                                onClick={() => setSelectedConnection(name)}
                            >
                                {name}
                                <ButtonGroup>
                                    <Button
                                        icon="edit"
                                        minimal
                                        onClick={() => setManageDialog({ isOpen: true, name, newName: name })}
                                    />
                                    <Button
                                        icon="trash"
                                        minimal
                                        onClick={event => {
                                            event.stopPropagation();

                                            setConnections(current => {
                                                if (selectedConnection === name) {
                                                    setSelectedConnection(null);
                                                }
                                                const result = { ...current };
                                                delete result[name];
                                                // Check if there are any connections left
                                                if (!size(result)) {
                                                    // reset the ID
                                                    setLastConnectionId(1);
                                                }
                                                return result;
                                            });
                                        }}
                                    />
                                </ButtonGroup>
                            </MethodSelector>
                        ))}
                    </ContentWrapper>
                    <ActionsWrapper>
                        <ButtonGroup fill>
                            <Button
                                text={t('AddConnection')}
                                icon={'plus'}
                                onClick={() => {
                                    setConnections(
                                        (current: IClassConnections): IClassConnections => ({
                                            ...current,
                                            [`${t('Connection')}_${lastConnectionId + 1}`]: [],
                                        })
                                    );
                                    setSelectedConnection(`${t('Connection')}_${lastConnectionId + 1}`);
                                    setLastConnectionId(cur => cur + 1);
                                }}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </SidePanel>
                <Content>
                    <ContentWrapper
                        style={{
                            background: `url(${
                                process.env.NODE_ENV === 'development'
                                    ? `http://localhost:9876/images/tiny_grid.png`
                                    : `vscode-resource:${initialData.path}/images/tiny_grid.png)`
                            }`,
                            padding: 10,
                        }}
                    >
                        <div style={{ width: '100%', display: 'flex', flex: '1 1 auto', justifyContent: 'center' }}>
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
                                />
                            ) : (
                                <NonIdealState
                                    title={t('NoConnectionSelected')}
                                    description={t('NoConnectionSelectedDescription')}
                                    icon="diagram-tree"
                                />
                            )}
                        </div>
                    </ContentWrapper>
                    <ActionsWrapper>
                        <ButtonGroup fill>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
                                    setConnections(initialConnections || {});
                                    setSelectedConnection(null);
                                }}
                            />
                            <Button
                                text={t('Submit')}
                                icon={'small-tick'}
                                intent="success"
                                disabled={!areAllConnectionsValid()}
                                onClick={() => onSubmit(connections)}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </Content>
            </PanelWrapper>
        </>
    );
};

export default compose(
    withMessageHandler(),
    withInitialDataConsumer(),
    withTextContext(),
    withMethodsConsumer(),
    withFieldsConsumer()
)(ClassConnectionsManager);
