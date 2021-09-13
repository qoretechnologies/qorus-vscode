import { every, last, reduce } from 'lodash';
import React, { FunctionComponent, useState } from 'react';
import { isArray } from 'util';
import { IField } from '../containers/InterfaceCreator/panel';
import { FieldContext } from '../context/fields';
import { maybeSendOnChangeEvent } from '../helpers/common';

const getInterfaceCollectionType: (type: string) => [] | {} = (type) => {
    switch (type) {
        case 'service-methods':
        case 'error':
        case 'mapper-methods':
            return {};
        default:
            return [];
    }
};

// A HoC helper that holds all the state for interface creations
export default () =>
    (Component: FunctionComponent<any>): FunctionComponent<any> => {
        const EnhancedComponent: FunctionComponent = (props: any) => {
            const [interfaceId, _setInterfaceId] = useState<{ [key: string]: string[] }>({
                service: [],
                error: [],
                errors: [],
                ['mapper-code']: [],
                ['service-methods']: [],
                ['mapper-methods']: [],
                workflow: [],
                job: [],
                class: [],
                step: [],
                group: [],
                event: [],
                queue: [],
                mapper: [],
                ['config-item']: [],
                'value-map': [],
            });
            const [fields, setLocalFields] = useState<any>({
                service: [],
                error: [],
                errors: [],
                ['mapper-code']: [],
                ['service-methods']: [],
                ['mapper-methods']: [],
                workflow: [],
                job: [],
                class: [],
                step: [],
                ['config-item']: [],
                group: [],
                event: [],
                queue: [],
                mapper: [],
                'value-map': [],
            });
            const [selectedFields, setLocalSelectedFields] = useState<any>({
                service: [],
                error: [],
                errors: [],
                ['mapper-code']: [],
                ['service-methods']: [],
                ['mapper-methods']: [],
                workflow: [],
                job: [],
                class: [],
                step: [],
                ['config-item']: [],
                group: [],
                event: [],
                queue: [],
                mapper: [],
                'value-map': [],
            });
            const [query, setLocalQuery] = useState<any>({
                service: [],
                error: [],
                errors: [],
                ['mapper-code']: [],
                ['service-methods']: [],
                ['mapper-methods']: [],
                workflow: [],
                job: [],
                class: [],
                step: [],
                ['config-item']: [],
                group: [],
                event: [],
                queue: [],
                mapper: [],
                'value-map': [],
            });
            const [selectedQuery, setLocalSelectedQuery] = useState<any>({
                service: [],
                error: [],
                errors: [],
                ['service-methods']: [],
                workflow: [],
                ['mapper-methods']: [],
                ['mapper-code']: [],
                job: [],
                class: [],
                step: [],
                ['config-item']: [],
                group: [],
                event: [],
                queue: [],
                mapper: [],
                'value-map': [],
            });

            const getSelectedFields = (type: string, interfaceIndex?: number) => {
                const index = getInterfaceIndex(type, interfaceIndex);

                return selectedFields[type][index];
            };

            const getSelectedFieldValue = (type: string, field: string, interfaceIndex?: number) => {
                const fields = getSelectedFields(type, interfaceIndex);

                return fields?.find((f) => f.name === field)?.value;
            };

            const addInterface = (type: string, interfaceIndex: number) => {
                const index = getInterfaceIndex(type, interfaceIndex);

                if (fields[type][interfaceIndex]) {
                    return;
                }

                _setInterfaceId((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type][index] = '';
                    return newResult;
                });
                setLocalQuery((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type][index] = '';
                    return newResult;
                });
                setLocalSelectedQuery((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type][index] = '';
                    return newResult;
                });
                setLocalFields((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type][index] = getInterfaceCollectionType(type);
                    return newResult;
                });
                setLocalSelectedFields((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type][index] = getInterfaceCollectionType(type);
                    return newResult;
                });
            };

            const removeInterface = (type: string) => {
                _setInterfaceId((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    delete newResult[type][newResult[type].length - 1];
                    return newResult;
                });
                setLocalQuery((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    delete newResult[type][newResult[type].length - 1];
                    return newResult;
                });
                setLocalSelectedQuery((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    delete newResult[type][newResult[type].length - 1];
                    return newResult;
                });
                setLocalFields((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    delete newResult[type][newResult[type].length - 1];
                    return newResult;
                });
                setLocalSelectedFields((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    delete newResult[type][newResult[type].length - 1];
                    return newResult;
                });
            };

            const requestInterfaceData = (ifaceKind: string, field?: string): any => {
                const lastIface = last(selectedFields[ifaceKind]);

                if (!lastIface || lastIface.length === 0) {
                    return null;
                }

                if (field) {
                    return lastIface.find((f) => {
                        return f.name === field;
                    });
                }

                return lastIface;
            };

            const getInterfaceIndex = (type: string, interfaceIndex?: number) => {
                return interfaceIndex ?? interfaceId[type].length - 1;
            };

            const resetFields: (type: string, interfaceIndex?: number, resetRelatedForm: boolean) => void = (
                type,
                interfaceIndex,
                resetRelatedForm = true
            ) => {
                if (type in fields) {
                    setLocalFields((current) => {
                        setLocalSelectedFields((current) => {
                            const newResult = { ...current };
                            // Reset the fields
                            newResult[type][getInterfaceIndex(type, interfaceIndex)] = getInterfaceCollectionType(type);
                            if (type === 'service' && resetRelatedForm) {
                                resetFields('service-methods', interfaceIndex, false);
                            }
                            if (type === 'service-methods' && resetRelatedForm) {
                                resetFields('service', interfaceIndex, false);
                            }
                            return newResult;
                        });

                        _setInterfaceId((current) => {
                            const newResult = { ...current };
                            // Set the interface id to null
                            newResult[type][getInterfaceIndex(type, interfaceIndex)] = null;
                            return newResult;
                        });

                        props.setUnfinishedWork((current) => {
                            const newResult = { ...current };
                            // Set the interface id to null
                            newResult[type === 'service-methods' ? 'service' : type] = false;
                            return newResult;
                        });

                        const newResult = { ...current };
                        // Reset the fields
                        newResult[type][getInterfaceIndex(type, interfaceIndex)] = getInterfaceCollectionType(type);
                        return newResult;
                    });
                }
            };

            const setInterfaceId: (interfaceType: string, id: string, interfaceIndex: number) => void = (
                interfaceType,
                id,
                interfaceIndex
            ) => {
                const index = getInterfaceIndex(interfaceType, interfaceIndex);
                // Sets the interface id, which is only used
                // for config items management
                _setInterfaceId((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[interfaceType][index] = id;
                    return newResult;
                });
            };

            const setAsDraft: (type: string) => void = (type) => {
                type = type === 'service-methods' ? 'service' : type;
                if (!props.unfinishedWork?.[type]) {
                    props.setUnfinishedWork((current) => ({
                        ...current,
                        [type]: true,
                    }));
                }
            };

            const unsetDraft: (type: string) => void = (type) => {
                type = type === 'service-methods' ? 'service' : type;
                if (props.unfinishedWork?.[type]) {
                    props.setUnfinishedWork((current) => ({
                        ...current,
                        [type]: false,
                    }));
                }
            };

            const setFields = (type, value, activeId, interfaceIndex) => {
                setLocalFields((current) => {
                    const index = getInterfaceIndex(type, interfaceIndex);
                    const newResult = { ...current };
                    // If active ID is set, we need to create/update
                    // a specific item
                    if (activeId) {
                        newResult[type][index][activeId] =
                            typeof value === 'function' ? value(current[type][index][activeId] || []) : value;
                    } else {
                        newResult[type][index] =
                            typeof value === 'function' ? value(current[type][index] || []) : value;
                    }
                    return newResult;
                });
            };

            const setSelectedFields = (type, value, activeId, interfaceIndex) => {
                console.log('SETTING SELECTED FIELDS', {
                    type,
                    value,
                    activeId,
                    interfaceIndex,
                });
                setLocalSelectedFields((current) => {
                    const index = getInterfaceIndex(type, interfaceIndex);
                    const newResult = { ...current };
                    // If active ID is set, we need to create/update
                    // a specific item
                    if (activeId || activeId === 0) {
                        newResult[type][index][activeId] =
                            typeof value === 'function' ? value(current[type][index][activeId] || []) : value;
                    } else {
                        newResult[type][index] =
                            typeof value === 'function' ? value(current?.[type]?.[index] || []) : value;
                    }
                    return newResult;
                });
            };

            const updateField = (type, field, value, iface_id, interfaceIndex) => {
                const index = getInterfaceIndex(type, interfaceIndex);
                setLocalSelectedFields((current) => {
                    const newResult = { ...current };

                    newResult[type][index] = newResult[type][index].reduce((fields, currentField) => {
                        if (currentField.name === field) {
                            maybeSendOnChangeEvent(currentField, value, type, iface_id);

                            return [
                                ...fields,
                                {
                                    ...currentField,
                                    value,
                                },
                            ];
                        }

                        return [...fields, currentField];
                    }, []);

                    return newResult;
                });
            };

            const setQuery = (type, value, interfaceIndex) => {
                const index = getInterfaceIndex(type, interfaceIndex);
                setLocalQuery((current) => {
                    const newResult = { ...current };

                    newResult[type][index] = typeof value === 'function' ? value(current[type][index]) : value;

                    return newResult;
                });
            };

            const setSelectedQuery = (type, value, interfaceIndex) => {
                const index = getInterfaceIndex(type, interfaceIndex);
                setLocalSelectedQuery((current) => {
                    const newResult = { ...current };

                    newResult[type][index] = typeof value === 'function' ? value(current[type][index]) : value;

                    return newResult;
                });
            };

            // check if the form is valid
            const isFormValid: (type: string, interfaceIndex: number) => boolean = (type, interfaceIndex) => {
                const index = getInterfaceIndex(type, interfaceIndex);

                if (isArray(selectedFields[type][index])) {
                    return selectedFields[type][index].every(({ isValid }: IField) => isValid);
                }

                return every(selectedFields[type][index], (fieldsData: IField[]) => {
                    return fieldsData.every(({ isValid }: IField) => isValid);
                });
            };

            // Checks if method is valid
            const isSubItemValid: (itemId: number, type: string, interfaceIndex: number) => boolean = (
                itemId,
                type,
                interfaceIndex
            ) => {
                const index = getInterfaceIndex(type, interfaceIndex);

                console.log(itemId, type, interfaceIndex, index);

                console.log(selectedFields?.[type]);

                if (itemId) {
                    return (
                        selectedFields?.[type]?.[index]?.[itemId] &&
                        selectedFields[type][index][itemId].every(({ isValid }: IField) => isValid)
                    );
                }
            };

            // Remove method from the methods
            const removeSubItem: (itemId: number, type: string, interfaceIndex: number) => void = (
                itemId,
                type,
                interfaceIndex
            ) => {
                const index = getInterfaceIndex(type, interfaceIndex);

                setLocalSelectedFields((current) => {
                    const newResult = { ...current };
                    // Remove the method with the provided id
                    newResult[type][index] = reduce(
                        newResult[type][index],
                        (newItems, itemData, id) => {
                            let result = { ...newItems };
                            // The id does not match so add the method
                            if (itemId !== parseInt(id, 10)) {
                                result = { ...result, [id]: itemData };
                            }
                            // Return new methods
                            return result;
                        },
                        {}
                    );
                    // Return new data
                    return newResult;
                });
            };

            return (
                <FieldContext.Provider
                    value={{
                        fields,
                        setFields,
                        selectedFields,
                        setSelectedFields,
                        query,
                        setSelectedQuery,
                        setQuery,
                        selectedQuery,
                        isFormValid,
                        isSubItemValid,
                        removeSubItemFromFields: removeSubItem,
                        resetFields,
                        interfaceId,
                        setInterfaceId,
                        unfinishedWork: props.unfinishedWork,
                        setAsDraft,
                        unsetDraft,
                        requestInterfaceData,
                        updateField,
                        addInterface,
                        removeInterface,
                        getSelectedFields,
                        getSelectedFieldValue,
                    }}
                >
                    <Component {...props} />
                </FieldContext.Provider>
            );
        };

        return EnhancedComponent;
    };
