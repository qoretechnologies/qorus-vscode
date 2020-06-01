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
import { ButtonGroup, Tooltip, Button, Intent } from '@blueprintjs/core';
import { Messages } from '../../../constants/messages';
import find from 'lodash/find';
import RadioField from '../../../components/Field/radioField';

export interface IFSMTransitionDialogProps {
    onClose: () => any;
    data: IFSMTransition;
    stateId: number;
    index: number;
    onSubmit: (stateId: number, index: number, newData: IFSMTransition) => void;
}

const FSMTransitionDialog: React.FC<IFSMTransitionDialogProps> = ({ onClose, data, stateId, index, onSubmit }) => {
    const getConditionType: (condition: any) => 'custom' | 'connector' = (condition) => {
        return !condition || typeof condition === 'string' ? 'custom' : 'connector';
    };

    const [newData, setNewData] = useState<IFSMTransition>(data);
    const [conditionType, setConditionType] = useState<'custom' | 'connector'>(getConditionType(data?.condition));
    const t = useContext(TextContext);

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => ({
            ...cur,
            [name]: value,
        }));
    };

    const isDataValid: () => boolean = () => {
        return (
            (!newData['input-type'] || validateField('type-selector', newData['input-type'])) &&
            (!newData['output-type'] || validateField('type-selector', newData['output-type']))
        );
    };

    return (
        <CustomDialog
            onClose={onClose}
            isOpen
            title={t('EditingState')}
            noBottomPad
            style={{ width: '80vw', height: '80vh' }}
        >
            <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper>
                    <FieldWrapper padded>
                        <FieldLabel label={t('ConditionType')} isValid info={t('Optional')} />
                        <FieldInputWrapper>
                            <RadioField
                                name="conditionType"
                                onChange={(name, value) => setConditionType(value)}
                                value={conditionType}
                                items={[{ value: 'custom' }, { value: 'connector' }]}
                            />
                        </FieldInputWrapper>
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
