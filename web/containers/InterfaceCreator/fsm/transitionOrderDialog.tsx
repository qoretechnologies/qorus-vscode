import React, { useState, useContext } from 'react';
import { IFSMTransition, IFSMState } from '.';
import { TextContext } from '../../../context/text';
import CustomDialog from '../../../components/CustomDialog';
import Content from '../../../components/Content';
import { ContentWrapper, ActionsWrapper } from '../panel';
import styled from 'styled-components';
import { ButtonGroup, Button, Classes, Tooltip, Intent, Icon } from '@blueprintjs/core';
import { TransitionEditor, isConditionValid, getConditionType } from './transitionDialog';
import cloneDeep from 'lodash/cloneDeep';
import capitalize from 'lodash/capitalize';

export interface IFSMTransitionOrderDialogProps {
    id: string;
    transitions: IFSMTransition[];
    onClose: any;
    getStateData: (id: string) => IFSMState;
    onSubmit: (id: string, data: IFSMState) => any;
}

const StyledTransitionOrderWrapper = styled.div`
    display: flex;
    width: 100%;
    height: 50px;
    justify-content: space-between;
    align-items: center;
    padding: 0 15px;
    border: 1px solid #eee;
    border-radius: 5px;
    margin-bottom: 10px;

    > span {
        font-size: 15px;
    }

    &:nth-child(even) {
        background-color: #eee;
        border-color: #ddd;
    }
`;

const FSMTransitionOrderDialog: React.FC<IFSMTransitionOrderDialogProps> = ({
    id,
    transitions,
    onClose,
    getStateData,
    onSubmit,
}) => {
    const [newTransitions, setNewTransitions] = useState<IFSMTransition[]>(cloneDeep(transitions) || []);
    const [editingTransition, setEditingTransition] = useState<number | null>(null);
    const t = useContext(TextContext);

    const changeOrder = (from: number, to: number): void => {
        setNewTransitions((cur) => {
            const result = [...cur];

            [result[from], result[to]] = [result[to], result[from]];

            if (from === editingTransition) {
                setEditingTransition(to);
            }

            return result;
        });
    };

    const renderStateInfo = (id) => {
        const { name, type, action }: IFSMState = getStateData(id);
        const realType: string = type === 'fsm' ? type : action?.type;

        return (
            <>
                <strong>{name}</strong> <span className={Classes.TEXT_MUTED}>[{realType}]</span>
            </>
        );
    };

    const renderTransitionInfo = (data: IFSMTransition) => {
        const { condition, errors }: IFSMTransition = data;
        const conditionType: string = getConditionType(condition);

        let conditionText = '';

        if (conditionType !== 'none') {
            const conditionValue =
                conditionType === 'custom'
                    ? condition
                    : `${condition.class || t('Missing')}:${condition.connector || t('Missing')}`;

            conditionText = `${capitalize(conditionType)} ${t('TransitionOrderCondition')}: ${conditionValue} ${
                errors?.length ? ' | ' : ''
            }`;
        }

        if (errors?.length) {
            conditionText += `${errors.length} ${t('TransitionErrors')}: [${errors
                .map((error) => error.name)
                .join(', ')}]`;
        }

        return (
            <>
                <p
                    style={{ margin: '3px 0 0 0', padding: 0, marginLeft: '15.5px', fontSize: '13px' }}
                    className={Classes.TEXT_MUTED}
                >
                    {conditionText}
                </p>
            </>
        );
    };

    const updateTransitionData = (index, name, value) => {
        setNewTransitions((cur) => {
            const result = [...cur];

            result[index][name] = value;

            return result;
        });
    };

    const removeTransition = (index) => {
        setNewTransitions((cur) => {
            let result = [...cur];

            result = result.filter((_transition, idx) => idx !== index);

            return result;
        });
    };

    const isTransitionValid = (index) => {
        return isConditionValid(newTransitions[index]);
    };

    const isDataValid = () => {
        return newTransitions.every((transition) => isConditionValid(transition));
    };

    return (
        <CustomDialog
            onClose={onClose}
            isOpen
            title={t('EditingTransitionOrder')}
            style={{ width: '80vw', paddingBottom: 0 }}
        >
            <Content style={{ backgroundColor: '#fff', borderTop: '1px solid #d7d7d7', padding: '10px' }}>
                <ContentWrapper style={{ padding: 0 }}>
                    {newTransitions.map((transition, index) => (
                        <>
                            <StyledTransitionOrderWrapper
                                key={index}
                                style={{ border: !isTransitionValid(index) ? '1px solid red' : undefined }}
                            >
                                <span>
                                    <strong>{index + 1}.</strong> {t('TransitionToState')}{' '}
                                    {renderStateInfo(transition.state)}{' '}
                                    {!isTransitionValid(index) && <Icon icon="cross" intent="danger" />}
                                    {renderTransitionInfo(transition)}
                                </span>
                                <ButtonGroup>
                                    <Tooltip content={t('TransitionUp')}>
                                        <Button
                                            icon="arrow-up"
                                            disabled={index === 0}
                                            onClick={() => changeOrder(index, index - 1)}
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('TransitionDown')}>
                                        <Button
                                            icon="arrow-down"
                                            disabled={index === newTransitions.length - 1}
                                            onClick={() => changeOrder(index, index + 1)}
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('Edit')}>
                                        <Button
                                            icon="edit"
                                            intent="warning"
                                            onClick={() => setEditingTransition(index)}
                                        />
                                    </Tooltip>
                                    <Tooltip content={t('Delete')}>
                                        <Button icon="trash" intent="danger" onClick={() => removeTransition(index)} />
                                    </Tooltip>
                                </ButtonGroup>
                            </StyledTransitionOrderWrapper>
                            {editingTransition === index && (
                                <TransitionEditor
                                    onChange={(name, value) => updateTransitionData(index, name, value)}
                                    transitionData={transition}
                                    qorus_instance={null}
                                    errors={null}
                                />
                            )}
                        </>
                    ))}
                </ContentWrapper>
                <ActionsWrapper>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
                                    setNewTransitions(cloneDeep(transitions));
                                    setEditingTransition(null);
                                }}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            icon={'tick'}
                            name={`fsn-submit-state`}
                            intent={Intent.SUCCESS}
                            disabled={!isDataValid()}
                            onClick={() => {
                                onSubmit(id, { transitions: newTransitions });
                                onClose();
                            }}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMTransitionOrderDialog;
