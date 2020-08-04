import React, { useContext, useState, useEffect } from 'react';

import find from 'lodash/find';

import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';

import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import BooleanField from '../../../components/Field/boolean';
import Connectors from '../../../components/Field/connectors';
import RadioField from '../../../components/Field/radioField';
import SelectField from '../../../components/Field/select';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import Spacer from '../../../components/Spacer';
import { TextContext } from '../../../context/text';
import { validateField } from '../../../helpers/validations';
import ConfigItemManager from '../../ConfigItemManager';
import ManageConfigItemsButton from '../../ConfigItemManager/manageButton';
import { ActionsWrapper, ContentWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
import { IFSMState, IFSMStates } from './';
import ConnectorSelector from './connectorSelector';
import withMessageHandler, { TPostMessage } from '../../../hocomponents/withMessageHandler';
import { Messages } from '../../../constants/messages';
import { InitialContext } from '../../../context/init';

export interface IFSMStateDialogProps {
    onClose: () => any;
    data: IFSMState;
    id: string;
    onSubmit: (id: string, newData: IFSMState) => void;
    otherStates: IFSMStates;
    deleteState: (id: string) => any;
    fsmName?: string;
    interfaceId: string;
    postMessage: TPostMessage;
}

export type TAction = 'connector' | 'mapper' | 'pipeline' | 'none';

const FSMStateDialog: React.FC<IFSMStateDialogProps> = ({
    onClose,
    data,
    id,
    onSubmit,
    otherStates,
    deleteState,
    fsmName,
    interfaceId,
    postMessage,
}) => {
    const [newData, setNewData] = useState<IFSMState>(data);
    const [actionType, setActionType] = useState<TAction>(data?.action?.type || 'none');
    const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
    const t = useContext(TextContext);
    const { confirmAction } = useContext(InitialContext);

    useEffect(() => {
        if (newData.action?.value?.['class']) {
            console.log(newData.action.value);
            postMessage(Messages.GET_CONFIG_ITEMS, {
                iface_kind: 'fsm',
                iface_id: interfaceId,
                state_data: {
                    id,
                    class_name: newData.action.value['class'],
                },
            });
        }
    }, [newData.action?.value?.['class']]);

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => ({
            ...cur,
            [name]: value === 'none' ? null : value,
        }));

        if (name === 'type') {
            handleDataUpdate('name', null);
            handleDataUpdate('action', 'none');
            handleDataUpdate('input-type', null);
            handleDataUpdate('output-type', null);
            handleDataUpdate('initial', false);
            handleDataUpdate('final', false);
        }
    };

    const isNameValid: (name: string) => boolean = (name) =>
        validateField('string', name) && !find(otherStates, (state: IFSMState): boolean => state.name === name);

    const isDataValid: () => boolean = () => {
        return (
            isNameValid(newData.name) &&
            isActionValid() &&
            (!newData['input-type'] || validateField('type-selector', newData['input-type'])) &&
            (!newData['output-type'] || validateField('type-selector', newData['output-type']))
        );
    };

    const isActionValid: () => boolean = () => {
        switch (actionType) {
            case 'mapper': {
                return !!newData?.action?.value;
            }
            case 'pipeline': {
                return !!newData?.action?.value;
            }
            case 'connector': {
                return !!newData?.action?.value?.['class'] && !!newData?.action?.value?.connector;
            }
            default: {
                return true;
            }
        }
    };

    const renderActionField = () => {
        switch (actionType) {
            case 'mapper': {
                return (
                    <SelectField
                        get_message={{
                            action: 'get-mappers',
                        }}
                        return_message={{
                            action: 'return-mappers',
                            return_value: 'mappers',
                        }}
                        onChange={(_name, value) => handleDataUpdate('action', { type: 'mapper', value })}
                        value={newData?.action?.value}
                        name="action"
                    />
                );
            }
            case 'connector': {
                return (
                    <ConnectorSelector
                        value={newData?.action?.value}
                        onChange={(value) => handleDataUpdate('action', { type: 'connector', value })}
                        types={['input', 'input-output', 'output']}
                    />
                );
            }
            default:
                return null;
        }
    };

    return (
        <>
            <CustomDialog
                onClose={() => {
                    // If the name is empty and the original name was empty
                    // delete this state
                    if ((data.type === 'fsm' && !data.name) || (data.type === 'state' && !data.action?.value)) {
                        deleteState(id);
                    }
                    onClose();
                }}
                isOpen
                title={t('EditingState')}
                style={{ width: '80vw', paddingBottom: 0 }}
            >
                <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                    <ContentWrapper>
                        <FieldWrapper padded>
                            <FieldLabel label={t('Type')} isValid />
                            <FieldInputWrapper>
                                <SelectField
                                    defaultItems={[{ name: 'state' }, { name: 'fsm' }]}
                                    onChange={handleDataUpdate}
                                    value={newData.type}
                                    name="type"
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper padded>
                            <FieldLabel label={t('Name')} isValid={isNameValid(newData.name)} />
                            <FieldInputWrapper>
                                {newData.type === 'fsm' ? (
                                    <SelectField
                                        get_message={{
                                            action: 'creator-get-objects',
                                            object_type: 'fsm',
                                        }}
                                        return_message={{
                                            action: 'creator-return-objects',
                                            object_type: 'fsm',
                                            return_value: 'objects',
                                        }}
                                        predicate={(name) => fsmName !== name}
                                        defaultItems={[{ name: 'TestFSM1' }]}
                                        onChange={handleDataUpdate}
                                        value={newData?.name}
                                        name="name"
                                    />
                                ) : (
                                    <String name="name" onChange={handleDataUpdate} value={newData.name} />
                                )}
                            </FieldInputWrapper>
                        </FieldWrapper>
                        {newData.type === 'state' && (
                            <>
                                <FieldWrapper padded>
                                    <FieldLabel label={t('Initial')} isValid />
                                    <FieldInputWrapper>
                                        <BooleanField
                                            name="initial"
                                            onChange={handleDataUpdate}
                                            value={newData.initial}
                                        />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                                <FieldWrapper padded>
                                    <FieldLabel label={t('Final')} isValid info={t('Optional')} />
                                    <FieldInputWrapper>
                                        <BooleanField name="final" onChange={handleDataUpdate} value={newData.final} />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                                <FieldWrapper padded>
                                    <FieldLabel label={t('Action')} isValid={isActionValid()} info={t('Optional')} />
                                    <FieldInputWrapper>
                                        <RadioField
                                            name="action"
                                            onChange={(_name, value) => {
                                                handleDataUpdate('action', null);
                                                setActionType(value);
                                            }}
                                            value={actionType}
                                            items={[{ value: 'mapper' }, { value: 'pipeline' }, { value: 'connector' }]}
                                        />
                                        {actionType && actionType !== 'none' ? (
                                            <>
                                                <Spacer size={20} />
                                                {renderActionField()}
                                            </>
                                        ) : null}
                                    </FieldInputWrapper>
                                </FieldWrapper>
                                <FieldWrapper padded>
                                    <FieldLabel label={t('InputType')} isValid info={t('Optional')} />
                                    <FieldInputWrapper>
                                        <Connectors
                                            name="input-type"
                                            isInitialEditing={data['input-type']}
                                            onChange={handleDataUpdate}
                                            value={newData['input-type']}
                                        />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                                <FieldWrapper padded>
                                    <FieldLabel label={t('OutputType')} isValid info={t('Optional')} />
                                    <FieldInputWrapper>
                                        <Connectors
                                            name="output-type"
                                            isInitialEditing={data['output-type']}
                                            onChange={handleDataUpdate}
                                            value={newData['output-type']}
                                        />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                            </>
                        )}
                    </ContentWrapper>
                    <ActionsWrapper style={{ padding: '10px' }}>
                        <ButtonGroup fill>
                            <Tooltip content={t('ResetTooltip')}>
                                <Button
                                    text={t('Reset')}
                                    icon={'history'}
                                    onClick={() => {
                                        confirmAction(
                                            'ResetFieldsConfirm',
                                            () => {
                                                postMessage(Messages.RESET_CONFIG_ITEMS, {
                                                    iface_id: interfaceId,
                                                    state_id: id,
                                                });
                                                setActionType(data?.action?.type);
                                                setNewData(data);
                                            },
                                            'Reset',
                                            'warning'
                                        );
                                    }}
                                />
                            </Tooltip>
                            {newData.action?.value?.['class'] && (
                                <ManageConfigItemsButton
                                    type="fsm"
                                    key={newData.action.value['class']}
                                    onClick={() => setShowConfigItemsManager(true)}
                                />
                            )}
                            <Button
                                text={t('Submit')}
                                disabled={!isDataValid()}
                                icon={'tick'}
                                name={`fsn-submit-state`}
                                intent={Intent.SUCCESS}
                                onClick={() => {
                                    postMessage('submit-fsm-state', {
                                        iface_id: interfaceId,
                                        state_id: id,
                                    });
                                    onSubmit(id, newData)
                                }}
                            />
                        </ButtonGroup>
                    </ActionsWrapper>
                </Content>
            </CustomDialog>
            {showConfigItemsManager && (
                <CustomDialog
                    isOpen
                    title={t('ConfigItemsManager')}
                    onClose={() => setShowConfigItemsManager(false)}
                    style={{ width: '80vw', backgroundColor: '#fff' }}
                >
                    <ConfigItemManager
                        type="fsm"
                        stateData={{ id, class_name: newData.action?.value?.['class'] }}
                        interfaceId={interfaceId}
                        disableAdding
                    />
                </CustomDialog>
            )}
        </>
    );
};

export default withMessageHandler()(FSMStateDialog);
