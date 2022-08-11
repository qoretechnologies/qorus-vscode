import { Button, ButtonGroup, Callout, ControlGroup, Icon, Tooltip } from '@blueprintjs/core';
import omit from 'lodash/omit';
import size from 'lodash/size';
import React, { useContext, useEffect, useState } from 'react';
import { useMount } from 'react-use';
import compose from 'recompose/compose';
import styled, { css } from 'styled-components';
import { TTranslator } from '../../App';
import Content from '../../components/Content';
import CustomDialog from '../../components/CustomDialog';
import SelectField from '../../components/Field/select';
import FieldLabel from '../../components/FieldLabel';
import {
  ActionsWrapper,
  ContentWrapper,
  FieldInputWrapper,
  FieldWrapper,
} from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { areConnectorsCompatible } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, {
  postMessage,
  TMessageListener,
  TPostMessage,
} from '../../hocomponents/withMessageHandler';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import MapperView from '../InterfaceCreator/mapperView';
import { CompatibilityCheckIndicator } from '../InterfaceCreator/pipeline/elementDialog';
import { StyledMapperField } from '../Mapper';
import { IClassConnection, StyledDialogBody } from './index';

export interface IClassConnectionsDiagramProps {
  connection: IClassConnection[];
  t: TTranslator;
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  onAddConnector: (name: string, data: IClassConnection, changedConnector?: boolean) => void;
  onDeleteConnector: (name: string, id: number) => void;
  classes: any;
  connectionName: string;
}

export interface IManageDialog {
  isOpen?: boolean;
  class?: string;
  mapper?: string;
  connector?: string;
  connectorList?: any;
  isFirst?: boolean;
  isBetween?: boolean;
  isLast?: boolean;
  index?: number;
  isEditing?: boolean;
  isMapper?: boolean;
  inputProvider?: any;
  outputProvider?: any;
  trigger?: string;
  isConnectorEventType?: boolean;
  previousItemData?: any;
  nextItemData?: any;
}

export interface IConnectorProps {
  t: TTranslator;
  manageDialog: IManageDialog;
  addMessageListener: TMessageListener;
  postMessage: TPostMessage;
  setManageDialog: any;
}

const Mapper = ({
  setManageDialog,
  manageDialog,
  resetAllInterfaceData,
  setMapper,
  interfaceContext,
  handleMapperSubmitSet,
  setMapperDialog,
}) => {
  const t = useContext(TextContext);
  const initialData = useContext(InitialContext);
  const [isCompatible, setIsCompatible] = useState({
    input: false,
    output: false,
  });
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState({
    input: false,
    output: false,
  });

  useMount(() => {
    if (manageDialog.mapper) {
      (async () => {
        const { isInputCompatible, isOutputCompatible } = await checkTypes(manageDialog.mapper);

        setManageDialog((current: IManageDialog): IManageDialog => {
          const result = {
            ...current,
            isInputCompatible,
            isOutputCompatible,
          };

          return result;
        });
      })();
    }
  });

  const checkTypes = async (mapper: string) => {
    setIsCheckingCompatibility(() => ({
      input: true,
      output: true,
    }));

    const isInputCompatible = await areConnectorsCompatible('input', mapper, manageDialog, true);
    const isOutputCompatible = await areConnectorsCompatible('output', mapper, manageDialog, true);

    setIsCheckingCompatibility(() => ({
      input: false,
      output: false,
    }));

    setIsCompatible(() => ({
      input: isInputCompatible,
      output: isOutputCompatible,
    }));

    return { isInputCompatible, isOutputCompatible };
  };

  return (
    <FieldWrapper>
      <FieldLabel label={t('Mapper')} isValid />
      <FieldInputWrapper>
        {isCheckingCompatibility.input || manageDialog.mapper ? (
          <CompatibilityCheckIndicator
            isCompatible={isCompatible.input}
            isCheckingCompatibility={isCheckingCompatibility.input}
            title="PreviousOutputElement"
          />
        ) : null}
        {isCheckingCompatibility.output || manageDialog.mapper ? (
          <CompatibilityCheckIndicator
            isCompatible={isCompatible.output}
            isCheckingCompatibility={isCheckingCompatibility.output}
            title="NextInputElement"
          />
        ) : null}
        <ControlGroup fill>
          <SelectField
            get_message={{
              action: 'get-mappers',
            }}
            return_message={{
              action: 'return-mappers',
              return_value: 'mappers',
            }}
            warningMessageOnEmpty={t('NoMappersMatchConnectors')}
            value={manageDialog.mapper}
            onChange={async (_name, value) => {
              const { isInputCompatible, isOutputCompatible } = await checkTypes(value);

              setManageDialog(
                (current: IManageDialog): IManageDialog => ({
                  ...current,
                  mapper: value,
                  isInputCompatible,
                  isOutputCompatible,
                })
              );
            }}
            name="class"
            fill
          />
          {manageDialog.mapper && (
            <>
              <Button
                icon="edit"
                intent="none"
                onClick={() => {
                  postMessage(Messages.GET_INTERFACE_DATA, {
                    iface_kind: 'mapper',
                    name: manageDialog.mapper,
                  });
                }}
              />
              <Button
                icon="trash"
                intent="danger"
                onClick={() => {
                  initialData.confirmAction('ConfirmRemoveMapper', () =>
                    setManageDialog((current) => ({
                      ...current,
                      mapper: null,
                    }))
                  );
                }}
              />
            </>
          )}
          {!manageDialog.mapper && (
            <Button
              icon="add"
              intent="success"
              onClick={() => {
                resetAllInterfaceData('mapper');
                setMapper({
                  isFromConnectors: true,
                  hasInitialInput: !!manageDialog.outputProvider,
                  hasInitialOutput: !!manageDialog.inputProvider,
                  context: interfaceContext,
                  mapper_options: {
                    'mapper-input': manageDialog.outputProvider,
                    'mapper-output': manageDialog.inputProvider,
                  },
                });
                handleMapperSubmitSet((mapperName, mapperVersion) => {
                  resetAllInterfaceData('mapper');
                  setIsCheckingCompatibility(() => ({
                    input: false,
                    output: false,
                  }));
                  setIsCompatible(() => ({
                    input: true,
                    output: true,
                  }));
                  setManageDialog(
                    (current: IManageDialog): IManageDialog => ({
                      ...current,
                      mapper: `${mapperName}:${mapperVersion}`,
                      isInputCompatible: true,
                      isOutputCompatible: true,
                    })
                  );
                  setMapperDialog({});
                });
                setMapperDialog({ isOpen: true });
              }}
            />
          )}
        </ControlGroup>
      </FieldInputWrapper>
    </FieldWrapper>
  );
};

const Connector: React.FC<IConnectorProps> = ({
  t,
  addMessageListener,
  postMessage,
  setManageDialog,
  manageDialog,
}) => {
  const [connectors, setConnectors] = useState([]);
  const [isCompatible, setIsCompatible] = useState({
    input: false,
    output: false,
  });
  const [isCheckingCompatibility, setIsCheckingCompatibility] = useState({
    input: false,
    output: false,
  });

  useMount(() => {
    if (manageDialog.isEditing) {
      (async () => {
        const { isInputCompatible, isOutputCompatible } = await checkTypes(manageDialog.connector);

        setManageDialog((current: IManageDialog): IManageDialog => {
          const result = {
            ...current,
            isInputCompatible,
            isOutputCompatible,
          };

          return result;
        });
      })();
    }
  });

  const checkTypes = async (connector: string) => {
    setIsCheckingCompatibility(() => ({
      input: true,
      output: true,
    }));

    const isInputCompatible = await areConnectorsCompatible('input', connector, manageDialog);
    const isOutputCompatible = await areConnectorsCompatible('output', connector, manageDialog);

    setIsCheckingCompatibility(() => ({
      input: false,
      output: false,
    }));

    setIsCompatible(() => ({
      input: isInputCompatible,
      output: isOutputCompatible,
    }));

    return { isInputCompatible, isOutputCompatible };
  };

  useEffect(() => {
    if (manageDialog.class) {
      // Reset the connectors when class changes
      setConnectors([]);

      addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
        if (data.iface_kind === 'class') {
          setConnectors(data.class?.['class-connectors'] || []);
        }
      });

      const class_name_parts = manageDialog.class.split(':'); // possibly with prefix
      const name = class_name_parts[1] || class_name_parts[0];
      postMessage(Messages.GET_INTERFACE_DATA, {
        iface_kind: 'class',
        name: name,
      });
    }
  }, [manageDialog.class]);

  return (
    <FieldWrapper>
      <FieldLabel
        label={t('Connector')}
        isValid={validateField('string', manageDialog.connector)}
      />
      <FieldInputWrapper>
        {!manageDialog.class && <Callout intent="primary">{t('PleaseSelectClass')}</Callout>}
        {manageDialog.class && (
          <>
            {isCheckingCompatibility.input || manageDialog.connector ? (
              <CompatibilityCheckIndicator
                isCompatible={isCompatible.input}
                isCheckingCompatibility={isCheckingCompatibility.input}
                title="PreviousOutputElement"
              />
            ) : null}
            {isCheckingCompatibility.output || manageDialog.connector ? (
              <CompatibilityCheckIndicator
                isCompatible={isCompatible.output}
                isCheckingCompatibility={isCheckingCompatibility.output}
                title="NextInputElement"
              />
            ) : null}
            {connectors.length > 0 ? (
              <SelectField
                defaultItems={connectors}
                predicate={(name: string) => {
                  // Get the connector
                  const conn = connectors.find((c) => c.name === name);
                  // Check if we should include this method
                  if (manageDialog.isFirst) {
                    // Filter out input only methods
                    return (
                      conn.type === 'output' ||
                      conn.type === 'event' ||
                      conn.type === 'input-output'
                    );
                  } else if (manageDialog.isBetween) {
                    return conn.type === 'input-output';
                  } else {
                    return conn.type === 'input' || conn.type === 'input-output';
                  }
                }}
                value={manageDialog.connector}
                onChange={async (_name, value) => {
                  const { isInputCompatible, isOutputCompatible } = await checkTypes(value);

                  setManageDialog((current: IManageDialog): IManageDialog => {
                    const isEvent = connectors.find((c) => c.name === value).type === 'event';

                    const result = {
                      ...current,
                      connector: value,
                      isLast: connectors.find((c) => c.name === value).type === 'input',
                      isEvent,
                      trigger: isEvent ? null : current.trigger,
                      isInputCompatible,
                      isOutputCompatible,
                    };

                    return result;
                  });
                }}
                name="connector"
                fill
              />
            ) : (
              <Callout intent="danger">{t('ClassWithoutConnectorsWarning')}</Callout>
            )}
          </>
        )}
      </FieldInputWrapper>
    </FieldWrapper>
  );
};

const StyledMapperWrapper = styled.div<{ isCompatible?: boolean }>`
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  top: -40px;
  left: 50%;
  transform: translateX(-50%) translateY(-50%);
  border: 1px solid #d7d7d7;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
  border-radius: 3px;
  background-color: #fff;
  color: #333;
  padding: 4px;
  white-space: nowrap;
  z-index: 500;

  > span {
    margin-right: 5px;
  }

  ${({ isCompatible }) =>
    isCompatible === false &&
    css`
      border-color: #d13913;
    `}
`;

const StyledMapperConnection = styled.div<{ side: 'bottom' | 'top'; isCompatible?: boolean }>`
  background-color: #d7d7d7;
  position: absolute;
  height: 33px;
  width: 2px;
  left: 50%;

  ${({ side }) => css`
    ${side}: -100%;
  `}

  ${({ isCompatible }) =>
    isCompatible === false &&
    css`
      background-color: #d13913;
    `}
`;

const StyledTrigger = styled.div`
  margin: 20px auto;
  margin-top: 0;
  width: 50%;
  border-radius: 3px;
  padding: 5px;
  text-align: center;
  background: white;
  border: 1px solid green;
  position: relative;

  &:after {
    content: '';
    display: block;
    height: 33px;
    width: 2px;
    position: absolute;
    left: 50%;
    top: 105%;
    background-color: #d7d7d7;
  }
`;

const StyledConnector = styled.h4``;

let mapperListener;

const ClassConnectionsDiagram: React.FC<IClassConnectionsDiagramProps> = ({
  t,
  connection,
  classes,
  classesData,
  addMessageListener,
  postMessage,
  onAddConnector,
  onDeleteConnector,
  connectionName,
  setMapper,
  handleMapperSubmitSet,
  resetAllInterfaceData,
  ifaceType,
  baseClassName,
  methods,
  interfaceContext,
}) => {
  const [manageDialog, setManageDialog] = useState<IManageDialog>({});
  const [hasLast, setHasLast] = useState<boolean>(false);
  const [mapperDialog, setMapperDialog] = useState({});
  const initContext = useContext(InitialContext);

  const isConnectorValid = () => {
    return manageDialog.isMapper
      ? true
      : validateField('string', manageDialog.class) &&
          validateField('string', manageDialog.connector);
  };

  connection = connection.map((connectionData: IClassConnection): IClassConnection => {
    // Get the class
    const class_name_parts = connectionData.class.split(':'); // possibly with prefix
    const class_name = class_name_parts[1] || class_name_parts[0];
    const connClass = Object.values(classesData).find(
      (class_data) => class_data.name === class_name
    );
    // Get the connector data
    const connectorData = connClass['class-connectors'].find(
      (conn) => conn.name === connectionData.connector
    );
    // Return updated data
    return {
      ...connectionData,
      ...connectorData,
      isLast: connectorData.type === 'input',
      isFirst: connectorData.type === 'output' || connectorData.type === 'event',
    };
  });

  useEffect(() => {
    mapperListener = addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
      if (data.iface_kind === 'mapper') {
        resetAllInterfaceData('mapper');
        setMapper({
          ...data.mapper,
          isFromConnectors: true,
          context: interfaceContext || data.mapper?.context,
        });
        handleMapperSubmitSet((mapperName, mapperVersion) => {
          resetAllInterfaceData('mapper');
          setManageDialog(
            (current: IManageDialog): IManageDialog => ({
              ...current,
              mapper: `${mapperName}:${mapperVersion}`,
            })
          );
          setMapperDialog({});
        });
        setMapperDialog({ isOpen: true, isEditing: true, mapper: data.mapper });
      }
    });

    return () => {
      mapperListener();
      mapperListener = null;
    };
  }, [manageDialog]);

  const getConnectorData = (className: string, connectorName: string) =>
    classesData?.[className]?.['class-connectors']?.find((c) => c.name === connectorName);

  const methodsCount = methods.filter((m) => m.name).length;
  const canHaveTrigger =
    manageDialog.isFirst &&
    getConnectorData(manageDialog.class, manageDialog.connector)?.type !== 'event';

  return (
    <div>
      {mapperDialog.isOpen && (
        <CustomDialog
          isOpen
          title={t('AddNewMapper')}
          onClose={() => {
            resetAllInterfaceData('mapper');
            setMapperDialog({});
          }}
          style={{ height: '95vh', width: '95vw', backgroundColor: '#fff' }}
        >
          <StyledDialogBody style={{ flexFlow: 'column' }}>
            <MapperView
              inConnections
              interfaceContext={interfaceContext}
              isEditing={mapperDialog.isEditing}
              defaultMapper={mapperDialog.isEditing && mapperDialog.mapper}
            />
          </StyledDialogBody>
        </CustomDialog>
      )}
      {manageDialog.isOpen && (
        <CustomDialog
          isOpen
          title={t('AddNewConnector')}
          onClose={() => {
            setManageDialog({});
          }}
          style={{ height: '50vh', width: '60vw', backgroundColor: '#fff' }}
        >
          <StyledDialogBody>
            <Content style={{ padding: 0 }}>
              <ContentWrapper>
                {manageDialog.isMapper ? (
                  <Mapper
                    interfaceContext={interfaceContext}
                    handleMapperSubmitSet={handleMapperSubmitSet}
                    manageDialog={manageDialog}
                    setManageDialog={setManageDialog}
                    setMapper={setMapper}
                    setMapperDialog={setMapperDialog}
                    resetAllInterfaceData={resetAllInterfaceData}
                  />
                ) : (
                  <>
                    <FieldWrapper>
                      <FieldLabel
                        label={t('Class')}
                        isValid={validateField('string', manageDialog.class)}
                      />
                      <FieldInputWrapper>
                        <SelectField
                          autoSelect
                          defaultItems={classes.map((clss) => ({
                            name: clss.prefix ? `${clss.prefix}:${clss.name}` : clss.name,
                          }))}
                          value={manageDialog.class}
                          onChange={(_name, value) => {
                            setManageDialog(
                              (current: IManageDialog): IManageDialog => ({
                                ...current,
                                class: value,
                                connector: null,
                              })
                            );
                          }}
                          name="class"
                          fill
                        />
                      </FieldInputWrapper>
                    </FieldWrapper>
                    <Connector
                      manageDialog={manageDialog}
                      t={t}
                      addMessageListener={addMessageListener}
                      postMessage={postMessage}
                      setManageDialog={setManageDialog}
                    />
                    {canHaveTrigger && (
                      <FieldWrapper>
                        <FieldLabel label={t('Trigger')} isValid={true} info={t('Optional')} />
                        <FieldInputWrapper>
                          <ControlGroup fill>
                            {ifaceType === 'service' && methodsCount === 0 && (
                              <Callout intent="warning">{t('TriggerNoMethodsAvailable')}</Callout>
                            )}
                            {(ifaceType !== 'service' || methodsCount !== 0) && (
                              <SelectField
                                get_message={
                                  ifaceType !== 'service' && {
                                    action: 'get-triggers',
                                    message_data: {
                                      iface_kind: ifaceType,
                                      'base-class-name': baseClassName,
                                    },
                                  }
                                }
                                return_message={
                                  ifaceType !== 'service' && {
                                    action: 'return-triggers',
                                    return_value: 'data.triggers',
                                  }
                                }
                                defaultItems={ifaceType === 'service' && methods}
                                value={manageDialog.trigger}
                                onChange={(_name, value) => {
                                  setManageDialog(
                                    (current: IManageDialog): IManageDialog => ({
                                      ...current,
                                      trigger: value,
                                    })
                                  );
                                }}
                                name="trigger"
                                fill
                              />
                            )}
                            {manageDialog.trigger && (
                              <Button
                                icon="trash"
                                intent="danger"
                                onClick={() => {
                                  initContext.confirmAction('ConfirmRemoveTrigger', () =>
                                    setManageDialog((current) => ({
                                      ...current,
                                      trigger: null,
                                    }))
                                  );
                                }}
                              />
                            )}
                          </ControlGroup>
                        </FieldInputWrapper>
                      </FieldWrapper>
                    )}
                  </>
                )}
              </ContentWrapper>
              <ActionsWrapper>
                <ButtonGroup fill>
                  <Tooltip content={t('CancelTooltip')}>
                    <Button
                      text={t('Cancel')}
                      icon={'cross'}
                      onClick={() => {
                        setManageDialog({});
                      }}
                    />
                  </Tooltip>
                  <Button
                    text={t('Submit')}
                    disabled={!isConnectorValid()}
                    icon={'tick'}
                    intent={
                      manageDialog.isInputCompatible === false ||
                      manageDialog.isOutputCompatible === false
                        ? 'warning'
                        : 'success'
                    }
                    onClick={() => {
                      onAddConnector(
                        connectionName,
                        omit(manageDialog, ['isFirst', 'isOpen', 'isMapper', 'connectorData']),
                        manageDialog.isEditing && !manageDialog.isMapper
                      );
                      setManageDialog({});
                      // Check if user added last connector (has no output method)
                      if (manageDialog.isLast) {
                        setHasLast(true);
                      }
                    }}
                  />
                </ButtonGroup>
              </ActionsWrapper>
            </Content>
          </StyledDialogBody>
        </CustomDialog>
      )}
      {size(connection) === 0 && (
        <ButtonGroup>
          <Button
            intent="success"
            icon="add"
            minimal
            text={t('AddInitialConnector')}
            onClick={() => setManageDialog({ isOpen: true, isFirst: true })}
          />
        </ButtonGroup>
      )}
      {connection &&
        connection.map((conn, index) => (
          <>
            {conn.trigger && (
              <StyledTrigger>
                <Icon icon="play" /> {conn.trigger}
              </StyledTrigger>
            )}
            <StyledMapperField
              key={conn.id}
              style={{
                width: 'auto',
                minWidth: '300px',
                marginTop: index !== 0 || conn.trigger ? '80px' : '10px',
                borderColor:
                  conn.isInputCompatible === false || conn.isOutputCompatible === false
                    ? '#d13913'
                    : undefined,
              }}
            >
              {index !== 0 || conn.trigger ? (
                <>
                  <StyledMapperConnection
                    side="top"
                    isCompatible={conn.isInputCompatible !== false}
                  />
                  <StyledMapperWrapper isCompatible={conn.isInputCompatible !== false}>
                    <Icon
                      icon="diagram-tree"
                      iconSize={12}
                      intent={conn.mapper ? 'success' : 'none'}
                    />{' '}
                    {conn.mapper || t('NoMapper')}
                    <ButtonGroup>
                      <Button
                        small
                        minimal
                        icon={<Icon icon={conn.mapper ? 'edit' : 'plus'} iconSize={12} />}
                        onClick={() =>
                          setManageDialog({
                            isOpen: true,
                            isEditing: true,
                            mapper: conn.mapper,
                            isMapper: true,
                            index: index,
                            connector: conn.connector,
                            previousItemData: connection[index - 1],
                            nextItemData: connection[index],
                            outputProvider:
                              index === 0 ? null : connection[index - 1]['output-provider'],
                            inputProvider: conn['input-provider'],
                          })
                        }
                      />
                      {conn.mapper && (
                        <Button
                          small
                          minimal
                          icon={<Icon icon={'trash'} intent="danger" iconSize={12} />}
                          onClick={() => {
                            initContext.confirmAction('ConfirmRemoveMapper', () =>
                              onAddConnector(
                                connectionName,
                                {
                                  index,
                                  isEditing: true,
                                },
                                true
                              )
                            );
                          }}
                        />
                      )}
                    </ButtonGroup>
                  </StyledMapperWrapper>
                </>
              ) : null}
              {index !== connection.length - 1 && (
                <StyledMapperConnection
                  isCompatible={conn.isOutputCompatible !== false}
                  side="bottom"
                />
              )}
              <StyledConnector>{conn.connector}</StyledConnector>
              <p className="type string">{conn.class}</p>

              <ButtonGroup
                style={{
                  position: 'absolute',
                  top: '30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                }}
              >
                {!conn.isLast && (
                  <Tooltip content={t('AddNewConnector')}>
                    <Button
                      onClick={() =>
                        setManageDialog({
                          isOpen: true,
                          index,
                          isBetween: index + 1 > 0 && index + 1 <= connection.length - 1,
                          isLast: index === connection.length - 1,
                          previousItemData: connection[index],
                          nextItemData: connection[index + 1],
                        })
                      }
                      icon="small-plus"
                      small
                      style={{ minWidth: '18px', minHeight: '18px' }}
                    />
                  </Tooltip>
                )}
                <Tooltip content={t('EditConnector')}>
                  <Button
                    onClick={() =>
                      setManageDialog({
                        isOpen: true,
                        class: conn.class,
                        trigger: conn.trigger,
                        mapper: conn.mapper,
                        connector: conn.connector,
                        isFirst: index === 0,
                        isBetween: index > 0 && index < connection.length - 1,
                        isLast: index === connection.length - 1,
                        isEditing: true,
                        previousItemData: index === 0 ? null : connection[index - 1],
                        nextItemData: connection[index + 1],
                        index,
                      })
                    }
                    icon="edit"
                    small
                    style={{ minWidth: '18px', minHeight: '18px' }}
                  />
                </Tooltip>
                {index !== 0 && (
                  <Tooltip content={t('RemoveConnector')}>
                    <Button
                      onClick={() => {
                        initContext.confirmAction('ConfirmRemoveConnector', () => {
                          onDeleteConnector(connectionName, index);
                          // If this was the last connector
                          if (conn.isLast) {
                            // Remove the last flag
                            setHasLast(false);
                          }
                        });
                      }}
                      icon="trash"
                      intent="danger"
                      small
                      style={{ minWidth: '18px', minHeight: '18px' }}
                    />
                  </Tooltip>
                )}
              </ButtonGroup>
            </StyledMapperField>
          </>
        ))}
    </div>
  );
};

export default compose(
  withMessageHandler(),
  withMapperConsumer(),
  withGlobalOptionsConsumer(),
  withMethodsConsumer()
)(ClassConnectionsDiagram);
