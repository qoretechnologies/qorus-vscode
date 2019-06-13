import React, { FunctionComponent, useState, FormEvent } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import { size, map, filter, find, includes, reduce } from 'lodash';
import SidePanel from '../../components/SidePanel';
import FieldSelector from '../../components/FieldSelector';
import Content from '../../components/Content';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import Field from '../../components/Field';
import FieldLabel from '../../components/FieldLabel';
import styled from 'styled-components';
import FieldActions from '../../components/FieldActions';
import { InputGroup, Intent, ButtonGroup, Button, Classes } from '@blueprintjs/core';
import { validateField } from '../../helpers/validations';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    t: TTranslator;
}

export interface IField {
    get_message?: { action: string; object_type: string; return_value?: string };
    return_message?: { action: string; object_type: string; return_value?: string };
    style?: string;
    type?: string;
    default_value?: string;
    values?: string[];
    prefill?: any;
    name: string;
    mandatory?: boolean;
    selected?: boolean;
    fields?: string[];
    value?: any;
    isValid: boolean;
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
}) => {
    const [fields, setFields] = useState<IField[]>([]);
    const [selectedFields, setSelectedFields] = useState<IField[]>([]);
    const [query, setQuery] = useState<string>('');
    const [selectedQuery, setSelectedQuery] = useState<string>('');

    useEffectOnce(() => {
        addMessageListener(Messages.FIELDS_FETCHED, ({ fields }: { fields: { [key: string]: IField } }) => {
            // Mark the selected fields
            const transformedFields: IField[] = map(fields, (field: IField, fieldName: string) => ({
                ...field,
                name: fieldName,
                selected: field.mandatory !== false,
                isValid: false,
            }));
            // Pull the pre-selected fields
            const preselectedFields: IField[] = filter(transformedFields, (field: IField) => field.selected);
            // Save preselected fields
            setSelectedFields(preselectedFields);
            // Save the fields
            setFields(transformedFields);

            console.log(transformedFields);
        });
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type });
    });

    const addField: (fieldName: string) => void = fieldName => {
        // Remove the field
        setFields((current: IField[]) =>
            map(current, (field: IField) => ({
                ...field,
                selected: fieldName === field.name ? true : field.selected,
            }))
        );
        // Get the field
        const field: IField = find(fields, (field: IField) => field.name === fieldName);
        // Add the field to selected list
        setSelectedFields((current: IField[]) => [
            ...current,
            {
                ...field,
                selected: true,
            },
        ]);
    };

    const removeField: (fieldName: string) => void = fieldName => {
        // Remove the field
        setFields((current: IField[]) =>
            map(current, (field: IField) => ({
                ...field,
                selected: fieldName === field.name ? false : field.selected,
            }))
        );
        // Add the field to selected list
        setSelectedFields((current: IField[]) => filter(current, (field: IField) => field.name !== fieldName));
    };

    const handleAddClick: (fieldName: string) => void = fieldName => {
        addField(fieldName);
    };

    const handleFieldChange: (fieldName: string, value: any) => void = (fieldName, value) => {
        setSelectedFields(
            (currentFields: IField[]): IField[] => {
                return currentFields.reduce((newFields: IField[], currentField: IField): IField[] => {
                    // Check if the field matches
                    if (currentField.name === fieldName) {
                        // Run the validation for this type
                        const isValid: boolean = validateField(currentField.type || 'string', value, currentField);
                        // Add the value
                        return [
                            ...newFields,
                            {
                                ...currentField,
                                value,
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
        // Build the finished object
        const data: { [key: string]: any } = reduce(
            selectedFields,
            (result: { [key: string]: any }, field: IField) => ({
                ...result,
                [field.name]: field.value,
            }),
            {}
        );

        console.log(data);
    };

    if (!size(fields)) {
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
                        onChange={(event: FormEvent<HTMLInputElement>) => setQuery(event.currentTarget.value)}
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
                        onChange={(event: FormEvent<HTMLInputElement>) => setSelectedQuery(event.currentTarget.value)}
                        leftIcon={'search'}
                        intent={selectedQuery !== '' ? Intent.PRIMARY : Intent.NONE}
                    />
                </SearchWrapper>
                <ContentWrapper>
                    {map(selectedFieldList, (field: IField) => (
                        <FieldWrapper key={field.name}>
                            <FieldLabel label={t(`field-label-${field.name}`)} isValid={field.isValid} />
                            <FieldInputWrapper>
                                <Field {...field} onChange={handleFieldChange} />
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
    withMessageHandler()
)(InterfaceCreatorPanel);
