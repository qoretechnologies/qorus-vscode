import React, { useContext, useState } from 'react';

import Content from '../../../components/Content';
import CustomDialog from '../../../components/CustomDialog';
import SelectField from '../../../components/Field/select';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import { TextContext } from '../../../context/text';
import { ContentWrapper, FieldInputWrapper, FieldWrapper, ActionsWrapper } from '../panel';
import { validateField } from '../../../helpers/validations';
import { ButtonGroup, Tooltip, Button, Intent } from '@blueprintjs/core';

const PipelineElementDialog = ({ onClose, data, onSubmit }) => {
    const t = useContext(TextContext);
    const [newData, setNewData] = useState(data);

    const handleDataUpdate = (name: string, value: any) => {
        setNewData((cur) => {
            const result = { ...cur };
            //* If the user is changing type, remove children and name
            if (name === 'type') {
                result.children = value === 'queue' ? [] : null;
                result._children = value === 'queue' ? [] : null;
                result.name = null;
            }

            return { ...result, [name]: value };
        });
    };

    const isDataValid = () => {
        return validateField('string', newData.type) && validateField('string', newData.name);
    };

    return (
        <CustomDialog onClose={onClose} isOpen title={t('EditingState')} style={{ width: '50vw', paddingBottom: 0 }}>
            <Content style={{ paddingLeft: 0, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper>
                    <FieldWrapper padded>
                        <FieldLabel label={t('Type')} isValid={validateField('string', newData.type)} />
                        <FieldInputWrapper>
                            <SelectField
                                defaultItems={[{ name: 'queue' }, { name: 'mapper' }, { name: 'processor' }]}
                                onChange={handleDataUpdate}
                                value={newData.type}
                                name="type"
                            />
                        </FieldInputWrapper>
                    </FieldWrapper>
                    {newData?.type && (
                        <FieldWrapper padded>
                            <FieldLabel label={t('Name')} isValid={validateField('string', newData.name)} />
                            <FieldInputWrapper>
                                <SelectField
                                    key={newData.type}
                                    onChange={handleDataUpdate}
                                    value={newData.name}
                                    name="name"
                                    get_message={{
                                        action: 'creator-get-objects',
                                        object_type:
                                            newData.type === 'processor' ? 'class-with-processor' : newData.type,
                                    }}
                                    return_message={{
                                        action: 'creator-return-objects',
                                        object_type:
                                            newData.type === 'processor' ? 'class-with-processor' : newData.type,
                                        return_value: 'objects',
                                    }}
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                    )}
                </ContentWrapper>
                <ActionsWrapper style={{ padding: '10px' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
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
                            onClick={() => {
                                onSubmit(newData);
                                onClose();
                            }}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

export default PipelineElementDialog;
