import React, { useState, useContext, useEffect } from 'react';
import CustomDialog from '../../../components/CustomDialog';
import { IFSMState, IFSMStates } from '.';
import { StyledDialogBody } from '../../ClassConnectionsManager';
import { FieldWrapper, FieldInputWrapper, ContentWrapper, ActionsWrapper } from '../panel';
import FieldLabel from '../../../components/FieldLabel';
import { InitialContext } from '../../../context/init';
import BooleanField from '../../../components/Field/boolean';
import { TextContext } from '../../../context/text';
import Content from '../../../components/Content';
import { validateField } from '../../../helpers/validations';
import String from '../../../components/Field/string';
import Connectors from '../../../components/Field/connectors';
import { ButtonGroup, Tooltip, Button, Intent } from '@blueprintjs/core';
import { Messages } from '../../../constants/messages';
import find from 'lodash/find';
import RadioField from '../../../components/Field/radioField';
import SelectField from '../../../components/Field/select';
import Spacer from '../../../components/Spacer';
import ConnectorSelector from './connectorSelector';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

export interface IFSMStateDialogProps {
    onClose: () => any;
    data: IFSMState;
    id: string;
    onSubmit: (id: string, newData: IFSMState) => void;
    otherStates: IFSMStates;
    deleteState: (id: string) => any;
}

export type TAction = 'connector' | 'mapper' | 'pipeline' | 'none';

const FSMStateDialog: React.FC<IFSMStateDialogProps> = ({ onClose, data, id, onSubmit, otherStates, deleteState }) => {
    const [newData, setNewData] = useState<IFSMState>(data);
    const [actionType, setActionType] = useState<TAction>(data?.action?.type || 'none');
    const t = useContext(TextContext);

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
                        onChange={(name, value) => handleDataUpdate('action', { type: 'mapper', value })}
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
                                    <BooleanField name="initial" onChange={handleDataUpdate} value={newData.initial} />
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
                                        items={[
                                            { value: 'mapper' },
                                            { value: 'pipeline' },
                                            { value: 'connector' },
                                        ]}
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
                                    setActionType(null);
                                    setNewData(data);
                                }}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={!isDataValid()}
                            icon={'tick'}
                            name={`fsn-submit-state`}
                            intent={Intent.SUCCESS}
                            onClick={() => onSubmit(id, newData)}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMStateDialog;
