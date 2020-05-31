import React, { useState, useContext } from 'react';
import CustomDialog from '../../../components/CustomDialog';
import { IFSMState } from '.';
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

export interface IFSMStateDialogProps {
    onClose: () => any;
    data: IFSMState;
    id: string;
}

const FSMStateDialog: React.FC<IFSMStateDialogProps> = ({ onClose, data, id, onSubmit }) => {
    const [newData, setNewData] = useState<IFSMState>(data);
    const t = useContext(TextContext);

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => ({
            ...cur,
            [name]: value,
        }));
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
                        <FieldLabel label={t('Name')} isValid={validateField('string', newData.name)} />
                        <FieldInputWrapper>
                            <String name="name" onChange={handleDataUpdate} value={newData.name} />
                        </FieldInputWrapper>
                    </FieldWrapper>
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
                </ContentWrapper>
                <ActionsWrapper>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button text={t('Reset')} icon={'history'} onClick={() => setNewData(data)} />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={true}
                            icon={'tick'}
                            name={`fsn-submit-state`}
                            intent={Intent.SUCCESS}
                            onClick={() => onSubmit(newData)}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default FSMStateDialog;
