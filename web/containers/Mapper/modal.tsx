import React, { FC, useState } from 'react';

import set from 'lodash/set';
import useMount from 'react-use/lib/useMount';

import { Button, ButtonGroup, Callout } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import CustomDialog from '../../components/CustomDialog';
import BooleanField from '../../components/Field/boolean';
import MarkdownPreview from '../../components/Field/markdownPreview';
import SelectField from '../../components/Field/select';
import String from '../../components/Field/string';
import TextareaField from '../../components/Field/textarea';
import FieldLabel from '../../components/FieldLabel';
import Box from '../../components/ResponsiveBox';
import { validateField } from '../../helpers/validations';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { ActionsWrapper, ContentWrapper, FieldInputWrapper, FieldWrapper } from '../InterfaceCreator/panel';

export interface IMapperFieldModalProps {
    type: 'inputs' | 'outputs';
    onClose: () => any;
    onSubmit: (data: any) => any;
    t: TTranslator;
    initialData: any;
    siblings: any;
    fieldData: any;
    isParentCustom?: boolean;
}

const defaultData: any = {
    name: '',
    desc: '',
    type: null,
    isCustom: true,
    canBeNull: false,
};

const MapperFieldModal: FC<IMapperFieldModalProps> = ({
    type,
    siblings,
    onClose,
    fieldData,
    onSubmit,
    t,
    initialData,
    isParentCustom,
}) => {
    const transformFieldData = fieldData => {
        // Save the typename
        const typename = fieldData.type.name;
        // Check if the field has a maybe type
        if (typename.startsWith('*')) {
            // Remove the asterisk
            fieldData.type.name = typename.replace('*', '');
            // Set the maybe type
            fieldData.canBeNull = true;
        }
        // Return the fieldData
        return fieldData;
    };

    const [field, setField] = useState(fieldData ? transformFieldData(fieldData) : defaultData);
    const [types, setTypes] = useState(null);
    const [error, setError] = useState(null);

    useMount(() => {
        (async () => {
            // Fetch the available types
            const types: any = await initialData.fetchData(
                `dataprovider/basetypes${type === 'outputs' ? '?soft=1' : ''}`
            );
            if (types.error) {
                setError(t('UnableToRetrieveTypes'));
            } else {
                // Save the types
                setTypes(types.data);
            }
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
            const fieldType = types.find(type => type.name === value);
            // Set the type
            newField.type = fieldType;
            // If type is auto
            if (value === 'auto') {
                newField.canBeNull = false;
            }
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

    const handleSubmit = () => {
        // Save the field
        const newField = { ...field };
        // Check if the field can be null
        if (newField.canBeNull) {
            let type = newField.type.name;
            // Get the actual type
            // Check if there is a `<` in the type
            const pos: number = type.indexOf('<');
            // If there is a <
            if (pos > 0) {
                // Get the type from start to the position of the `<`
                type = type.slice(0, pos);
            }
            // Transform the field type to the
            // same maybe type
            newField.type = types.find(t => t.typename === `*${type.replace('soft', '')}`);
        }
        // If parent is not a custom field, set this as the first
        // custom field in the hierarchy
        if (!isParentCustom) {
            newField.firstCustomInHierarchy = true;
        }
        // Submit the field
        onSubmit(newField);
        onClose();
    };

    return (
        <CustomDialog isOpen title={t('AddNewField')} onClose={onClose} style={{ paddingBottom: 0 }}>
            <Box top fill scrollY>
                <ContentWrapper>
                    {error && <Callout intent="danger">{error}</Callout>}
                    {!types && !error && <p>Loading...</p>}
                    {types && (
                        <>
                            <FieldWrapper>
                                <FieldLabel
                                    label={t(`field-label-name`)}
                                    isValid={validateField('string', field.name) && isUnique(field.name)}
                                />
                                <FieldInputWrapper>
                                    <String
                                        onChange={(path, value) => onChange(path, value.trim())}
                                        name="name"
                                        value={field.name}
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                            <FieldWrapper>
                                <FieldLabel
                                    info={t('MarkdownSupported')}
                                    label={t(`field-label-desc`)}
                                    isValid={validateField('string', field.desc)}
                                />
                                <FieldInputWrapper>
                                    <TextareaField fill onChange={onChange} name="desc" value={field.desc} />
                                    <MarkdownPreview value={field.desc} />
                                </FieldInputWrapper>
                            </FieldWrapper>
                            <FieldWrapper>
                                <FieldLabel label={t(`field-label-type`)} isValid={!!field.type} />
                                <FieldInputWrapper>
                                    <SelectField
                                        simple
                                        defaultItems={types
                                            .filter(type => !type.name.startsWith('*'))
                                            .map(type => ({
                                                name: type.name,
                                                desc: '',
                                            }))}
                                        onChange={onTypeChange}
                                        name="type.name"
                                        value={field.type?.name}
                                    />
                                </FieldInputWrapper>
                            </FieldWrapper>
                            {field.type?.name !== 'auto' && (
                                <FieldWrapper>
                                    <FieldLabel label={t(`field-label-can_be_undefined`)} isValid />
                                    <FieldInputWrapper>
                                        <BooleanField onChange={onChange} name="canBeNull" value={field.canBeNull} />
                                    </FieldInputWrapper>
                                </FieldWrapper>
                            )}
                        </>
                    )}
                </ContentWrapper>
                <ActionsWrapper style={{ marginTop: 20 }}>
                    <ButtonGroup fill>
                        <Button
                            text="Reset"
                            icon="history"
                            onClick={() => {
                                setField(fieldData ? transformFieldData(fieldData) : defaultData);
                            }}
                        />
                        <Button
                            intent="success"
                            text="Submit"
                            icon="small-tick"
                            disabled={!isFieldValid()}
                            onClick={handleSubmit}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Box>
        </CustomDialog>
    );
};

export default withInitialDataConsumer()(MapperFieldModal);
