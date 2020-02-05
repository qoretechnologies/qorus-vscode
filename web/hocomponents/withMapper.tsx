import React, { FunctionComponent, useState, useEffect } from 'react';
import mapProps from 'recompose/mapProps';
import compose from 'recompose/compose';
import { get, set, unset, forEach, reduce, size } from 'lodash';
import { MapperContext } from '../context/mapper';
import string from '../components/Field/string';
import useMount from 'react-use/lib/useMount';
import { providers } from '../containers/Mapper/provider';
import withTextContext from './withTextContext';
import { Callout } from '@blueprintjs/core';
import { IMapperRelation } from '../containers/Mapper';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
        const { qorus_instance } = props;
        const [mapper, setMapper] = useState<any>(props.mapper);
        const [showMapperConnections, setShowMapperConnections] = useState<boolean>(false);
        const [inputs, setInputs] = useState<any>(null);
        const [outputs, setOutputs] = useState<any>(null);
        const [inputProvider, setInputProvider] = useState<string>(null);
        const [outputProvider, setOutputProvider] = useState<string>(null);
        const [relations, setRelations] = useState<{
            [outputPath: string]: {
                name?: string;
                code?: string;
                constant?: string;
                sequence?: string;
            };
        }>({});
        const [inputsLoading, setInputsLoading] = useState<boolean>(false);
        const [outputsLoading, setOutputsLoading] = useState<boolean>(false);
        const [inputChildren, setInputChildren] = useState<any[]>([]);
        const [outputChildren, setOutputChildren] = useState<any[]>([]);
        const [inputRecord, setInputRecord] = useState<any>(null);
        const [outputRecord, setOutputRecord] = useState<any>(null);
        const [inputOptionProvider, setInputOptionProvider] = useState<{
            name: string;
            type: string;
            path?: string;
            subtype?: string;
        }>(null);
        const [outputOptionProvider, setOutputOptionProvider] = useState<{
            name: string;
            type: string;
            path?: string;
            subtype?: string;
        }>(null);
        const [mapperKeys, setMapperKeys] = useState<any>(null);
        const [hideInputSelector, setHideInputSelector] = useState<boolean>(false);
        const [hideOutputSelector, setHideOutputSelector] = useState<boolean>(false);
        const [error, setError] = useState<any>(null);
        const [wrongKeysCount, setWrongKeysCount] = useState<number>(0);
        const [mapperSubmit, setMapperSubmit] = useState<any>(null);

        const handleMapperSubmitSet = callback => {
            setMapperSubmit(() => callback);
        };

        const resetMapper = () => {
            setShowMapperConnections(false);
            setInputs(null);
            setOutputs(null);
            setInputProvider(null);
            setOutputProvider(null);
            setRelations({});
            setInputsLoading(false);
            setOutputsLoading(false);
            setInputChildren([]);
            setOutputChildren([]);
            setInputRecord(null);
            setOutputRecord(null);
            setInputOptionProvider(null);
            setOutputOptionProvider(null);
            setHideInputSelector(false);
            setHideOutputSelector(false);
            setError(null);
            setWrongKeysCount(0);
            setMapperSubmit(null);
            setMapper(null);
        };

        const getUrlFromProvider: (fieldType: 'input' | 'output') => string = fieldType => {
            const { type, name, path, subtype } = fieldType === 'input' ? inputOptionProvider : outputOptionProvider;
            // Get the rules for the given provider
            const { url, suffix, recordSuffix } = providers[type];
            // Build the URL based on the provider type
            return `${url}/${name}${suffix}${path}${recordSuffix && !subtype ? recordSuffix : ''}${
                subtype ? subtype : ''
            }`;
        };

        const getProviderUrl: (fieldType: 'input' | 'output') => string = fieldType => {
            // Get the mapper options data
            const { type, name, path = '', subtype } = mapper.mapper_options[`mapper-${fieldType}`];
            // Save the provider options
            if (fieldType === 'input') {
                setInputOptionProvider({
                    type,
                    name,
                    path,
                    subtype,
                });
            } else {
                setOutputOptionProvider({
                    type,
                    name,
                    path,
                    subtype,
                });
            }
            // Get the rules for the given provider
            const { url, suffix, recordSuffix } = providers[type];
            // Build the URL based on the provider type
            return `${url}/${name}${suffix}${path}${recordSuffix && !subtype ? recordSuffix : ''}${
                subtype ? subtype : ''
            }`;
        };

        const getMapperKeysUrl: (fieldType: 'input' | 'output') => string = fieldType => {
            // Get the mapper options data
            const { type, name, path = '', subtype } = mapper.mapper_options[`mapper-${fieldType}`];
            // Get the rules for the given provider
            const { url, suffix } = providers[type];
            // Build the URL
            const newUrl: string = `${url}/${name}${suffix}${path}/mapper_keys`;
            // Build the URL based on the provider type
            return subtype ? newUrl.replace(subtype, '') : newUrl;
        };

        const insertCustomFields = (fields, customFields = {}) => {
            const newFields = { ...fields };
            // Loop throught the custom fields
            forEach(customFields, field => {
                // Build the path
                const fields: string[] = field.path.split('.');
                let newPath: string;
                fields.forEach(fieldName => {
                    if (!newPath) {
                        newPath = fieldName;
                    } else {
                        newPath += `.type.fields.${fieldName}`;
                    }
                });
                // Insert the top custom field based on the path
                set(newFields, newPath, field);
            });

            return newFields;
        };

        const checkMapperKeys = (relations, mapperKeys) => {
            if (!mapperKeys) {
                return relations;
            }
            return reduce(
                relations,
                (newRelations, keys, fieldName) => {
                    // Filter out the keys that do not belong to these mapper keys
                    const newKeys = reduce(
                        keys,
                        (newKeys, key, keyName) => {
                            if (Object.keys(mapperKeys).includes(keyName)) {
                                return { ...newKeys, [keyName]: key };
                            }
                            // This key does not exist
                            // Raise the alerts
                            setWrongKeysCount(cur => cur + 1);
                            return newKeys;
                        },
                        {}
                    );
                    // Save the field
                    if (size(newKeys) !== 0) {
                        return { ...newRelations, [fieldName]: newKeys };
                    }

                    // Return unchanged
                    return newRelations;
                },
                {}
            );
        };

        const getInputsData = () => {
            // Set loading of inputs and outputs
            setInputsLoading(true);
            // Hide input and output selectors
            setHideInputSelector(true);
            // Get URL for input and output providers
            const inputUrl = getProviderUrl('input');
            // Save the url as a record, to be accessible
            setInputRecord(inputUrl);
            // Fetch the input and output fields
            (async () => {
                const inputs = await props.fetchData(inputUrl);
                // If one of the connections is down
                if (inputs.error) {
                    console.log('errors', inputs.error);

                    setError(inputs.error && 'InputConnError');
                    return;
                }
                // Save the fields
                const inputFields = inputs.data.fields || inputs.data;
                // Save the inputs & outputs
                setInputs(
                    insertCustomFields(inputFields, mapper.mapper_options['mapper-input']['custom-fields'] || {})
                );
                // Cancel loading
                setInputsLoading(false);
            })();
        };

        const getOutputsData = (mapperKeys: any) => {
            // Set loading of inputs and outputs
            setOutputsLoading(true);
            // Hide input and output selectors
            setHideOutputSelector(true);
            // Get URL for input and output providers
            const outputUrl = getProviderUrl('output');
            // Save the url as a record, to be accessible
            setOutputRecord(outputUrl);
            // Fetch the input and output fields
            (async () => {
                const outputs = await props.fetchData(outputUrl);
                // If one of the connections is down
                if (outputs.error) {
                    console.log('errors', outputs.error);

                    setError(outputs.error && 'OutputConnError');
                    return;
                }
                // Do not fetch mapper keys for types
                if (mapper.mapper_options['mapper-output'].type !== 'type') {
                    const mapperKeysUrl = getMapperKeysUrl('output');
                    // Fetch the mapper keys
                    const resp = await props.fetchData(mapperKeysUrl);
                    // Check if mapper keys call was good
                    if (resp.error) {
                        console.log(resp);
                        setError('MapperKeysFail');
                        return;
                    }
                    // Save the mapper keys
                    setMapperKeys(resp.data);
                    mapperKeys = resp.data;
                }
                // Save the fields
                const outputFields = outputs.data.fields || outputs.data;
                setOutputs(
                    insertCustomFields(outputFields, mapper.mapper_options['mapper-output']['custom-fields'] || {})
                );
                setRelations(checkMapperKeys(mapper.fields, mapperKeys) || {});
                // Cancel loading
                setOutputsLoading(false);
            })();
        };

        useEffect(() => {
            if (qorus_instance) {
                let mapperKeys;
                // Fetch the mapper keys
                (async () => {
                    const response = await props.fetchData('system/default_mapper_keys');
                    setMapperKeys(response.data);
                    mapperKeys = response.data;
                })();
                // Check if user is editing a mapper
                if (mapper) {
                    if (mapper.mapper_options['mapper-input']) {
                        getInputsData();
                    }
                    if (mapper.mapper_options['mapper-output']) {
                        getOutputsData(mapperKeys);
                    }
                }
            }
        }, [qorus_instance, mapper]);

        if (!error && qorus_instance && (!mapperKeys || (props.isEditing && (!inputs || !outputs)))) {
            return <p> Loading ... </p>;
        }

        const addField = (fieldsType, path, data) => {
            // Save the field setters to be easily accessible
            const fieldSetters: any = { inputs: setInputs, outputs: setOutputs };
            // Set the new fields
            fieldSetters[fieldsType](current => {
                // Clone the current fields
                const result: any = { ...current };
                // Build the path
                const fields: string[] = path.split('.');
                let newPath: string;
                fields.forEach(fieldName => {
                    if (!newPath) {
                        newPath = fieldName;
                    } else {
                        newPath += `.type.fields.${fieldName}`;
                    }
                });
                // Get the object at the exact path
                const obj: any = get(result, newPath);
                // Add new object
                obj.type.fields[data.name] = data;
                // Return new data
                return result;
            });
        };

        const editField = (fieldsType, path, data, remove: boolean) => {
            // Save the field setters to be easily accessible
            const fieldSetters: any = { inputs: setInputs, outputs: setOutputs };
            // Set the new fields
            fieldSetters[fieldsType](current => {
                // Clone the current fields
                const result: any = { ...current };
                // Build the path
                const fields: string[] = path.split('.');
                let newPath: string;
                fields.forEach(fieldName => {
                    if (!newPath) {
                        newPath = fieldName;
                    } else {
                        newPath += `.type.fields.${fieldName}`;
                    }
                });
                // Get the object at the exact path
                if (remove) {
                    unset(result, newPath);
                } else {
                    set(result, newPath, data);
                }
                // Return new data
                return result;
            });
        };

        return (
            <MapperContext.Provider
                value={{
                    inputs,
                    setInputs,
                    outputs,
                    setOutputs,
                    inputChildren,
                    setInputChildren,
                    outputChildren,
                    setOutputChildren,
                    inputRecord,
                    setInputRecord,
                    outputRecord,
                    setOutputRecord,
                    inputProvider,
                    setInputProvider,
                    outputProvider,
                    setOutputProvider,
                    relations,
                    setRelations,
                    inputsLoading,
                    setInputsLoading,
                    outputsLoading,
                    setOutputsLoading,
                    showMapperConnections,
                    setShowMapperConnections,
                    addField,
                    editField,
                    mapperKeys,
                    setMapperKeys,
                    inputOptionProvider,
                    outputOptionProvider,
                    setInputOptionProvider,
                    setOutputOptionProvider,
                    isEditing: props.isEditing,
                    hideInputSelector,
                    hideOutputSelector,
                    setHideInputSelector,
                    setHideOutputSelector,
                    resetMapper,
                    getUrlFromProvider,
                    error,
                    wrongKeysCount,
                    setMapper,
                    mapperSubmit,
                    handleMapperSubmitSet,
                }}
            >
                <Component {...props} />
            </MapperContext.Provider>
        );
    };

    return compose(
        mapProps(({ mapper, ...rest }) => ({
            initialShow: !!mapper,
            mapper,
            isEditing: !!mapper,
            ...rest,
        })),
        withTextContext()
    )(EnhancedComponent);
};
