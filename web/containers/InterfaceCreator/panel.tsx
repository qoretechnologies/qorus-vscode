import React, { FunctionComponent, useState, FormEvent } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import { size, map, filter, find, includes, reduce, camelCase, upperFirst } from 'lodash';
import SidePanel from '../../components/SidePanel';
import FieldSelector from '../../components/FieldSelector';
import Content from '../../components/Content';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import Field from '../../components/Field';
import FieldLabel from '../../components/FieldLabel';
import styled from 'styled-components';
import FieldActions from '../../components/FieldActions';
import { InputGroup, Intent, ButtonGroup, Button, Classes } from '@blueprintjs/core';
import { validateField } from '../../helpers/validations';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    onSubmit: () => void;
    t: TTranslator;
}

export interface IField {
    get_message?: { action: string; object_type: string; return_value?: string };
    return_message?: { action: string; object_type: string; return_value?: string };
    style?: string;
    type?: string;
    default_value?: string;
    items?: { value: string; icon_filename: string }[];
    prefill?: any;
    name: string;
    mandatory?: boolean;
    selected?: boolean;
    fields?: string[];
    value?: any;
    isValid?: boolean;
    hasValueSet?: boolean;
}

export declare interface IFieldChange {
    onChange: (fieldName: string, value: any) => void;
}

const FieldWrapper = styled.div`
    display: flex;
    flex-flow: row;
    &:not(:first-child) {
        margin-top: 20px;
    }
    flex: none;
`;

const FieldInputWrapper = styled.div`
    flex: 1 auto;
`;

const SearchWrapper = styled.div`
    flex: 0;
    margin-bottom: 10px;
`;
const ContentWrapper = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 10px;
`;

const ActionsWrapper = styled.div`
    flex: 0;
    margin-top: 10px;
`;

const InterfaceCreatorPanel: FunctionComponent<IInterfaceCreatorPanel> = ({
    type,
    addMessageListener,
    postMessage,
    t,
    fields,
    setFields,
    selectedFields,
    setSelectedFields,
    query,
    setQuery,
    selectedQuery,
    setSelectedQuery,
    onSubmit,
}) => {
    const [show, setShow] = useState<boolean>(false);

    useEffectOnce(() => {
        const messageListenerHandler: () => void = addMessageListener(
            Messages.FIELDS_FETCHED,
            ({ fields: newFields, ...rest }: { newFields: { [key: string]: IField } }) => {
                if (!fields.length) {
                    // Mark the selected fields
                    const transformedFields: IField[] = map(newFields, (field: IField) => ({
                        ...field,
                        selected: field.mandatory !== false,
                        isValid: false,
                    }));
                    // Pull the pre-selected fields
                    const preselectedFields: IField[] = filter(transformedFields, (field: IField) => field.selected);
                    // Save preselected fields
                    setSelectedFields(type, preselectedFields);
                    // Save the fields
                    setFields(type, transformedFields);
                }
                // Set show
                setShow(true);
            }
        );
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type });

        return () => {
            messageListenerHandler();
        };
    });

    const resetFields: () => void = () => {
        setShow(false);
        postMessage(Messages.GET_FIELDS, { iface_kind: type });
    };

    const addField: (fieldName: string) => void = fieldName => {
        // Remove the field
        setFields(type, (current: IField[]) =>
            map(current, (field: IField) => ({
                ...field,
                selected: fieldName === field.name ? true : field.selected,
            }))
        );
        // Get the field
        const field: IField = find(fields, (field: IField) => field.name === fieldName);
        // Add the field to selected list
        setSelectedFields(type, (current: IField[]) => [
            ...current,
            {
                ...field,
                selected: true,
            },
        ]);
    };

    const removeField: (fieldName: string) => void = fieldName => {
        // Remove the field
        setFields(type, (current: IField[]) =>
            map(current, (field: IField) => ({
                ...field,
                selected: fieldName === field.name ? false : field.selected,
            }))
        );
        // Add the field to selected list
        setSelectedFields(type, (current: IField[]) => filter(current, (field: IField) => field.name !== fieldName));
    };

    const handleAddClick: (fieldName: string) => void = fieldName => {
        addField(fieldName);
    };

    const handleFieldChange: (fieldName: string, value: any, explicit?: boolean) => void = (
        fieldName,
        value,
        explicit
    ) => {
        setSelectedFields(
            type,
            (currentFields: IField[]): IField[] => {
                return currentFields.reduce((newFields: IField[], currentField: IField): IField[] => {
                    // Check if the field matches
                    if (currentField.name === fieldName) {
                        // Check if this field prefills any other fields
                        const prefills: IField[] = currentFields.filter((field: IField) => field.prefill === fieldName);
                        // Update the value of all of the prefill field
                        // But only if they did not set the value themselves
                        if (prefills.length) {
                            prefills.forEach((field: IField) => {
                                // Check if the field already has a value set
                                // by its self
                                if (!field.hasValueSet) {
                                    // Modify the field
                                    setTimeout(() => {
                                        handleFieldChange(field.name, value, true);
                                    }, 300);
                                }
                            });
                        }
                        // Check if this field needs style changes
                        if (currentField.style) {
                            // Modify the value based on the style
                            switch (currentField.style) {
                                case 'PascalCase':
                                    value = upperFirst(camelCase(value));
                                    break;
                                case 'camelCase':
                                    value = camelCase(value);
                                    break;
                                default:
                                    break;
                            }
                        }
                        // Run the validation for this type
                        const isValid: boolean = validateField(currentField.type || 'string', value, currentField);
                        // Add the value
                        return [
                            ...newFields,
                            {
                                ...currentField,
                                value,
                                hasValueSet: !explicit,
                                isValid,
                            },
                        ];
                    }
                    // Return unchanged fields
                    return [...newFields, { ...currentField }];
                }, []);
            }
        );
    };

    // check if the form is valid
    const isFormValid: () => boolean = () => selectedFields.every(({ isValid }: IField) => isValid);

    const handleAddAll: () => void = () => {
        // Add all remaning fields that are
        // not yet selected
        fields.forEach(
            (field: IField): void => {
                if (!field.selected) {
                    addField(field.name);
                }
            }
        );
    };

    const handleSubmitClick: () => void = () => {
        if (onSubmit) {
            onSubmit();
        } else {
            // Build the finished object
            const data: { [key: string]: any } = reduce(
                selectedFields,
                (result: { [key: string]: any }, field: IField) => ({
                    ...result,
                    [field.name]: field.value,
                }),
                {}
            );

            postMessage(Messages.CREATE_INTERFACE, { iface_kind: type, data });
        }
    };

    if (!size(fields) || !show) {
        return <p>{t('LoadingFields')}</p>;
    }

    // Filter out the selected fields
    const fieldList: IField[] = filter(fields, (field: IField) => {
        // Only included unselected fields
        if (!field.selected) {
            // Check if the query is set
            if (query !== '') {
                return includes(field.name.toLowerCase(), query.toLowerCase());
            } else {
                return true;
            }
        } else {
            return false;
        }
    });

    // Filter out the selected fields
    const selectedFieldList: IField[] = filter(selectedFields, (field: IField) => {
        // Only included unselected fields
        if (field.selected) {
            // Check if the query is set
            if (selectedQuery !== '') {
                return includes(field.name.toLowerCase(), selectedQuery.toLowerCase());
            } else {
                return true;
            }
        } else {
            return false;
        }
    });

    return (
        <>
            <SidePanel>
                <SearchWrapper>
                    <InputGroup
                        placeholder={t('FilterAvailableFields')}
                        value={query}
                        onChange={(event: FormEvent<HTMLInputElement>) => setQuery(type, event.currentTarget.value)}
                        leftIcon={'search'}
                        intent={query !== '' ? Intent.PRIMARY : Intent.NONE}
                    />
                </SearchWrapper>
                <ContentWrapper>
                    {fieldList.length ? (
                        map(fieldList, (field: any) => (
                            <FieldSelector name={field.name} type={field.type} onClick={handleAddClick} />
                        ))
                    ) : (
                        <p className={Classes.TEXT_MUTED}>No fields available</p>
                    )}
                </ContentWrapper>
                {fieldList.length ? (
                    <ActionsWrapper>
                        <ButtonGroup fill>
                            <Button text={t('SelectAll')} icon={'plus'} onClick={handleAddAll} />
                        </ButtonGroup>
                    </ActionsWrapper>
                ) : null}
            </SidePanel>
            <Content>
                <SearchWrapper>
                    <InputGroup
                        placeholder={t('FilterSelectedFields')}
                        value={selectedQuery}
                        onChange={(event: FormEvent<HTMLInputElement>) =>
                            setSelectedQuery(type, event.currentTarget.value)
                        }
                        leftIcon={'search'}
                        intent={selectedQuery !== '' ? Intent.PRIMARY : Intent.NONE}
                    />
                </SearchWrapper>
                <ContentWrapper>
                    {map(selectedFieldList, (field: IField) => (
                        <FieldWrapper key={field.name}>
                            <FieldLabel label={t(`field-label-${field.name}`)} isValid={field.isValid} />
                            <FieldInputWrapper>
                                <Field
                                    {...field}
                                    onChange={handleFieldChange}
                                    prefill={
                                        field.prefill &&
                                        selectedFieldList.find((preField: IField) => preField.name === field.prefill)
                                    }
                                />
                            </FieldInputWrapper>
                            <FieldActions
                                desc={t(`field-desc-${field.name}`)}
                                name={field.name}
                                onClick={removeField}
                                removable={field.mandatory === false}
                            />
                        </FieldWrapper>
                    ))}
                </ContentWrapper>
                <ActionsWrapper>
                    <ButtonGroup fill>
                        <Button text={t('Reset')} icon={'history'} onClick={resetFields} />
                        <Button
                            text={t('Submit')}
                            disabled={!isFormValid()}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                            onClick={handleSubmitClick}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </>
    );
};

export default compose(
    withTextContext(),
    withMessageHandler(),
    withFieldsConsumer(),
    mapProps(({ type, fields, selectedFields, query, selectedQuery, ...rest }) => ({
        fields: fields[type],
        selectedFields: selectedFields[type],
        query: query[type],
        selectedQuery: selectedQuery[type],
        type,
        ...rest,
    }))
)(InterfaceCreatorPanel);
