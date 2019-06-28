import React, { FunctionComponent, useState } from 'react';
import { IField } from '../containers/InterfaceCreator/panel';
import { FieldContext } from '../context/fields';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const [fields, setLocalFields] = useState<{ [key: string]: IField[] }>({
            service: [],
            ['service-methods']: [],
            workflow: [],
            job: [],
        });
        const [selectedFields, setLocalSelectedFields] = useState<{ [key: string]: IField[] }>({
            service: [],
            ['service-methods']: [],
            workflow: [],
            job: [],
        });
        const [query, setLocalQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['service-methods']: '',
            workflow: '',
            job: '',
        });
        const [selectedQuery, setLocalSelectedQuery] = useState<{ [key: string]: string }>({
            service: '',
            ['service-methods']: '',
            workflow: '',
            job: '',
        });

        const setFields = (type, value) => {
            setLocalFields(current => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

                return newResult;
            });
        };

        const setSelectedFields = (type, value) => {
            setLocalSelectedFields(current => {
                const newResult = { ...current };

                newResult[type] = typeof value === 'function' ? value(current[type]) : value;

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
                }}
            >
                <Component {...props} />
            </FieldContext.Provider>
        );
    };

    return EnhancedComponent;
};
