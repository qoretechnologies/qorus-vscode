import React, { useState, useContext, useEffect } from 'react';
import CustomDialog from '../../../components/CustomDialog';
import { IFSMState, IFSMStates, IFSMTransition } from '.';
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
import { ButtonGroup, Tooltip, Button, Intent, Callout, Spinner } from '@blueprintjs/core';
import { Messages } from '../../../constants/messages';
import uniq from 'lodash/uniq';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import every from 'lodash/every';
import cloneDeep from 'lodash/cloneDeep';
import RadioField from '../../../components/Field/radioField';
import ConnectorSelector from './connectorSelector';
import MultiSelect from '../../../components/Field/multiSelect';
import Spacer from '../../../components/Spacer';
import useMount from 'react-use/lib/useMount';
import styled from 'styled-components';

export interface IFSMTransitionDialogProps {
    onClose: () => any;
    states: IFSMStates;
    onSubmit: (stateId: number, index: number, newData: IFSMTransition, remove?: boolean) => void;
    editingData: { stateId: number; index: number }[];
}

export type TTransitionCondition = 'custom' | 'connector' | 'none';

export interface IModifiedTransition {
    name: string;
    conditionType: TTransitionCondition;
    data: IFSMTransition;
}

export interface IModifiedTransitions {
    [id: string]: IModifiedTransition;
}

const StyledTransitionWrapper = styled.div`
    padding-top: 10;

    h3 {
        padding-top: 10px;
    }

    &:not(:first-child) {
        margin-bottom: 10px;
        border-top: 1px solid #eee;
    }
`;

const FSMTransitionDialog: React.FC<IFSMTransitionDialogProps> = ({ onClose, states, editingData, onSubmit }) => {
    const { qorus_instance, fetchData } = useContext<{ qorus_instance?: string }>(InitialContext);

    const getConditionType: (condition: any) => TTransitionCondition = (condition) => {
        return !condition ? 'none' : typeof condition === 'string' ? 'custom' : 'connector';
    };

    console.log(editingData, states);

    const getTransitionFromStates: () => IModifiedTransitions = () =>
        editingData.reduce(
            (modifiedData, { stateId, index }) => ({
                ...modifiedData,
                [`${stateId}:${index}`]: {
                    name: `${states[stateId].name} -> ${states[states[stateId].transitions[index].state].name}`,
                    conditionType: getConditionType(states[stateId].transitions[index].condition),
                    data: cloneDeep(states)[stateId].transitions[index],
                },
            }),
            {}
        );

    const [newData, setNewData] = useState<IModifiedTransitions>(getTransitionFromStates());
    const [errors, setErrors] = useState<{ name: string }[] | null>(null);
    const t = useContext(TextContext);

    useMount(() => {
        if (qorus_instance) {
            (async () => {
                const result = await fetchData('/errors?list');
                setErrors(uniq(result.data).map((datum) => ({ name: datum })));
            })();
        }
    });

    const removeTransition = (id: string) => {
        setNewData((cur) => {
            const result = { ...cur };

            result[id] = null;

            return result;
        });
    };

    const handleDataUpdate = (id: string, name: string, value: any) => {
        setNewData((cur) => {
            const result = { ...cur };

            if (name === 'conditionType') {
                result[id].conditionType = value;
            } else {
                result[id].data[name] = value;
            }

            return result;
        });
    };

    const handleSubmitClick = () => {
        forEach(newData, (transitionData, id) => {
            const [stateId, index] = id.split(':');

            onSubmit(stateId, index, transitionData?.data, !transitionData);
        });

        onClose();
    };

    const isDataValid: () => boolean = () => {
        let isValid = true;

        forEach(newData, (transitionData, id) => {
            if (transitionData && !isConditionValid(transitionData.conditionType, transitionData.data)) {
                isValid = false;
            }
        });

        return isValid;
    };

    const isConditionValid: (conditionType: TTransitionCondition, transitionData: IFSMTransition) => boolean = (
        conditionType,
        transitionData
    ) => {
        if (conditionType === 'connector') {
            return !!transitionData?.condition?.['class'] && !!transitionData?.condition?.connector;
        }

        return true;
    };

    const areAllTransitionsDeleted = () => {
        return every(newData, (data, id) => {
            return !data;
        });
    };

    const renderConditionField: (
        id: string,
        conditionType: TTransitionCondition,
        transitionData: IFSMTransition
    ) => any = (id, conditionType, transitionData) => {
        switch (conditionType) {
            case 'connector': {
                return (
                    <ConnectorSelector
                        value={transitionData?.condition}
                        onChange={(value) => handleDataUpdate(id, 'condition', value)}
                        types={['condition']}
                    />
                );
            }
            case 'custom': {
                return (
                    <String
                        name="condition"
                        onChange={(name, value) => handleDataUpdate(id, name, value)}
                        value={transitionData?.condition}
                    />
                );
            }
            default:
                return null;
        }
    };

    const renderErrorsField: (id: string, transitionData: IFSMTransition) => any = (id, transitionData) => {
        if (qorus_instance && !errors) {
            return <Spinner size={14} />;
        }

        return (
            <MultiSelect
                simple
                default_items={[{ name: 'All' }, ...(errors || [])]}
                name="errors"
                onChange={(_name, value) => handleDataUpdate(id, 'errors', value)}
                value={transitionData?.errors}
            />
        );
    };

    return (
        <CustomDialog
            onClose={onClose}
            isOpen
            title={t('EditingTransition')}
            style={{ width: '80vw', paddingBottom: 0 }}
        >
            <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper>
                    {areAllTransitionsDeleted() ? (
                        <Callout style={{ marginLeft: '10px', marginTop: '10px', width: '99%' }} intent="warning">
                            {t('AllTransitionsRemoved')}
                        </Callout>
                    ) : (
                        <>
                            {map(
                                newData,
                                (transitionData: IModifiedTransition, id: string) =>
                                    transitionData && (
                                        <StyledTransitionWrapper>
                                            <h3>
                                                {transitionData.name}
                                                <Button
                                                    style={{ float: 'right' }}
                                                    intent="danger"
                                                    icon="trash"
                                                    onClick={() => {
                                                        removeTransition(id);
                                                    }}
                                                />
                                            </h3>
                                            <FieldWrapper padded>
                                                <FieldLabel
                                                    label={t('Condition')}
                                                    isValid={isConditionValid(
                                                        transitionData.conditionType,
                                                        transitionData.data
                                                    )}
                                                    info={t('Optional')}
                                                />
                                                <FieldInputWrapper>
                                                    <RadioField
                                                        name="conditionType"
                                                        onChange={(_name, value) => {
                                                            handleDataUpdate(id, 'condition', null);
                                                            handleDataUpdate(id, 'conditionType', value);
                                                        }}
                                                        value={transitionData.conditionType || 'none'}
                                                        items={[
                                                            { value: 'custom' },
                                                            { value: 'connector' },
                                                            { value: 'none' },
                                                        ]}
                                                    />
                                                    {transitionData.conditionType &&
                                                    transitionData.conditionType !== 'none' ? (
                                                        <>
                                                            <Spacer size={20} />
                                                            {renderConditionField(
                                                                id,
                                                                transitionData.conditionType,
                                                                transitionData.data
                                                            )}
                                                        </>
                                                    ) : null}
                                                </FieldInputWrapper>
                                            </FieldWrapper>
                                            <FieldWrapper padded>
                                                <FieldLabel label={t('Errors')} isValid info={t('Optional')} />
                                                <FieldInputWrapper>
                                                    {!qorus_instance && (
                                                        <>
                                                            <Callout intent={Intent.WARNING}>
                                                                {t('TransitionErrorsNoInstance')}
                                                            </Callout>
                                                            <Spacer size={10} />
                                                        </>
                                                    )}
                                                    {renderErrorsField(id, transitionData.data)}
                                                </FieldInputWrapper>
                                            </FieldWrapper>
                                        </StyledTransitionWrapper>
                                    )
                            )}
                        </>
                    )}
                </ContentWrapper>
                <ActionsWrapper style={{ padding: '10px' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => setNewData(getTransitionFromStates())}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={!isDataValid()}
                            icon={'tick'}
                            name={`fsn-submit-state`}
                            intent={Intent.SUCCESS}
                            onClick={handleSubmitClick}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMTransitionDialog;
