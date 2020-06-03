import React, { useState, useContext } from 'react';
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
import RadioField from '../../../components/Field/radioField';
import ConnectorSelector from './connectorSelector';
import MultiSelect from '../../../components/Field/multiSelect';
import Spacer from '../../../components/Spacer';
import useMount from 'react-use/lib/useMount';

export interface IFSMTransitionDialogProps {
    onClose: () => any;
    data: IFSMTransition;
    stateId: number;
    index: number;
    onSubmit: (stateId: number, index: number, newData: IFSMTransition) => void;
}

const FSMTransitionDialog: React.FC<IFSMTransitionDialogProps> = ({ onClose, data, stateId, index, onSubmit }) => {
    const { qorus_instance, fetchData } = useContext<{ qorus_instance?: string }>(InitialContext);

    const getConditionType: (condition: any) => 'custom' | 'connector' = (condition) => {
        return !condition || typeof condition === 'string' ? 'custom' : 'connector';
    };

    const [newData, setNewData] = useState<IFSMTransition>(data);
    const [conditionType, setConditionType] = useState<'custom' | 'connector' | 'none'>(
        data?.condition ? getConditionType(data?.condition) : 'none'
    );
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

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => ({
            ...cur,
            [name]: value === 'none' ? null : value,
        }));
    };

    const isDataValid: () => boolean = () => {
        return isConditionValid();
    };

    const isConditionValid: () => boolean = () => {
        if (conditionType === 'connector') {
            return !!newData?.condition?.['class'] && !!newData?.condition?.connector;
        }

        return true;
    };

    const renderConditionField: () => any = () => {
        switch (conditionType) {
            case 'connector': {
                return (
                    <ConnectorSelector
                        value={newData?.condition}
                        onChange={(value) => handleDataUpdate('condition', value)}
                    />
                );
            }
            case 'custom': {
                return <String name="condition" onChange={handleDataUpdate} value={newData?.condition} />;
            }
            default:
                return null;
        }
    };

    const renderErrorsField: () => any = () => {
        if (!qorus_instance) {
            return (
                <>
                    <Callout intent={Intent.WARNING}>{t('TransitionErrorsNoInstance')}</Callout>
                    <Spacer size={10} />
                </>
            );
        } else {
            if (!errors) {
                return <Spinner size={14} />;
            }
            return (
                <MultiSelect
                    simple
                    default_items={[{ name: 'All' }, ...errors]}
                    name="errors"
                    onChange={handleDataUpdate}
                    value={newData?.errors}
                />
            );
        }
    };

    return (
        <CustomDialog
            onClose={onClose}
            isOpen
            title={t('EditingTransition')}
            noBottomPad
            style={{ width: '80vw', height: '80vh' }}
        >
            <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper>
                    <FieldWrapper padded>
                        <FieldLabel label={t('Condition')} isValid={isConditionValid()} info={t('Optional')} />
                        <FieldInputWrapper>
                            <RadioField
                                name="conditionType"
                                onChange={(_name, value) => {
                                    handleDataUpdate('condition', null);
                                    setConditionType(value);
                                }}
                                value={conditionType}
                                items={[{ value: 'custom' }, { value: 'connector' }, { value: 'none' }]}
                            />
                            {conditionType && conditionType !== 'none' ? (
                                <>
                                    <Spacer size={20} />
                                    {renderConditionField()}
                                </>
                            ) : null}
                        </FieldInputWrapper>
                    </FieldWrapper>
                    <FieldWrapper padded>
                        <FieldLabel label={t('Errors')} isValid info={t('Optional')} />
                        <FieldInputWrapper>{renderErrorsField()}</FieldInputWrapper>
                    </FieldWrapper>
                </ContentWrapper>
                <ActionsWrapper style={{ padding: '10px' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button text={t('Reset')} icon={'history'} onClick={() => setNewData(data)} />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={!isDataValid()}
                            icon={'tick'}
                            name={`fsn-submit-state`}
                            intent={Intent.SUCCESS}
                            onClick={() => onSubmit(stateId, index, newData)}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMTransitionDialog;
