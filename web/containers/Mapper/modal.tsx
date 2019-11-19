import React, { FC, useState, useCallback } from 'react';
import { Button, Dialog, ButtonGroup } from '@blueprintjs/core';
import { TTranslator } from '../../App';
import Box from '../../components/ResponsiveBox';
import set from 'lodash/set';
import size from 'lodash/size';
import String from '../../components/Field/string';
import { ContentWrapper, FieldWrapper, FieldInputWrapper, ActionsWrapper } from '../InterfaceCreator/panel';
import FieldLabel from '../../components/FieldLabel';
import { validateField } from '../../helpers/validations';
import SelectField from '../../components/Field/select';
import Pull from '../../components/Pull';
import useMount from 'react-use/lib/useMount';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

export interface IMapperFieldModalProps {
    type: 'input' | 'output';
    onClose: () => any;
    onSubmit: (data: any) => any;
    t: TTranslator;
    initialData: any;
    siblings: any;
    fieldData: any;
}

const defaultData: any = {
    name: '',
    desc: '',
    type: null,
    isCustom: true,
};

const MapperFieldModal: FC<IMapperFieldModalProps> = ({ siblings, onClose, fieldData, onSubmit, t, initialData }) => {
    const [field, setField] = useState(fieldData || defaultData);
    const [types, setTypes] = useState(null);

    useMount(() => {
        (async () => {
            // Fetch the available types
            const types: any = await initialData.fetchData('dataprovider/basetypes');
            // Save the types
            setTypes(types.data);
        })();
    });

    const onChange: (path: string, value: any) => void = (path, value) => {
        setField(current => {
            const newField = { ...current };
            set(newField, path, value);
            return newField;
        });
    };

    const onTypeChange: (_path: string, value: any) => void = (_path, value) => {
        setField(current => {
            const newField = { ...current };
            // Find the type based on the name
            const fieldType = types.find(type => type.typename === value);
            // Set the type
            newField.type = fieldType;
            // Return new field
            return newField;
        });
    };

    const isUnique: (name: string) => boolean = name =>
        !Object.keys(siblings).find((sibling: string) => sibling === name);

    const isFieldValid: () => boolean = () => {
        const isNameValid: boolean = validateField('string', field.name) && isUnique(field.name);
        const isDescValid: boolean = validateField('desc', field.name);
        const isTypeValid: boolean = !!field.type;

        return isNameValid && isDescValid && isTypeValid;
    };

    return (
        <Dialog isOpen title={t('AddNewField')} onClose={onClose} style={{ paddingBottom: 0 }}>
            <Box top fill scrollY>
                <ContentWrapper>
                    {!types && <p>Loading...</p>}
                    {types && (
                        <>
                            <FieldWrapper>
                                <FieldLabel
                                    label={t(`field-label-name`)}
                                    isValid={validateField('string', field.name) && isUnique(field.name)}
                                />
                                <FieldInputWrapper>
                                    <String onChange={onChange} name='name' value={field.name} />
                                </FieldInputWrapper>
                            </FieldWrapper>
                            <FieldWrapper>
                                <FieldLabel
                                    label={t(`field-label-desc`)}
                                    isValid={validateField('string', field.desc)}
                                />
                                <FieldInputWrapper>
                                    <String onChange={onChange} name='desc' value={field.desc} />
                                </FieldInputWrapper>
                            </FieldWrapper>
                            <FieldWrapper>
                                <FieldLabel label={t(`field-label-type`)} isValid={!!field.type} />
                                <FieldInputWrapper>
                                    <SelectField
                                        simple
                                        defaultItems={types.map(type => ({
                                            name: type.typename,
                                            desc: '',
                                        }))}
                                        onChange={onTypeChange}
                                        name='type.typename'
                                        value={field.type?.typename}
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                        </>
                    )}
                </ContentWrapper>
                <ActionsWrapper style={{ marginTop: 20 }}>
                    <ButtonGroup fill>
                        <Button
                            text='Reset'
                            icon='history'
                            onClick={() => {
                                setField(defaultData);
                            }}
                        />
                        <Button
                            intent='success'
                            text='Submit'
                            icon='small-tick'
                            disabled={!isFieldValid()}
                            onClick={() => {
                                onSubmit(field);
                                onClose();
                            }}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Box>
        </Dialog>
    );
};

export default withInitialDataConsumer()(MapperFieldModal);
