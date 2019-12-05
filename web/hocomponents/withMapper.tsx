import React, { FunctionComponent, useState } from 'react';
import mapProps from 'recompose/mapProps';
import { get, set, unset } from 'lodash';
import { MapperContext } from '../context/mapper';
import string from '../components/Field/string';
import useMount from 'react-use/lib/useMount';
import { providers } from '../containers/Mapper/provider';

// A HoC helper that holds all the state for interface creations
export default () => (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
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
        const [inputOptionProvider, setInputOptionProvider] = useState<{ name: string; type: string; path?: string }>(
            null
        );
        const [outputOptionProvider, setOutputOptionProvider] = useState<{ name: string; type: string; path?: string }>(
            null
        );
        const [mapperKeys, setMapperKeys] = useState<any>(null);
        const [hideInputSelector, setHideInputSelector] = useState<boolean>(false);
        const [hideOutputSelector, setHideOutputSelector] = useState<boolean>(false);

        const getProviderUrl: (fieldType: 'input' | 'output') => string = fieldType => {
            // Get the mapper options data
            const { type, name, path = '' } = props.mapper.options[`mapper-${fieldType}`];
            // Save the provider options
            if (fieldType === 'input') {
                setInputOptionProvider({
                    type,
                    name,
                    path,
                });
            } else {
                setOutputOptionProvider({
                    type,
                    name,
                    path,
                });
            }
            // Get the rules for the given provider
            const { url, suffix, recordSuffix, requiresRecord } = providers[type];
            // Build the URL based on the provider type
            return `${url}/${name}${suffix}${path}${requiresRecord ? recordSuffix : ''}`;
        };

        useMount(() => {
            // Fetch the mapper keys
            (async () => {
                const response = await props.fetchData('system/default_mapper_keys');
                setMapperKeys(response.data);
            })();
            // Check if user is editing a mapper
            if (props.isEditing) {
                // Set loading of inputs and outputs
                setInputsLoading(true);
                setOutputsLoading(true);
                // Hide input and output selectors
                setHideInputSelector(true);
                setHideOutputSelector(true);
                // Get URL for input and output providers
                const inputUrl = getProviderUrl('input');
                const outputUrl = getProviderUrl('output');
                // Save the url as a record, to be accessible
                setInputRecord(inputUrl);
                setOutputRecord(outputUrl);
                // Fetch the input and output fields
                (async () => {
                    const inputs = await props.fetchData(inputUrl);
                    const outputs = await props.fetchData(outputUrl);
                    // Save the inputs & outputs
                    setInputs(inputs.data.fields || inputs.data);
                    setOutputs(outputs.data.fields || outputs.data);
                    setRelations(props.mapper.fields || {});
                    // Cancel loading
                    setInputsLoading(false);
                    setOutputsLoading(false);
                })();
            }
        });

        if (!mapperKeys || (props.isEditing && (inputsLoading || outputsLoading))) {
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
                }}
            >
                <Component {...props} />
            </MapperContext.Provider>
        );
    };

    return mapProps(({ mapper, ...rest }) => ({
        initialShow: !!mapper,
        isEditing: !!mapper,
        mapper,
        ...rest,
    }))(EnhancedComponent);
};
