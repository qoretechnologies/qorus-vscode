import React, { useState, useEffect } from 'react';
import { IClassConnection, StyledDialogBody } from './index';
import size from 'lodash/size';
import omit from 'lodash/omit';
import { ButtonGroup, Button, Dialog, Callout, Tooltip, Icon } from '@blueprintjs/core';
import { TTranslator } from '../../App';
import { FieldWrapper, FieldInputWrapper, ContentWrapper, ActionsWrapper } from '../InterfaceCreator/panel';
import FieldLabel from '../../components/FieldLabel';
import { validateField } from '../../helpers/validations';
import SelectField from '../../components/Field/select';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import SidePanel from '../../components/SidePanel';
import Content from '../../components/Content';
import styled from 'styled-components';
import { StyledMapperField } from '../Mapper';

export interface IClassConnectionsDiagramProps {
    connection: IClassConnection[];
    t: TTranslator;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    onAddConnector: (name: string, data: IClassConnection) => void;
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
}

export interface IConnectorProps {
    t: TTranslator;
    manageDialog: IManageDialog;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    setManageDialog: any;
}

const Connector: React.FC<IConnectorProps> = ({
    t,
    addMessageListener,
    postMessage,
    setManageDialog,
    manageDialog,
}) => {
    const [connectors, setConnectors] = useState([]);

    useEffect(() => {
        if (manageDialog.class) {
            // Reset the connectors when class changes
            setConnectors([]);

            addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
                setConnectors(data.class.class_connectors);
            });

            postMessage(Messages.GET_INTERFACE_DATA, {
                iface_kind: 'class',
                name: manageDialog.class,
            });
        }
    }, [manageDialog]);

    return (
        <FieldWrapper>
            <FieldLabel label={t('Connector')} isValid={validateField('string', manageDialog.connector)} />
            <FieldInputWrapper>
                {connectors.length > 0 ? (
                    <SelectField
                        defaultItems={connectors}
                        predicate={(name: string) => {
                            // Get the connector
                            const conn = connectors.find(c => c.name === name);
                            // Check if we should include this method
                            if (manageDialog.isFirst) {
                                // Filter out input only methods
                                return !!conn['output-method'];
                            } else if (manageDialog.isBetween) {
                                return manageDialog.isLast
                                    ? !!conn['input-method']
                                    : !!(conn['input-method'] && conn['output-method']);
                            } else {
                                return !!conn['input-method'];
                            }
                        }}
                        value={manageDialog.connector}
                        onChange={(_name, value) => {
                            setManageDialog(
                                (current: IManageDialog): IManageDialog => ({
                                    ...current,
                                    connector: value,
                                    isLast: !!!connectors.find(c => c.name === value)['output-method'],
                                })
                            );
                        }}
                        name="connector"
                        fill
                    />
                ) : (
                    <Callout intent="warning">{t('PleaseSelectClass')}</Callout>
                )}
            </FieldInputWrapper>
        </FieldWrapper>
    );
};

const StyledMapperConnection = styled.div`
    background-color: #d7d7d7;
    position: absolute;
    height: 80px;
    width: 2px;
    left: 50%;
    top: 100%;

    div.mapper-wrapper {
        position: absolute;
        display: flex;
        align-items: center;
        justify-content: center;
        top: 50%;
        left: 50%;
        transform: translateX(-50%) translateY(-50%);
        border: 1px solid #d7d7d7;
        box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
        border-radius: 3px;
        background-color: #fff;
        color: #a9a9a9;
        padding: 4px;
        white-space: nowrap;

        > span {
            margin-right: 5px;
        }
    }
`;

const ClassConnectionsDiagram: React.FC<IClassConnectionsDiagramProps> = ({
    t,
    connection,
    classes,
    addMessageListener,
    postMessage,
    onAddConnector,
    onDeleteConnector,
    connectionName,
}) => {
    const [manageDialog, setManageDialog] = useState<IManageDialog>({});
    const [hasLast, setHasLast] = useState<boolean>(false);

    const isConnectorValid = () => {
        return manageDialog.isMapper
            ? validateField('string', manageDialog.mapper)
            : validateField('string', manageDialog.class) && validateField('string', manageDialog.connector);
    };
    console.log(connection);

    return (
        <div>
            <Dialog
                isOpen={manageDialog.isOpen}
                title={t('AddNewConnector')}
                onClose={() => setManageDialog({})}
                style={{ height: '30vh', backgroundColor: '#fff' }}
            >
                <StyledDialogBody>
                    <Content style={{ padding: 0 }}>
                        <ContentWrapper>
                            {manageDialog.isMapper ? (
                                <FieldWrapper>
                                    <FieldLabel
                                        label={t('Mapper')}
                                        isValid={validateField('string', manageDialog.mapper)}
                                    />
                                    <FieldInputWrapper>
                                        <SelectField
                                            get_message={{
                                                action: 'creator-get-objects',
                                                object_type: 'mapper',
                                            }}
                                            return_message={{
                                                action: 'creator-return-objects',
                                                object_type: 'mapper',
                                                return_value: 'objects',
                                            }}
                                            value={manageDialog.mapper}
                                            onChange={(_name, value) => {
                                                setManageDialog(
                                                    (current: IManageDialog): IManageDialog => ({
                                                        ...current,
                                                        mapper: value,
                                                    })
                                                );
                                            }}
                                            name="class"
                                            fill
                                        />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                            ) : (
                                <>
                                    <FieldWrapper>
                                        <FieldLabel
                                            label={t('Class')}
                                            isValid={validateField('string', manageDialog.class)}
                                        />
                                        <FieldInputWrapper>
                                            <SelectField
                                                defaultItems={classes.map(clss => ({
                                                    name: clss.prefix ? `${clss.prefix}:${clss.name}` : clss.name,
                                                }))}
                                                value={manageDialog.class}
                                                onChange={(_name, value) => {
                                                    setManageDialog(
                                                        (current: IManageDialog): IManageDialog => ({
                                                            ...current,
                                                            class: value,
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
                                    intent="success"
                                    onClick={() => {
                                        onAddConnector(
                                            connectionName,
                                            omit(manageDialog, ['isFirst', 'isOpen', 'isMapper'])
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
            </Dialog>
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
                    <StyledMapperField key={conn.id} style={{ marginBottom: '80px' }}>
                        {connection.length > index + 1 && (
                            <StyledMapperConnection>
                                <div className="mapper-wrapper">
                                    <Icon icon="diagram-tree" iconSize={12} intent={conn.mapper ? 'success' : 'none'} />{' '}
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
                                                })
                                            }
                                        />
                                    </ButtonGroup>
                                </div>
                            </StyledMapperConnection>
                        )}
                        <h4>{conn.connector}</h4>
                        <p className="string">{conn.class}</p>

                        <ButtonGroup
                            style={{
                                position: 'absolute',
                                bottom: '8px',
                                right: '8px',
                            }}
                        >
                            {!conn.isLast && (
                                <Tooltip content={t('AddNewConnector')}>
                                    <Button
                                        onClick={() => setManageDialog({ isOpen: true, isBetween: hasLast, index })}
                                        minimal
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
                                            connector: conn.connector,
                                            isFirst: index === 0,
                                            isLast: index === connection.length - 1,
                                            isBetween: hasLast,
                                            isEditing: true,
                                            index,
                                        })
                                    }
                                    minimal
                                    icon="edit"
                                    small
                                    style={{ minWidth: '18px', minHeight: '18px' }}
                                />
                            </Tooltip>
                            {index !== 0 && (
                                <Tooltip content={t('RemoveConnector')}>
                                    <Button
                                        onClick={() => onDeleteConnector(connectionName, index)}
                                        minimal
                                        icon="trash"
                                        intent="danger"
                                        small
                                        style={{ minWidth: '18px', minHeight: '18px' }}
                                    />
                                </Tooltip>
                            )}
                        </ButtonGroup>
                    </StyledMapperField>
                ))}
        </div>
    );
};

export default withMessageHandler()(ClassConnectionsDiagram);
