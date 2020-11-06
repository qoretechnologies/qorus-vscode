import { Button, ButtonGroup, Classes, InputGroup, Intent, Tooltip } from '@blueprintjs/core';
import {
    camelCase,
    cloneDeep,
    filter,
    find,
    forEach,
    includes,
    map,
    omit,
    reduce,
    size,
    uniqBy,
    upperFirst,
} from 'lodash';
import isArray from 'lodash/isArray';
import React, { FormEvent, FunctionComponent, useContext, useEffect, useRef, useState } from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import shortid from 'shortid';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import Content from '../../components/Content';
import CustomDialog from '../../components/CustomDialog';
import Field from '../../components/Field';
import { allowedTypes } from '../../components/Field/arrayAuto';
import FieldActions from '../../components/FieldActions';
import FieldLabel from '../../components/FieldLabel';
import FieldSelector from '../../components/FieldSelector';
import Loader from '../../components/Loader';
import SidePanel from '../../components/SidePanel';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { maybeSendOnChangeEvent } from '../../helpers/common';
import { getTypeFromValue, maybeParseYaml, validateField } from '../../helpers/validations';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, { TMessageListener, TPostMessage } from '../../hocomponents/withMessageHandler';
import withMethodsConsumer from '../../hocomponents/withMethodsConsumer';
import withStepsConsumer from '../../hocomponents/withStepsConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ClassConnectionsManager from '../ClassConnectionsManager';
import ConfigItemManager from '../ConfigItemManager';
import ManageConfigButton from '../ConfigItemManager/manageButton';
import { processSteps } from './workflowsView';

export interface IInterfaceCreatorPanel {
    type: string;
    addMessageListener: TMessageListener;
    postMessage: TPostMessage;
    onSubmit: (fields: any) => void;
    onFinalSubmit: (data: any) => any;
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
    onNameChange?: (activeId: number, newName: string, originalName?: string) => any;
    isFormValid: (type: string) => boolean;
    stepOneTitle?: string;
    stepTwoTitle?: string;
    submitLabel?: string;
    onBackClick?: () => void;
    allSelectedFields: { [type: string]: IField[] };
    data?: any;
    onDataFinishLoading?: () => any;
    onDataFinishLoadingRecur?: (activeId: number) => any;
    isEditing?: boolean;
    allMethodsData?: any[];
    initialData?: any;
    interfaceId?: string;
    initialInterfaceId?: string;
    setInterfaceId: (interfaceType: string, id: string) => void;
    disabledFields?: string[];
    hasClassConnections?: boolean;
    definitionsOnly?: boolean;
    context?: {
        iface_kind: string;
        name: string;
        type?: string;
    };
    onSubmitSuccess: (data?: any) => any;
}

export interface IField {
    get_message?: { action: string; object_type: string; return_value?: string; message_data?: any };
    return_message?: { action: string; object_type: string; return_value?: string };
    style?: string;
    type?: string;
    default_value?: string;
    items?: { value: string; icon_filename: string }[];
    prefill?: any;
    name: string;
    mandatory?: boolean;
    placeholder?: boolean;
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
    resetClassConnections?: () => void;
    read_only?: boolean;
    reference?: {
        iface_kind: string;
        type?: string;
    };
    iface_kind?: string;
}

export declare interface IFieldChange {
    onChange: (fieldName: string, value: any) => void;
}

export const FieldWrapper = styled.div<{ padded?: boolean }>`
    display: flex;
    flex-flow: row;
    padding: 15px ${({ padded }) => (padded ? '20px' : 0)};
    flex: none;

    &:nth-child(even) {
        background-color: #fafafa;
    }
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
    overflow-x: auto;
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
    hasConfigManager,
    parent,
    interfaceId,
    setInterfaceId,
    disabledFields,
    hasClassConnections,
    initialInterfaceId,
    resetMethods,
    resetAllInterfaceData,
    isClassConnectionsManagerEnabled,
    classConnectionsData,
    setClassConnectionsData,
    showClassConnectionsManager,
    setShowClassConnectionsManager,
    resetClassConnections,
    areClassConnectionsValid,
    removeCodeFromRelations,
    steps,
    stepsData,
    definitionsOnly,
    context,
    onSubmitSuccess,
    setAsDraft,
    onDataFinishLoadingRecur,
}) => {
    const isInitialMount = useRef(true);
    const [show, setShow] = useState<boolean>(false);
    const [messageListener, setMessageListener] = useState(null);
    const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
    const [fieldListeners, setFieldListeners] = useState([]);
    const initialData = useContext(InitialContext);

    const getClasses = () => {
        const classes = selectedFields?.find((field: IField) => field.name === 'classes');

        if (classes) {
            return selectedFields?.find((field: IField) => field.name === 'classes')?.value;
        }

        return undefined;
    };

    const fetchConfigItems: (currentIfaceId: string) => void = (currentIfaceId) => {
        postMessage(Messages.GET_CONFIG_ITEMS, {
            iface_id: currentIfaceId || interfaceId,
            iface_kind: type,
            classes: type === 'workflow' ? undefined : getClasses(),
            steps: type === 'workflow' && size(steps) ? processSteps(steps, stepsData) : undefined,
        });
    };

    useEffect(() => {
        // Remove the current listeners
        fieldListeners.forEach((listener) => {
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
                console.log(newFields);
                // Register only for this interface
                if (rest.iface_kind === type) {
                    // Clone initial data
                    const clonedData = cloneDeep(data);
                    if (!fields || !fields.length) {
                        // Mark the selected fields
                        const transformedFields: IField[] = map(newFields, (field: IField) => ({
                            ...field,
                            selected: (clonedData && field.name in clonedData) || field.mandatory !== false,
                            isValid:
                                clonedData && field.name in clonedData
                                    ? validateField(field.type || 'string', clonedData[field.name], field)
                                    : false,
                            value: clonedData && field.name in clonedData ? clonedData[field.name] : undefined,
                            hasValueSet: clonedData && field.name in clonedData,
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
                                value: clonedData && clonedData.name,
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

                    // Check if onDataFinishRecur function is set
                    if (onDataFinishLoadingRecur) {
                        // Run the callback
                        onDataFinishLoadingRecur(activeId);
                    }
                    const currentInterfaceId = data ? clonedData.iface_id : shortid.generate();
                    // Check if the interface id exists, which means user
                    // has already been on this view
                    if (!interfaceId) {
                        // Create it if this is brand new interface
                        setInterfaceId(type, currentInterfaceId);
                    }
                    // Set show
                    setShow(true);
                    // Fetch config items
                    fetchConfigItems(interfaceId || currentInterfaceId);
                }
            }
        );
        // Set the new message listener
        setMessageListener(() => messageListenerHandler);
        // Fetch the fields
        if (type === 'config-item' && isEditing) {
            postMessage(Messages.GET_FIELDS, {
                iface_kind: type,
                is_editing: isEditing,
                context,
                iface_id: interfaceId,
                name: data.name,
            });
        } else {
            postMessage(Messages.GET_FIELDS, { iface_kind: type, is_editing: isEditing, context });
        }
        // Cleanup on unmount
        return () => {
            // Remove the message listener if it exists
            messageListenerHandler();
        };
    }, [activeId, interfaceId, initialInterfaceId]);

    const resetLocalFields: (newActiveId?: number) => void = (newActiveId) => {
        resetAllInterfaceData(type, type !== 'mapper');
        // Hide the fields until they are fetched
        setShow(false);
        // Reset class connecitons
        resetClassConnections && resetClassConnections();
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
                // Deep copy initial data
                const copiedData = cloneDeep(data);
                // Register only for this interface
                if (rest.iface_kind === type) {
                    // Mark the selected fields
                    const transformedFields: IField[] = map(newFields, (field: IField) => ({
                        ...field,
                        selected: (copiedData && copiedData[field.name]) || field.mandatory !== false,
                        isValid:
                            copiedData && copiedData[field.name]
                                ? validateField(field.type || 'string', copiedData[field.name], field)
                                : false,
                        value: copiedData ? copiedData[field.name] : undefined,
                        hasValueSet: copiedData && copiedData[field.name],
                    }));
                    // Pull the pre-selected fields
                    const preselectedFields: IField[] = filter(transformedFields, (field: IField) => field.selected);
                    // Add original name field
                    if (isEditing) {
                        preselectedFields.push({
                            name: 'orig_name',
                            value: copiedData && copiedData.name,
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
                setInterfaceId(type, data ? copiedData.iface_id : shortid.generate());
                // Set show
                setShow(true);
            }
        );
        // Set the new message listener
        setMessageListener(() => messageListenerHandler);
        // Fetch the fields
        postMessage(Messages.GET_FIELDS, { iface_kind: type, is_editing: isEditing, context });
    };

    const addField: (fieldName: string, notify?: boolean) => void = (fieldName, notify = true) => {
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
    };

    const removeField: (fieldName: string, notify?: boolean) => void = (fieldName, notify = true) => {
        // If mapper code was removed, try to remove relations
        if (type === 'mapper' && fieldName === 'codes') {
            // Remove the code from relations
            removeCodeFromRelations();
        }
        if (fieldName === 'classes') {
            resetClassConnections();
        }
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

                // Add the field to selected list
                setSelectedFields(
                    type,
                    (current: IField[]) => filter(current, (field: IField) => field.name !== fieldName),
                    activeId
                );

                return map(current, (field: IField) => ({
                    ...field,
                    selected: fieldName === field.name ? false : field.selected,
                    value: fieldName === field.name ? undefined : field.value,
                    isValid: fieldName === field.name ? false : field.isValid,
                    hasValueSet: fieldName === field.name ? false : field.hasValueSet,
                }));
            },
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

    const handleAddClick: (fieldName: string) => void = (fieldName) => {
        addField(fieldName);
    };

    const handleFieldChange: (
        fieldName: string,
        value: any,
        forcedType?: string,
        canBeNull?: boolean,
        explicit?: boolean,
        metadata?: any
    ) => void = (fieldName, value, forcedType, canBeNull, explicit, metadata) => {
        //* The first change of any field saves the current interface as in draft
        //* we ignore the `lang` field because it has a default value and fires a change
        //* on mount
        if (value && fieldName !== 'lang') {
            setAsDraft(type);
        }
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
                                if (!field.hasValueSet && !isEditing) {
                                    // Modify the field
                                    setTimeout(() => {
                                        handleFieldChange(field.name, value, null, canBeNull, true);
                                    }, 300);
                                }
                            });
                        }
                        // Check if this field needs style changes
                        if (
                            currentField.style &&
                            // Quick hack for classes and mapper codes
                            (currentField.name === 'class-class-name' || !currentField.hasValueSet)
                        ) {
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
                        const finalFieldType = forcedType || currentField.type;
                        // If this is auto field
                        if (finalFieldType === 'auto' || finalFieldType === 'array-auto') {
                            // Get the type
                            const fieldType = requestFieldData(currentField['type-depends-on'], 'value');
                            // If this is a single field
                            if (finalFieldType === 'auto') {
                                // Validate single field
                                isValid = validateField(fieldType, value, currentField);
                            } else {
                                // Check if the type is in allowed types
                                if (allowedTypes.includes(fieldType)) {
                                    // Validate all values
                                    isValid = value.every((val: string | number) =>
                                        validateField(fieldType, val, currentField, canBeNull)
                                    );
                                } else {
                                    isValid = false;
                                }
                            }
                        } else {
                            // Basic field with predefined type
                            isValid = validateField(finalFieldType || 'string', value, currentField, canBeNull);
                        }
                        // Check if we should change the name of the
                        // method
                        if (fieldName === 'name' && onNameChange) {
                            // Change the method name in the side panel
                            onNameChange(activeId, value, metadata?.originalName);
                        }
                        // On change events
                        maybeSendOnChangeEvent(currentField, value, type, interfaceId, isEditing);
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

    const handleSubmitClick: () => void = async () => {
        // Set the value flag for all selected fields
        setSelectedFields(
            type,
            (currentFields: IField[]): IField[] => {
                return currentFields.reduce((newFields: IField[], currentField: IField): IField[] => {
                    // Add the value
                    return [
                        ...newFields,
                        {
                            ...currentField,
                            hasValueSet: true,
                        },
                    ];
                }, []);
            },
            activeId
        );

        if (onSubmit) {
            onSubmit(selectedFields);
        }

        let result;

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
                newData[subItemType] = map(allSelectedFields[type], (serviceMethod) => {
                    return reduce(
                        serviceMethod,
                        (result: { [key: string]: any }, field: IField) => ({
                            ...result,
                            [field.name]: field.value,
                        }),
                        {}
                    );
                });
                // Filter deleted methods
                if (methodsList) {
                    newData[subItemType] = newData[subItemType].filter((m) =>
                        methodsList.find((ml) => ml.name === m.name)
                    );
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
                result = await initialData.callBackend(
                    isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
                    undefined,
                    {
                        iface_kind,
                        data: { ...newData, 'class-connections': classConnectionsData },
                        orig_data: data,
                        workflow,
                        open_file_on_success: openFileOnSubmit !== false,
                        no_data_return: !!onSubmitSuccess,
                        iface_id: interfaceId,
                    },
                    t(`Saving ${type}...`)
                );
            } else {
                let true_type: string;
                //* If this is config item get the true type of the default_value field
                if (type === 'config-item' && newData.default_value) {
                    // Get the default value field
                    true_type = getTypeFromValue(maybeParseYaml(newData.default_value));
                }

                result = await initialData.callBackend(
                    isEditing ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
                    undefined,
                    {
                        iface_kind,
                        data: {
                            ...newData,
                            'class-connections': classConnectionsData,
                            default_value_true_type: true_type,
                        },
                        orig_data:
                            type === 'service-methods'
                                ? initialData.service
                                : type === 'mapper-methods'
                                ? initialData['mapper-code']
                                : data,
                        open_file_on_success: !onSubmitSuccess && openFileOnSubmit !== false,
                        no_data_return: !!onSubmitSuccess,
                        iface_id: interfaceId,
                    },
                    t(`Saving ${type}...`)
                );
            }
            if (result.ok) {
                if (onSubmitSuccess) {
                    onSubmitSuccess(newData);
                }
                // If this is config item, reset only the fields
                // local fields will be unmounted
                if (type === 'config-item') {
                    resetFields(type);
                } else {
                    // Reset the interface data
                    resetAllInterfaceData(type);
                    resetClassConnections && resetClassConnections();
                }
            }
        }
    };

    if (!size(fields) || !show) {
        return <Loader text={t('LoadingFields')} />;
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

    const requestFieldData: (fieldName: string, fieldKey?: string) => string = (fieldName, fieldKey) => {
        // Find this field
        const field: IField = selectedFields.find((field: IField) => field.name === fieldName);
        // Check if this field exists & is selected
        if (field) {
            // Return the requested field property
            return fieldKey ? field[fieldKey] : field;
        }
        // Return null
        return null;
    };

    const isFieldDisabled: (field: IField) => boolean = (field) => {
        // Check if the field is disabled on its own
        // or required other field to be added
        if (field.disabled) {
            return true;
        } else if (field.requires_fields) {
            const req = isArray(field.requires_fields) ? field.requires_fields : [field.requires_fields];
            // Check if the required field is valid
            if (selectedFields.filter((sField) => req.includes(sField.name)).every((sField) => sField.isValid)) {
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

    const isConfigManagerEnabled = () => {
        if (type === 'workflow') {
            return !!size(steps);
        }
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

    const getMappersFromClassConnections = (classConnections) => {
        const mappers = [];
        forEach(classConnections, (connectionData) => {
            connectionData.forEach((connectorData) => {
                if (connectorData.mapper) {
                    mappers.push(connectorData.mapper);
                }
            });
        });
        return mappers;
    };

    const modifyMappers = (classConnections) => {
        // Get the current mappers from class connections
        const currentCCMappers = getMappersFromClassConnections(classConnectionsData);
        const newCCMappers: string[] = getMappersFromClassConnections(classConnections);
        // Get the mappers field
        const mappers = selectedFields.find((field) => field.name === 'mappers');
        // Check if the field is selected
        if (!mappers) {
            // If there are new mappers, add the field
            if (size(newCCMappers)) {
                handleAddClick('mappers');
                // Add the mappers
                handleFieldChange(
                    'mappers',
                    newCCMappers.map((mapper) => ({ name: mapper }))
                );
                return;
            }
            // Stop otherwise
            else {
                return;
            }
        }
        // Filter out only the mappers that were previously in class connections
        let newMappers = mappers.value.filter((mapper) => {
            // Check if this mapper is in the new cc mappers
            if (!newCCMappers.includes(mapper.name)) {
                // It's not, it either never was there, or got removed
                // Check if the mapper is in the current mappers
                if (currentCCMappers.includes(mapper.name)) {
                    // It was there before and was removed
                    // Remove it
                    return false;
                }
                // It was never in class connections, keep it
                return true;
            }
            // Leave it
            return true;
        });
        // Add all mappers from the new cc mappers
        newMappers = [...newMappers, ...newCCMappers.map((mapper) => ({ name: mapper }))];
        // Save the new mappers
        handleFieldChange('mappers', uniqBy(newMappers, 'name'));
    };

    const supportsContext = () => {
        const supportedIfaces = ['workflow'];
        const ifaceType: string = type === 'step' ? 'workflow' : type;

        return supportedIfaces.includes(ifaceType);
    };

    const getInterfaceNameForContext = () => {
        const ifaceType: string = type === 'step' ? 'workflow' : type;
        const iName: IField = allSelectedFields[ifaceType].find((field) => field.name === 'name');
        const iVersion: IField = allSelectedFields[ifaceType].find((field) => field.name === 'version');
        const iStaticData: IField = allSelectedFields[ifaceType].find((field) => field.name === 'staticdata-type');

        if (!iName || !iVersion || !iStaticData) {
            return null;
        }

        if (!iName.isValid || !iVersion.isValid || !iStaticData || !iStaticData.isValid) {
            return null;
        }

        return `${iName.value}:${iVersion.value}`;
    };

    const getContext = () => {
        if (supportsContext() && getInterfaceNameForContext()) {
            const ifaceType: string = type === 'step' ? 'workflow' : type;
            const staticData: IField = allSelectedFields[ifaceType].find((field) => field.name === 'staticdata-type');
            return {
                iface_kind: type === 'step' ? 'workflow' : type,
                name: getInterfaceNameForContext(),
                static_data: staticData.value,
            };
        }
        return null;
    };

    const canSubmit: () => boolean = () => {
        if (hasClassConnections) {
            return isFormValid(type) && areClassConnectionsValid();
        }

        return isFormValid(type);
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
            <Content title={t(stepTwoTitle)} style={{ paddingLeft: 0 }}>
                <SearchWrapper style={{ marginLeft: '15px' }}>
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
                                <FieldWrapper key={field.name} name="selected-field" style={{ paddingLeft: '15px' }}>
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
                                            resetClassConnections={resetClassConnections}
                                            showClassesWarning={hasClassConnections}
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
                                            context={getContext()}
                                        />
                                    </FieldInputWrapper>
                                    <FieldActions
                                        value={field.value}
                                        parentValue={field['parent-value']}
                                        desc={t(`field-desc-${field.name}`)}
                                        name={field.name}
                                        onResetClick={() => {
                                            handleFieldChange(field.name, field['parent-value']);
                                        }}
                                        isSet={field['is-set']}
                                        disabled={isFieldDisabled(field)}
                                        onClick={removeField}
                                        removable={field.mandatory === false}
                                    />
                                </FieldWrapper>
                            )
                    )}
                </ContentWrapper>
                <ActionsWrapper>
                    {(hasConfigManager || hasClassConnections) && (
                        <div style={{ float: 'left', width: '48%' }}>
                            <ButtonGroup fill>
                                {hasClassConnections && (
                                    <Button
                                        icon={areClassConnectionsValid() ? 'code-block' : 'warning-sign'}
                                        intent={areClassConnectionsValid() ? 'none' : 'warning'}
                                        disabled={!isClassConnectionsManagerEnabled() || !initialData.qorus_instance}
                                        onClick={() => setShowClassConnectionsManager(true)}
                                    >
                                        {t('ManageClassConnections')} ({size(classConnectionsData)})
                                    </Button>
                                )}
                                {hasConfigManager && (
                                    <ManageConfigButton
                                        type={type}
                                        disabled={!isConfigManagerEnabled()}
                                        onClick={() => setShowConfigItemsManager(true)}
                                    />
                                )}
                            </ButtonGroup>
                        </div>
                    )}
                    <div style={{ float: 'right', width: hasConfigManager || hasClassConnections ? '48%' : '100%' }}>
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
                                        initialData.confirmAction(
                                            'ResetFieldsConfirm',
                                            () => {
                                                resetLocalFields(activeId);
                                                // Reset also config items
                                                postMessage(Messages.RESET_CONFIG_ITEMS, {
                                                    iface_id: interfaceId,
                                                });
                                            },
                                            'Reset',
                                            'warning'
                                        );
                                    }}
                                />
                            </Tooltip>
                            <Button
                                text={t(submitLabel)}
                                disabled={!canSubmit()}
                                icon={'tick'}
                                name={`interface-creator-submit-${type}`}
                                intent={Intent.SUCCESS}
                                onClick={handleSubmitClick}
                            />
                        </ButtonGroup>
                    </div>
                </ActionsWrapper>
            </Content>
            {showClassConnectionsManager && hasClassConnections && initialData.qorus_instance && (
                <CustomDialog
                    isOpen
                    title={t('ClassConnectionsManager')}
                    onClose={() => setShowClassConnectionsManager(false)}
                    style={{ width: '80vw', minHeight: '40vh', maxHeight: '90vh', backgroundColor: '#fff' }}
                >
                    <ClassConnectionsManager
                        ifaceType={type === 'service-methods' ? 'service' : type}
                        baseClassName={requestFieldData('base-class-name', 'value')}
                        interfaceContext={getContext()}
                        initialConnections={classConnectionsData}
                        onSubmit={(classConnections) => {
                            const modifiedConnections = reduce(
                                classConnections,
                                (newConnections, connection, name) => {
                                    return {
                                        ...newConnections,
                                        [name]: connection.reduce(
                                            (newConnection, item) => [
                                                ...newConnection,
                                                omit(item, [
                                                    'nextItemData',
                                                    'previousItemData',
                                                    'isInputCompatible',
                                                    'isOutputCompatible',
                                                    'index',
                                                    'isBetween',
                                                    'isEditing',
                                                    'isEvent',
                                                    'isLast',
                                                ]),
                                            ],
                                            []
                                        ),
                                    };
                                },
                                {}
                            );
                            modifyMappers(modifiedConnections);
                            setClassConnectionsData(modifiedConnections);
                            setShowClassConnectionsManager(false);
                        }}
                    />
                </CustomDialog>
            )}
            {showConfigItemsManager && hasConfigManager ? (
                <CustomDialog
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
                        classes={getClasses()}
                        definitionsOnly={definitionsOnly}
                        interfaceId={interfaceId}
                        resetFields={resetFields}
                        steps={processSteps(steps, stepsData)}
                    />
                </CustomDialog>
            ) : null}
        </>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext(),
    withMessageHandler(),
    withMethodsConsumer(),
    withGlobalOptionsConsumer(),
    withMapperConsumer(),
    withStepsConsumer(),
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
