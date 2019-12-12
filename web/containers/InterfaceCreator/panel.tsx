import React, { FunctionComponent, useState, FormEvent, useEffect, useRef, useCallback } from 'react';
import useEffectOnce from 'react-use/lib/useEffectOnce';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';
import { size, map, filter, find, includes, reduce, camelCase, upperFirst, omit } from 'lodash';
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
import { InputGroup, Intent, ButtonGroup, Button, Classes, Tooltip, Dialog } from '@blueprintjs/core';
import { validateField } from '../../helpers/validations';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import ConfigItemManager from '../ConfigItemManager';
import ManageConfigButton from '../ConfigItemManager/manageButton';
import { allowedTypes } from '../../components/Field/arrayAuto';
import shortid from 'shortid';
import isArray from 'lodash/isArray';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    onSubmit: (fields: any) => void;
    t: TTranslator;
    methodsList: { id: number; name: string }[];
    forceSubmit?: boolean;
    resetFields: (type: string) => void;
    openFileOnSubmit: boolean;
    hasConfigManager?: boolean;
    parent?: string;
    fileName?: string;
    fields: IField[];
    selectedFields: IField[];
    setFields: (type: string, fields: IField[] | Function, activeId?: number) => void;
    setSelectedFields: (type: string, fields: IField[] | Function, activeId?: number) => void;
    query?: string;
    setQuery: (type: string, value?: string) => void;
    selectedQuery?: string;
    setSelectedQuery: (type: string, value?: string) => void;
    activeId?: number;
    onNameChange?: (activeId: number, newName: string) => any;
    isFormValid: (type: string) => boolean;
    stepOneTitle?: string;
    stepTwoTitle?: string;
    submitLabel?: string;
    onBackClick?: () => void;
    allSelectedFields: { [type: string]: IField[] };
    data?: any;
    onDataFinishLoading?: () => any;
    isEditing?: boolean;
    allMethodsData?: any[];
    initialData?: any;
    interfaceId?: string;
    initialInterfaceId?: string;
    setInterfaceId: (interfaceType: string, id: string) => void;
    disabledFields?: string[];
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
    internal?: boolean;
    on_change?: string | string[];
    notify_on_remove?: boolean;
    notify_on_add?: boolean;
    markdown?: boolean;
    disabled?: boolean;
    requires_fields?: string[];
}

export declare interface IFieldChange {
    onChange: (fieldName: string, value: any) => void;
}

export const FieldWrapper = styled.div`
    display: flex;
    flex-flow: row;
    &:not(:first-child) {
        margin-top: 20px;
    }
    flex: none;
`;

export const FieldInputWrapper = styled.div`
    flex: 1 auto;
`;

export const SearchWrapper = styled.div`
    flex: 0;
    margin-bottom: 10px;
`;
export const ContentWrapper = styled.div`
    flex: 1;
    overflow-y: auto;
    overflow-x: ${props => (props.scrollX ? 'auto' : 'hidden')};
    padding-right: 10px;
`;

export const ActionsWrapper = styled.div`
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
    activeId,
    onNameChange,
    isFormValid,
    stepOneTitle = 'SelectFieldsTitle',
    stepTwoTitle = 'FillDataTitle',
    submitLabel = 'Submit',
    onBackClick,
    allSelectedFields,
    data,
    onDataFinishLoading,
    isEditing,
    allMethodsData,
    methodsList,
    forceSubmit,
    resetFields,
    openFileOnSubmit,
    initialData,
    hasConfigManager,
    parent,
    fileName,
    interfaceId,
    initialInterfaceId,
    setInterfaceId,
    disabledFields,
}) => {
    const isInitialMount = useRef(true);
    const [show, setShow] = useState<boolean>(false);
    const [messageListener, setMessageListener] = useState(null);
    const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
    const [fieldListeners, setFieldListeners] = useState([]);

    useEffect(() => {
        // Remove the current listeners
        fieldListeners.forEach(listener => {
            listener();
        });
        // Add the message listeners for fields
        setFieldListeners([
            addMessageListener(Messages.CREATOR_ADD_FIELD, ({ field, notify }) => {
                addField(field, notify === true ? true : false);
            }),
            addMessageListener(Messages.CREATOR_REMOVE_FIELD, ({ field, notify }) => {
                removeField(field, notify === true ? true : false);
            }),
            addMessageListener(Messages.CREATOR_ENABLE_FIELD, ({ field }) => {
                toggleDisableField(field, false);
            }),
            addMessageListener(Messages.CREATOR_DISABLE_FIELD, ({ field }) => {
                toggleDisableField(field, true);
            }),
        ]);
    }, [fields]);

    useEffect(() => {
        // Remove the message listener if it exists
        messageListener && messageListener();
        // Create a message listener for this activeId
        const messageListenerHandler = addMessageListener(
            Messages.FIELDS_FETCHED,
            ({ fields: newFields, ...rest }: { newFields: { [key: string]: IField }; iface_kind: string }) => {
                // Register only for this interface
                if (rest.iface_kind === type) {
                    if (!fields || !fields.length) {
                        // Mark the selected fields
                        const transformedFields: IField[] = map(newFields, (field: IField) => ({
                            ...field,
                            selected: (data && data[field.name]) || field.mandatory !== false,
                            isValid:
                                data && data[field.name]
                                    ? validateField(field.type || 'string', data[field.name], field)
                                    : false,
                            value: data ? data[field.name] : undefined,
                            hasValueSet: data && data[field.name],
                        }));
                        // Pull the pre-selected fields
                        const preselectedFields: IField[] = filter(
                            transformedFields,
                            (field: IField) => field.selected
                        );
                        // Add original name field
                        if (isEditing) {
                            preselectedFields.push({
                                name: 'orig_name',
                                value: data && data.name,
                                isValid: true,
                                selected: true,
                                internal: true,
                            });
                        }
                        // Save preselected fields
                        setSelectedFields(type, preselectedFields, activeId);
                        // Save the fields
                        setFields(type, transformedFields, activeId);
                    }
                    // Check if onDataFinish function is set
                    // only do this on initial mount
                    if (onDataFinishLoading && isInitialMount.current) {
                        // Run the callback
                        onDataFinishLoading();
                        // Set the mount to false
                        isInitialMount.current = false;
                    }
                    // Check if the interface id exists, which means user
                    // has already been on this view
                    if (!interfaceId) {
                        // Create it if this is brand new interface
                        setInterfaceId(type, data ? data.iface_id : shortid.generate());
                    }
                    // Set show
                    setShow(true);
                }
            }
        );
        // Set the new message listener
        setMessageListener(() => messageListenerHandler);
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type, is_editing: isEditing });
        // Cleanup on unmount
        return () => {
            // Remove the message listener if it exists
            messageListenerHandler();
        };
    }, [activeId, data]);

    const resetLocalFields: (newActiveId?: number) => void = newActiveId => {
        resetFields(type);
        // Hide the fields until they are fetched
        setShow(false);
        // Change the name if needed
        if (onNameChange) {
            onNameChange(newActiveId, null);
        }
        // Remove the message listener if it exists
        messageListener && messageListener();
        // Create a message listener for this activeId
        const messageListenerHandler = addMessageListener(
            Messages.FIELDS_FETCHED,
            ({ fields: newFields, ...rest }: { newFields: { [key: string]: IField } }) => {
                // Register only for this interface
                if (rest.iface_kind === type) {
                    // Mark the selected fields
                    const transformedFields: IField[] = map(newFields, (field: IField) => ({
                        ...field,
                        selected: (data && data[field.name]) || field.mandatory !== false,
                        isValid:
                            data && data[field.name]
                                ? validateField(field.type || 'string', data[field.name], field)
                                : false,
                        value: data ? data[field.name] : undefined,
                        hasValueSet: data && data[field.name],
                    }));
                    // Pull the pre-selected fields
                    const preselectedFields: IField[] = filter(transformedFields, (field: IField) => field.selected);
                    // Add original name field
                    if (isEditing) {
                        preselectedFields.push({
                            name: 'orig_name',
                            value: data && data.name,
                            isValid: true,
                            selected: true,
                            internal: true,
                        });
                    }
                    // Save preselected fields
                    setSelectedFields(type, preselectedFields, activeId);
                    // Save the fields
                    setFields(type, transformedFields, activeId);
                }
                // Check if onDataFinish function is set
                // only do this on initial mount
                if (onDataFinishLoading && isInitialMount.current) {
                    // Run the callback
                    onDataFinishLoading();
                    // Set the mount to false
                    isInitialMount.current = false;
                }
                // Create / set interface id
                setInterfaceId(type, data ? data.iface_id : shortid.generate());
                // Set show
                setShow(true);
            }
        );
        // Set the new message listener
        setMessageListener(() => messageListenerHandler);
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type, is_editing: isEditing });
    };

    const addField: (fieldName: string, notify?: boolean) => void = useCallback(
        (fieldName, notify = true) => {
            // Check if the field is already selected
            const selectedField: IField = find(selectedFields, (field: IField) => field.name === fieldName);
            // Add it if it's not
            if (!selectedField) {
                // Remove the field
                setFields(
                    type,
                    (current: IField[]) =>
                        map(current, (field: IField) => ({
                            ...field,
                            selected: fieldName === field.name ? true : field.selected,
                        })),
                    activeId
                );
                // Get the field
                const field: IField = find(fields, (field: IField) => field.name === fieldName);
                if (field) {
                    // Add the field to selected list
                    setSelectedFields(
                        type,
                        (current: IField[]) => {
                            // Check if this field should notify
                            if (field.notify_on_add && notify) {
                                postMessage(Messages.CREATOR_FIELD_ADDED, {
                                    field: fieldName,
                                    iface_id: interfaceId,
                                    iface_kind: type,
                                });
                            }
                            return [
                                ...current,
                                {
                                    ...field,
                                    selected: true,
                                },
                            ];
                        },
                        activeId
                    );
                }
            }
        },
        [fields]
    );

    const removeField: (fieldName: string, notify?: boolean) => void = (fieldName, notify = true) => {
        // Remove the field
        setFields(
            type,
            (current: IField[]) => {
                // Check if this field has a remove event
                const field: IField = current.find((f: IField) => f.name === fieldName);

                if (notify && field.notify_on_remove) {
                    postMessage(Messages.CREATOR_FIELD_REMOVED, {
                        field: fieldName,
                        iface_id: interfaceId,
                        iface_kind: type,
                    });
                }

                return map(current, (field: IField) => ({
                    ...field,
                    selected: fieldName === field.name ? false : field.selected,
                }));
            },
            activeId
        );
        // Add the field to selected list
        setSelectedFields(
            type,
            (current: IField[]) => filter(current, (field: IField) => field.name !== fieldName),
            activeId
        );
    };

    const toggleDisableField: (fieldName: string, disabled: boolean) => void = (fieldName, disabled) => {
        setFields(
            type,
            (current: IField[]) =>
                map(current, (field: IField) => ({
                    ...field,
                    disabled: fieldName === field.name ? disabled : field.disabled,
                })),
            activeId
        );
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
                        if (currentField.style && !currentField.hasValueSet) {
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
                        // Validate the field
                        let isValid;
                        // If this is auto field
                        if (currentField.type === 'auto' || currentField.type === 'array-auto') {
                            // Get the type
                            const fieldType = requestFieldData(currentField['type-depends-on'], 'value');
                            // If this is a single field
                            if (currentField.type === 'auto') {
                                // Validate single field
                                isValid = validateField(fieldType, value, currentField);
                            } else {
                                // Check if the type is in allowed types
                                if (allowedTypes.includes(fieldType)) {
                                    // Validate all values
                                    isValid = value.every((val: string | number) =>
                                        validateField(fieldType, val, currentField)
                                    );
                                } else {
                                    isValid = false;
                                }
                            }
                        } else {
                            // Basic field with predefined type
                            isValid = validateField(currentField.type || 'string', value, currentField);
                        }
                        // Check if we should change the name of the
                        // method
                        if (fieldName === 'name' && onNameChange) {
                            // Change the method name in the side panel
                            onNameChange(activeId, value);
                        }
                        // Check if this field has an on_change message
                        if (currentField.on_change) {
                            // Check if on_change is a list
                            const onChange: string[] = isArray(currentField.on_change)
                                ? currentField.on_change
                                : [currentField.on_change];
                            // Post all the actions
                            onChange.forEach(action => {
                                // Post the message with this handler
                                postMessage(action, {
                                    [currentField.name]: value,
                                    iface_kind: type,
                                    iface_id: interfaceId,
                                });
                            });
                        }
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
            },
            activeId
        );
    };

    const handleAddAll: () => void = () => {
        // Add all remaning fields that are
        // not yet selected
        fields.forEach((field: IField): void => {
            if (!field.selected && !field.disabled) {
                addField(field.name);
            }
        });
    };

    const handleSubmitClick: () => void = () => {
        if (onSubmit) {
            onSubmit(selectedFields);
        }

        if (!onSubmit || forceSubmit) {
            let newData: { [key: string]: any };
            // If this is service methods
            if (type === 'service-methods' || type === 'mapper-methods') {
                const intrfType = type === 'service-methods' ? 'service' : 'mapper-code';
                const subItemType = type === 'service-methods' ? 'methods' : 'mapper-methods';
                // Get the service data
                newData = reduce(
                    allSelectedFields[intrfType],
                    (result: { [key: string]: any }, field: IField) => ({
                        ...result,
                        [field.name]: field.value,
                    }),
                    {}
                );
                // Add the methods
                newData[subItemType] = map(allSelectedFields[type], serviceMethod => {
                    return reduce(
                        serviceMethod,
                        (result: { [key: string]: any }, field: IField) => ({
                            ...result,
                            [field.name]: field.value,
                        }),
                        {}
                    );
                });
                // Add missing methods
                if (allMethodsData) {
                    allMethodsData.forEach(method => {
                        // Check if this method exists in the
                        // data hash also check if the method has been deleted
                        if (!newData[subItemType].find(m => m.orig_name === method.name)) {
                            // Add this method
                            newData[subItemType].push(omit({ ...method, orig_name: method.name }, ['id', 'internal']));
                        }
                    });
                }
                // Filter deleted methods
                if (methodsList) {
                    newData[subItemType] = newData[subItemType].filter(m => methodsList.find(ml => ml.name === m.name));
                }
            } else {
                // Build the finished object
                newData = reduce(
                    selectedFields,
                    (result: { [key: string]: any }, field: IField) => ({
                        ...result,
                        [field.name]: field.value,
                    }),
                    {}
                );
            }
            // Set the interface kind
            let iface_kind = type;
            // Service methods use the service type
            if (type === 'service-methods') {
                iface_kind = 'service';
            } else if (type === 'mapper-methods') {
                iface_kind = 'mapper-code';
            }
            // Config items use the parent type
            if (parent) {
                iface_kind = `${parent}:${type}`;
            }
            // Add workflow data with step
            if (type === 'step') {
                // Get the workflow data
                const workflow = reduce(
                    allSelectedFields.workflow,
                    (result: { [key: string]: any }, field: IField) => ({
                        ...result,
                        [field.name]: field.value,
                    }),
                    {}
                );
                postMessage(isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE, {
                    iface_kind,
                    data: newData,
                    orig_data: data,
                    workflow,
                    open_file_on_success: openFileOnSubmit !== false,
                    iface_id: interfaceId,
                });
            } else {
                postMessage(isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE, {
                    iface_kind,
                    data: newData,
                    orig_data:
                        type === 'service-methods'
                            ? initialData.service
                            : type === 'mapper-methods'
                            ? initialData['mapper-code']
                            : data,
                    open_file_on_success: openFileOnSubmit !== false,
                    iface_id: interfaceId,
                });
            }
            // Reset the interface data
            initialData.resetInterfaceData(type);
            // If this is config item, reset only the fields
            // local fields will be unmounted
            if (type === 'config-item') {
                resetFields(type);
            } else {
                // Reset local fields
                resetLocalFields();
            }
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
            if (query && query !== '') {
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
            if (selectedQuery && selectedQuery !== '') {
                return includes(field.name.toLowerCase(), selectedQuery.toLowerCase());
            } else {
                return true;
            }
        } else {
            return false;
        }
    });

    const requestFieldData: (fieldName: string, fieldKey: string) => string = (fieldName, fieldKey) => {
        // Find this field
        const field: IField = selectedFields.find((field: IField) => field.name === fieldName);
        // Check if this field exists & is selected
        if (field) {
            // Return the requested field property
            return field[fieldKey];
        }
        // Return null
        return null;
    };

    const isFieldDisabled: (field: IField) => boolean = field => {
        // Check if the field is disabled on its own
        // or required other field to be added
        if (field.disabled) {
            return true;
        } else if (field.requires_fields) {
            const req = isArray(field.requires_fields) ? field.requires_fields : [field.requires_fields];
            // Check if the required field is valid
            if (selectedFields.filter(sField => req.includes(sField.name)).every(sField => sField.isValid)) {
                return false;
            }
            return true;
        } else if (disabledFields) {
            // Check if this field is in the disabled fields list
            if (disabledFields.includes(field.name)) {
                return true;
            }
        }
        return false;
    };

    const fetchConfigItems: () => void = () => {
        postMessage(Messages.GET_CONFIG_ITEMS, {
            iface_id: interfaceId,
        });
    };

    const isConfigManagerEnabled = () => {
        // Find the base class name field
        const baseClassName: IField = [...fieldList, ...selectedFields].find(
            (field: IField) => field.name === 'base-class-name'
        );
        // Check if the field exists
        if (baseClassName) {
            // Check if the field is mandatory
            if (baseClassName.mandatory === false) {
                // Fetch config items if base class name is not selected
                // and user is editing
                if (!baseClassName.selected && isEditing) {
                    fetchConfigItems();
                }
                // If the base class name is not mandatory
                // enable the config items by default
                return baseClassName.selected ? baseClassName.isValid : true;
            }
            // The field has to be selected and valid
            return baseClassName.isValid;
        }
        // Not valid
        return false;
    };

    return (
        <>
            <SidePanel title={t(stepOneTitle)}>
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
                            <FieldSelector
                                name={field.name}
                                type={field.type}
                                disabled={isFieldDisabled(field)}
                                onClick={handleAddClick}
                            />
                        ))
                    ) : (
                        <p className={Classes.TEXT_MUTED}>No fields available</p>
                    )}
                </ContentWrapper>
                {fieldList.length ? (
                    <ActionsWrapper>
                        <ButtonGroup fill>
                            <Tooltip content={t('SelectAllTooltip')}>
                                <Button text={t('SelectAll')} icon={'plus'} onClick={handleAddAll} />
                            </Tooltip>
                        </ButtonGroup>
                    </ActionsWrapper>
                ) : null}
            </SidePanel>
            <Content title={t(stepTwoTitle)}>
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
                    {map(
                        selectedFieldList,
                        (field: IField) =>
                            !field.internal && (
                                <FieldWrapper key={field.name}>
                                    <FieldLabel
                                        info={field.markdown && t('MarkdownSupported')}
                                        label={t(`field-label-${field.name}`)}
                                        isValid={field.isValid}
                                    />
                                    <FieldInputWrapper>
                                        <Field
                                            {...field}
                                            onChange={handleFieldChange}
                                            requestFieldData={requestFieldData}
                                            interfaceKind={type}
                                            iface_kind={type}
                                            activeId={activeId}
                                            interfaceId={interfaceId}
                                            prefill={
                                                field.prefill &&
                                                selectedFieldList.find(
                                                    (preField: IField) => preField.name === field.prefill
                                                )
                                            }
                                            disabled={isFieldDisabled(field)}
                                        />
                                    </FieldInputWrapper>
                                    <FieldActions
                                        desc={t(`field-desc-${field.name}`)}
                                        name={field.name}
                                        onClick={removeField}
                                        removable={field.mandatory === false}
                                    />
                                </FieldWrapper>
                            )
                    )}
                </ContentWrapper>
                <ActionsWrapper>
                    {hasConfigManager && (
                        <div style={{ float: 'left', width: '48%' }}>
                            <ManageConfigButton
                                disabled={!isConfigManagerEnabled()}
                                onClick={() => setShowConfigItemsManager(true)}
                            />
                        </div>
                    )}
                    <div style={{ float: 'right', width: hasConfigManager ? '48%' : '100%' }}>
                        <ButtonGroup fill>
                            {onBackClick && (
                                <Tooltip content={'BackToooltip'}>
                                    <Button text={t('Back')} icon={'undo'} onClick={() => onBackClick()} />
                                </Tooltip>
                            )}
                            <Tooltip content={t('ResetTooltip')}>
                                <Button
                                    text={t('Reset')}
                                    icon={'history'}
                                    onClick={() => {
                                        resetLocalFields(activeId);
                                        // Reset also config items
                                        postMessage(Messages.RESET_CONFIG_ITEMS, {
                                            iface_id: interfaceId,
                                        });
                                    }}
                                />
                            </Tooltip>
                            <Button
                                text={t(submitLabel)}
                                disabled={!isFormValid(type)}
                                icon={'tick'}
                                intent={Intent.SUCCESS}
                                onClick={handleSubmitClick}
                            />
                        </ButtonGroup>
                    </div>
                </ActionsWrapper>
            </Content>
            {showConfigItemsManager && hasConfigManager ? (
                <Dialog
                    isOpen
                    title={t('ConfigItemsManager')}
                    onClose={() => setShowConfigItemsManager(false)}
                    style={{ width: '80vw', backgroundColor: '#fff' }}
                >
                    <ConfigItemManager
                        type={type}
                        baseClassName={
                            selectedFields &&
                            selectedFields.find((field: IField) => field.name === 'base-class-name')?.value
                        }
                        interfaceId={interfaceId}
                        resetFields={resetFields}
                    />
                </Dialog>
            ) : null}
        </>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext(),
    withMessageHandler(),
    withFieldsConsumer(),
    mapProps(
        ({
            type,
            fields,
            selectedFields,
            query,
            selectedQuery,
            activeId,
            interfaceId,
            initialInterfaceId,
            ...rest
        }) => ({
            fields: activeId ? fields[type][activeId] : fields[type],
            selectedFields: activeId ? selectedFields[type][activeId] : selectedFields[type],
            query: query[type],
            selectedQuery: selectedQuery[type],
            allSelectedFields: selectedFields,
            interfaceId: initialInterfaceId || interfaceId[type],
            type,
            activeId,
            ...rest,
        })
    )
)(InterfaceCreatorPanel);
