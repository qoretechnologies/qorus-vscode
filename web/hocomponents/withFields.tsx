import React, { FunctionComponent, useState } from 'react';

import { every, reduce } from 'lodash';
import { isArray } from 'util';

import { IField } from '../containers/InterfaceCreator/panel';
import { FieldContext } from '../context/fields';

const getInterfaceCollectionType: (type: string) => [] | {} = (type) => {
    switch (type) {
        case 'service-methods':
        case 'mapper-methods':
            return {};
        default:
            return [];
    }
};

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [interfaceId, _setInterfaceId] = useState<{ [key: string]: string }>({
            service: null,
            ['mapper-code']: null,
            workflow: null,
            job: null,
            class: null,
            step: null,
            other: null,
            mapper: null,
        });
        const [fields, setLocalFields] = useState<{ [key: string]: IField[] | { [key: string]: IField[] } }>({
            service: [],
            ['mapper-code']: [],
            ['service-methods']: {},
            ['mapper-methods']: {},
            workflow: [],
            job: [],
            class: [],
            step: [],
            ['config-item']: [],
            other: [],
            mapper: [],
        });
        const [selectedFields, setLocalSelectedFields] = useState<{
            [key: string]: IField[] | { [key: string]: IField[] };
        }>({
            service: [],
            ['mapper-code']: [],
            ['service-methods']: {},
            ['mapper-methods']: {},
            workflow: [],
            job: [],
            class: [],
            step: [],
            ['config-item']: [],
            other: [],
            mapper: [],
        });
        const [query, setLocalQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['mapper-code']: '',
            ['service-methods']: '',
            ['mapper-methods']: '',
            workflow: '',
            job: '',
            class: '',
            step: '',
            ['config-item']: '',
            other: '',
            mapper: '',
        });
        const [selectedQuery, setLocalSelectedQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['service-methods']: '',
            workflow: '',
            ['mapper-methods']: '',
            ['mapper-code']: '',
            job: '',
            class: '',
            step: '',
            ['config-item']: '',
            other: '',
            mapper: '',
        });

        const requestInterfaceData = (ifaceKind: string, field?: string): any => {
            if (field) {
                return selectedFields[ifaceKind].find((f) => {
                    return f.name === field;
                });
            }

            return selectedFields[ifaceKind];
        };

        const resetFields: (type: string) => void = (type) => {
            setLocalFields((current) => {
                setLocalSelectedFields((current) => {
                    const newResult = { ...current };
                    // Reset the fields
                    newResult[type] = getInterfaceCollectionType(type);
                    return newResult;
                });

                _setInterfaceId((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type] = null;
                    return newResult;
                });

                props.setUnfinishedWork((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type] = null;
                    return newResult;
                });

                const newResult = { ...current };
                // Reset the fields
                newResult[type] = getInterfaceCollectionType(type);
                return newResult;
            });
        };

        const setInterfaceId: (interfaceType: string, id: string) => void = (interfaceType, id) => {
            // Sets the interface id, which is only used
            // for config items management
            _setInterfaceId((current) => ({
                ...current,
                [interfaceType]: id,
            }));
        };

        const setAsDraft: (type: string) => void = (type) => {
            if (!props.unfinishedWork[type]) {
                props.setUnfinishedWork((current) => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type] = true;
                    return newResult;
                });
            }
        };

        const setFields = (type, value, activeId) => {
            setLocalFields((current) => {
                const newResult = { ...current };
                // If active ID is set, we need to create/update
                // a specific item
                if (activeId) {
                    newResult[type][activeId] = typeof value === 'function' ? value(current[type][activeId]) : value;
                } else {
                    newResult[type] = typeof value === 'function' ? value(current[type]) : value;
                }
                return newResult;
            });
        };

        const setSelectedFields = (type, value, activeId) => {
            setLocalSelectedFields((current) => {
                const newResult = { ...current };
                // If active ID is set, we need to create/update
                // a specific item
                if (activeId || activeId === 0) {
                    newResult[type][activeId] = typeof value === 'function' ? value(current[type][activeId]) : value;
                } else {
                    newResult[type] = typeof value === 'function' ? value(current[type]) : value;
                }
                return newResult;
            });
        };

        const setQuery = (type, value) => {
            setLocalQuery((current) => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

                return newResult;
            });
        };

        const setSelectedQuery = (type, value) => {
            setLocalSelectedQuery((current) => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

                return newResult;
            });
        };

        // check if the form is valid
        const isFormValid: (type: string) => boolean = (type) => {
            if (isArray(selectedFields[type])) {
                return selectedFields[type].every(({ isValid }: IField) => isValid);
            }

            return every(selectedFields[type], (fieldsData: IField[]) => {
                return fieldsData.every(({ isValid }: IField) => isValid);
            });
        };

        // Checks if method is valid
        const isSubItemValid: (itemId: number, type: string) => boolean = (itemId, type) => {
            if (itemId) {
                return (
                    selectedFields[type][itemId] && selectedFields[type][itemId].every(({ isValid }: IField) => isValid)
                );
            }
        };

        // Remove method from the methods
        const removeSubItem: (itemId: number, type: string) => void = (itemId, type) => {
            setLocalSelectedFields((current) => {
                const newResult = { ...current };
                // Remove the method with the provided id
                newResult[type] = reduce(
                    newResult[type],
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
                    requestInterfaceData,
                }}
            >
                <Component {...props} />
            </FieldContext.Provider>
        );
    };

    return EnhancedComponent;
};
