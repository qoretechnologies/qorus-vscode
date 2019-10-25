import React, { FunctionComponent, useState } from 'react';
import { IField } from '../containers/InterfaceCreator/panel';
import { FieldContext } from '../context/fields';
import { isArray } from 'util';
import { every, reduce } from 'lodash';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [interfaceId, _setInterfaceId] = useState<{ [key: string]: string }>({
            service: null,
            workflow: null,
            job: null,
            class: null,
            step: null,
            other: null,
        });
        const [fields, setLocalFields] = useState<{ [key: string]: IField[] | { [key: string]: IField[] } }>({
            service: [],
            ['service-methods']: {},
            workflow: [],
            job: [],
            class: [],
            step: [],
            ['config-item']: [],
            other: [],
        });
        const [selectedFields, setLocalSelectedFields] = useState<{
            [key: string]: IField[] | { [key: string]: IField[] };
        }>({
            service: [],
            ['service-methods']: {},
            workflow: [],
            job: [],
            class: [],
            step: [],
            ['config-item']: [],
            other: [],
        });
        const [query, setLocalQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['service-methods']: '',
            workflow: '',
            job: '',
            class: '',
            step: '',
            ['config-item']: '',
            other: '',
        });
        const [selectedQuery, setLocalSelectedQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['service-methods']: '',
            workflow: '',
            job: '',
            class: '',
            step: '',
            ['config-item']: '',
            other: '',
        });

        const resetFields: (type: string) => void = type => {
            setLocalFields(current => {
                setLocalSelectedFields(current => {
                    const newResult = { ...current };
                    // Reset the fields
                    newResult[type] = type === 'service-methods' ? {} : [];
                    return newResult;
                });

                _setInterfaceId(current => {
                    const newResult = { ...current };
                    // Set the interface id to null
                    newResult[type] = null;
                    return newResult;
                });

                const newResult = { ...current };
                // Reset the fields
                newResult[type] = type === 'service-methods' ? {} : [];
                return newResult;
            });
        };

        const setInterfaceId: (interfaceType: string, id: string) => void = (interfaceType, id) => {
            // Sets the interface id, which is only used
            // for config items management
            _setInterfaceId(current => ({
                ...current,
                [interfaceType]: id,
            }));
        };

        const setFields = (type, value, activeId) => {
            setLocalFields(current => {
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
            setLocalSelectedFields(current => {
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

        const setQuery = (type, value) => {
            setLocalQuery(current => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

                return newResult;
            });
        };

        const setSelectedQuery = (type, value) => {
            setLocalSelectedQuery(current => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

                return newResult;
            });
        };

        // check if the form is valid
        const isFormValid: (type: string) => boolean = type => {
            if (isArray(selectedFields[type])) {
                return selectedFields[type].every(({ isValid }: IField) => isValid);
            }

            return every(selectedFields[type], (fieldsData: IField[]) => {
                return fieldsData.every(({ isValid }: IField) => isValid);
            });
        };

        // Checks if method is valid
        const isMethodValid: (methodId: number) => boolean = methodId => {
            if (methodId) {
                return (
                    selectedFields['service-methods'][methodId] &&
                    selectedFields['service-methods'][methodId].every(({ isValid }: IField) => isValid)
                );
            }
        };
        // Remove method from the methods
        const removeMethod: (methodId: number) => void = methodId => {
            setLocalSelectedFields(current => {
                const newResult = { ...current };
                // Remove the method with the provided id
                newResult['service-methods'] = reduce(
                    newResult['service-methods'],
                    (newMethods, methodData, id) => {
                        let result = { ...newMethods };
                        // The id does not match so add the method
                        if (methodId !== parseInt(id, 10)) {
                            result = { ...result, [id]: methodData };
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
                    isMethodValid,
                    removeMethodFromFields: removeMethod,
                    resetFields,
                    interfaceId,
                    setInterfaceId,
                }}
            >
                <Component {...props} />
            </FieldContext.Provider>
        );
    };

    return EnhancedComponent;
};
