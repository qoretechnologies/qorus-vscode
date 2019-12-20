import React, { useState, useEffect } from 'react';
import { IClassConnection, StyledDialogBody } from './index';
import size from 'lodash/size';
import { ButtonGroup, Button, Dialog } from '@blueprintjs/core';
import { TTranslator } from '../../App';
import { FieldWrapper, FieldInputWrapper } from '../InterfaceCreator/panel';
import FieldLabel from '../../components/FieldLabel';
import { validateField } from '../../helpers/validations';
import SelectField from '../../components/Field/select';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';

export interface IClassConnectionsDiagramProps {
    connection: IClassConnection[];
    t: TTranslator;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    onAddConnector: (name: string, data: IClassConnection) => void;
    classes: any;
}

export interface IManageDialog {
    isOpen?: boolean;
    class?: string;
    mapper?: string;
    connector?: string;
    connectorList?: any;
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
            addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
                console.log(data);
            });

            postMessage(Messages.GET_INTERFACE_DATA, {
                iface_kind: 'class',
                name: manageDialog.class.split(':')[0],
            });
        }
    }, [manageDialog]);

    return (
        <FieldWrapper>
            <FieldLabel label={t('Connector')} isValid={validateField('string', manageDialog.class)} />
            <FieldInputWrapper>
                {manageDialog.class ? (
                    <SelectField
                        get_message={{
                            action: 'creator-get-objects',
                            object_type: 'class',
                        }}
                        return_message={{
                            action: 'creator-return-objects',
                            object_type: 'class',
                            return_value: 'objects',
                        }}
                        predicate={
                            (name: string) => true
                            //!some(stepsData, item => `${item.name}:${item.version}` === name)
                        }
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
                ) : (
                    <p>Please select class</p>
                )}
            </FieldInputWrapper>
        </FieldWrapper>
    );
};

const ClassConnectionsDiagram: React.FC<IClassConnectionsDiagramProps> = ({
    t,
    connection,
    classes,
    addMessageListener,
    postMessage,
}) => {
    const [manageDialog, setManageDialog] = useState<IManageDialog>({});

    console.log(classes);

    return (
        <div>
            <Dialog isOpen={manageDialog.isOpen} title={t('AddNewConnector')} onClose={() => setManageDialog({})}>
                <StyledDialogBody>
                    <FieldWrapper>
                        <FieldLabel label={t('Class')} isValid={validateField('string', manageDialog.class)} />
                        <FieldInputWrapper>
                            <SelectField
                                defaultItems={classes.map(clss => ({
                                    name: `${clss.prefix}:${clss.name}`,
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
                </StyledDialogBody>
            </Dialog>
            {size(connection) === 0 && (
                <ButtonGroup>
                    <Button
                        intent="success"
                        icon="add"
                        minimal
                        text={t('AddInitialConnector')}
                        onClick={() => setManageDialog({ isOpen: true })}
                    />
                </ButtonGroup>
            )}
        </div>
    );
};

export default withMessageHandler()(ClassConnectionsDiagram);
