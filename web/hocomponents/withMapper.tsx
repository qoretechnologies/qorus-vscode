import { forEach, get, reduce, set, size, unset } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import compose from 'recompose/compose';
import mapProps from 'recompose/mapProps';
import { getUrlFromProvider as getRealUrlFromProvider } from '../components/Field/connectors';
import { Messages } from '../constants/messages';
import { formatFields } from '../containers/InterfaceCreator/typeView';
import { providers } from '../containers/Mapper/provider';
import { MapperContext } from '../context/mapper';
import { callBackendBasic } from '../helpers/functions';
import { fixRelations, flattenFields } from '../helpers/mapper';
import withFieldsConsumer from './withFieldsConsumer';
import withInitialDataConsumer from './withInitialDataConsumer';
import withMessageHandler from './withMessageHandler';
import withTextContext from './withTextContext';

export const addTrailingSlash = (path: string) => {
  // Get the last character
  const lastChar: string = path.substr(-1);
  // Check if the last character is a slash
  if (lastChar !== '/') {
    // Add the slash if its not
    path += '/';
  }

  return path;
};

// A HoC helper that holds all the state for interface creations
export default () =>
  (Component: FunctionComponent<any>): FunctionComponent<any> => {
    const EnhancedComponent: FunctionComponent = (props: any) => {
      const { qorus_instance } = props;
      const [mapper, setMapper] = useState<any>(props.mapper);
      const [showMapperConnections, setShowMapperConnections] = useState<boolean>(false);
      const [inputs, setInputs] = useState<any>(null);
      const [contextInputs, setContextInputs] = useState<any>(null);
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
        can_manage_fields?: boolean;
        options?: any;
      }>(null);
      const [outputOptionProvider, setOutputOptionProvider] = useState<{
        name: string;
        type: string;
        path?: string;
        subtype?: string;
        can_manage_fields?: boolean;
        options?: any;
      }>(null);
      const [mapperKeys, setMapperKeys] = useState<any>(null);
      const [hideInputSelector, setHideInputSelector] = useState<boolean>(false);
      const [hideOutputSelector, setHideOutputSelector] = useState<boolean>(false);
      const [error, setError] = useState<any>(null);
      const [wrongKeysCount, setWrongKeysCount] = useState<number>(0);
      const [mapperSubmit, setMapperSubmit] = useState<any>(null);
      const [isContextLoaded, setIsContextLoaded] = useState<boolean>(false);
      const [draftSavedForLater, setDraftSavedForLater] = useState<any>(null);

      const handleMapperSubmitSet = (callback) => {
        setMapperSubmit(() => callback);
      };

      const resetMapper = (soft?: boolean) => {
        if (!soft) {
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
        }
        setMapper({ ...props.mapper });
      };

      const setMapperFromDraft = (data: any) => {
        // If mapper exists, save this data for later
        if (mapper) {
          setDraftSavedForLater(data);
        } else {
          applyDraft(data);
        }
      };

      const maybeApplyStoredDraft = () => {
        if (draftSavedForLater) {
          applyDraft(draftSavedForLater);
        }
      };

      const applyDraft = (data) => {
        setShowMapperConnections(false);
        setInputs(data.inputs);
        setOutputs(data.outputs);
        setInputProvider(data.inputProvider);
        setOutputProvider(data.outputProvider);
        setRelations(data.relations);
        setInputsLoading(false);
        setOutputsLoading(false);
        setInputChildren(data.inputChildren);
        setOutputChildren(data.outputChildren);
        setInputRecord(data.inputRecord);
        setOutputRecord(data.outputRecord);
        setInputOptionProvider(data.inputOptionProvider);
        setOutputOptionProvider(data.outputOptionProvider);
        setHideInputSelector(data.hideInputSelector);
        setHideOutputSelector(data.hideOutputSelector);
        setError(data.error);
        setContextInputs(data.contextInputs);
        setIsContextLoaded(data.isContextLoaded);
      };

      const getUrlFromProvider: (fieldType: 'input' | 'output', provider?: any) => string = (
        fieldType,
        provider
      ) => {
        /* GetRealUrlFromProvider(provider, withOptions)

        The above code is a function that takes two parameters:

        provider: the provider to use to get the real url
        withOptions: a boolean that indicates whether or not to include the options

        The function returns a function that takes one parameter:

        fieldType: the type of field to get the real url for

        The function returns a string that is the real url for the field type.

        The function is used in the following way:

        const realUrl = getReal */
        const prov = provider
          ? provider
          : fieldType === 'input'
          ? inputOptionProvider
          : outputOptionProvider;
        return getRealUrlFromProvider(prov);
        // Check if the type is factory
        // if (type === 'factory') {
        //   // Return just the type
        //   return type;
        // }
        // // Get the rules for the given provider
        // const { url, suffix, recordSuffix } = providers[type];
        // // Build the URL based on the provider type
        // return `${url}/${name}${suffix}${subtype ? addTrailingSlash(path) : path}${
        //   recordSuffix && !subtype ? recordSuffix : ''
        // }${subtype ? subtype : ''}`;
      };

      const getProviderUrl: (fieldType: 'input' | 'output') => string = (fieldType) => {
        // Get the mapper options data
        const {
          type,
          name,
          path = '',
          subtype,
          can_manage_fields,
        } = mapper.mapper_options[`mapper-${fieldType}`];
        // Save the provider options
        if (fieldType === 'input') {
          setInputOptionProvider({
            type,
            name,
            path,
            subtype,
            can_manage_fields,
          });
        } else {
          setOutputOptionProvider({
            type,
            name,
            path,
            subtype,
            can_manage_fields,
          });
        }
        console.log(type, providers);
        return getUrlFromProvider(fieldType, mapper.mapper_options[`mapper-${fieldType}`]);
      };

      const getMapperKeysUrl: (fieldType: 'input' | 'output') => string = (fieldType) => {
        // Get the mapper options data
        const { type, name, path = '', subtype } = mapper.mapper_options[`mapper-${fieldType}`];
        // Get the rules for the given provider
        const { url, suffix } = providers[type];
        // Build the URL
        const newUrl: string = `${url}/${name}${suffix}${addTrailingSlash(path)}/mapper_keys`;
        // Build the URL based on the provider type
        return newUrl.replace('/request', '').replace('/response', '');
      };

      const insertCustomFields = (fields, customFields = {}) => {
        const newFields = { ...fields };
        // Loop throught the custom fields
        forEach(customFields, (field) => {
          // Build the path
          const fields: string[] = field.path.split(/(?<!\\)\./g);
          let newPathList: string[];
          fields.forEach((fieldName) => {
            if (!newPathList) {
              newPathList = [fieldName];
            } else {
              newPathList.push('type', 'fields', fieldName);
            }
          });
          // Insert the top custom field based on the path
          set(newFields, newPathList, field);
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
                setWrongKeysCount((cur) => cur + 1);
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

      const getInputsData = async () => {
        // Set loading of inputs and outputs
        setInputsLoading(true);
        // Hide input and output selectors
        setHideInputSelector(true);
        // Get URL for input and output providers
        const inputUrl = getProviderUrl('input');
        // Save the url as a record, to be accessible
        setInputRecord(inputUrl);
        // Check if this input is a factory
        const { type } = mapper.mapper_options[`mapper-input`];

        const inputs = await props.fetchData(inputUrl);
        console.log('inputs', inputs);
        // If one of the connections is down
        if (inputs.error) {
          setError(inputs.error && 'InputConnError');
          return;
        }
        // Save the fields
        const inputFields = inputs.data.fields || inputs.data || {};
        // Save the inputs & outputs
        setInputs(
          formatFields(
            insertCustomFields(
              inputFields,
              mapper.mapper_options['mapper-input']['custom-fields'] || {}
            )
          )
        );
        // Cancel loading
        setInputsLoading(false);
      };

      const getOutputsData = async (mapperKeys: any) => {
        // Set loading of inputs and outputs
        setOutputsLoading(true);
        // Hide input and output selectors
        setHideOutputSelector(true);
        // Get URL for input and output providers
        const outputUrl = getProviderUrl('output');
        // Save the url as a record, to be accessible
        setOutputRecord(outputUrl);
        // Fetch the input and output fields
        const outputs = await props.fetchData(outputUrl);
        console.log('outputs', outputs);
        // If one of the connections is down
        if (outputs.error) {
          console.error(outputs);
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
            console.error(resp);
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
          formatFields(
            insertCustomFields(
              outputFields,
              mapper.mapper_options['mapper-output']['custom-fields'] || {}
            )
          )
        );
        setRelations(checkMapperKeys(mapper.fields, mapperKeys) || {});
        // Cancel loading
        setOutputsLoading(false);
      };

      const getFieldsFromStaticData = (staticData) => {
        // Get the url from the context provider
        const url = getUrlFromProvider(null, staticData);

        // Send the URL to backend
        const listener = props.addMessageListener(Messages.RETURN_FIELDS_FROM_TYPE, ({ data }) => {
          if (data) {
            // Save the inputs if the data exist
            setContextInputs(data.fields || data);
            maybeApplyStoredDraft();
          }

          listener();
        });
        // Ask backend for the fields for this particular type
        props.postMessage(Messages.GET_FIELDS_FROM_TYPE, {
          ...staticData,
          url,
        });
      };

      useEffect(() => {
        if (contextInputs) {
          setIsContextLoaded(true);
        }
      }, [contextInputs]);

      useEffect(() => {
        if (qorus_instance) {
          let mapperKeys;
          // Fetch the mapper keys
          (async () => {
            const response = await props.fetchData('system/default_mapper_keys');
            setMapperKeys(response.data);
            mapperKeys = response.data;
            setIsContextLoaded(false);
            // Check if user is editing a mapper
            if (mapper) {
              // Process input fields
              if (mapper.mapper_options?.['mapper-input']) {
                await getInputsData();
              }
              // Process output fields
              if (mapper.mapper_options?.['mapper-output']) {
                await getOutputsData(mapperKeys);
              }
              const mapperContext = mapper.interfaceContext || props.currentMapperContext;
              // If this mapper has context
              if (mapperContext) {
                // If the context also has the static data
                // do not ask the backend for the interface info
                if (mapperContext.static_data) {
                  getFieldsFromStaticData(mapperContext.static_data);
                } else {
                  // Ask backend for the context interface
                  const { data } = await callBackendBasic(
                    Messages.GET_INTERFACE_DATA,
                    'return-interface-data-complete',
                    {
                      iface_kind: mapperContext.iface_kind,
                      name: mapperContext.name,
                      custom_data: {
                        event: 'context',
                        iface_kind: mapperContext.iface_kind,
                      },
                    }
                  );

                  if (
                    data?.custom_data?.event === 'context' &&
                    data[data.custom_data.iface_kind]['staticdata-type']
                  ) {
                    // Save the static data
                    const staticData = data[data.custom_data.iface_kind]['staticdata-type'];
                    // Get all the needed data from static data
                    getFieldsFromStaticData(staticData);
                    setIsContextLoaded(true);
                  }
                }
              } else {
                setContextInputs(null);
                setIsContextLoaded(true);
                maybeApplyStoredDraft();
              }
            } else {
              setIsContextLoaded(true);
              maybeApplyStoredDraft();
            }
          })();
        }
      }, [qorus_instance, mapper, props.currentMapperContext, draftSavedForLater]);

      useEffect(() => {
        if (props.mapper) {
          setMapper(props.mapper);
        }
      }, [props.mapper]);

      /*if (!error && qorus_instance && (!mapperKeys || (props.isEditingMapper && (!inputs || !outputs)))) {
            console.log(error, qorus_instance, mapperKeys, inputs, outputs);
            return <Component {...props} />;
        }*/

      const addField = (fieldsType, path, data) => {
        // Save the field setters to be easily accessible
        const fieldSetters: any = { inputs: setInputs, outputs: setOutputs };
        // Set the new fields
        fieldSetters[fieldsType]((current) => {
          // Clone the current fields
          const result: any = { ...current };
          // If we are adding field to the top
          if (path === '') {
            // Simply add the field
            result[data.name] = data;
            return result;
          }
          // Build the path
          const fields: string[] = path.split(/(?<!\\)\./g);
          let newPathList: string[];
          fields.forEach((fieldName) => {
            if (!newPathList) {
              newPathList = [fieldName];
            } else {
              newPathList.push('type', 'fields', fieldName);
            }
          });
          // Get the object at the exact path
          const obj: any = get(result, newPathList);
          // Add new object
          obj.type.fields[data.name] = data;
          // Return new data
          return result;
        });
      };

      const updateRelations = (type: 'inputs' | 'outputs', oldName: string, newName: string) => {
        setRelations((cur) => {
          let result = { ...cur };

          result = reduce(
            result,
            (newResult, relation, relationOutputName) => {
              if (type === 'outputs') {
                if (relationOutputName === oldName) {
                  return {
                    ...newResult,
                    [newName]: relation,
                  };
                }

                if (relationOutputName.includes(`${oldName}.`)) {
                  return {
                    ...newResult,
                    [relationOutputName.replace(`${oldName}.`, `${newName}.`)]: relation,
                  };
                }

                return {
                  ...newResult,
                  [relationOutputName]: relation,
                };
              } else {
                if (relation.name === oldName) {
                  return {
                    ...newResult,
                    [relationOutputName]: {
                      ...relation,
                      name: newName,
                    },
                  };
                }

                if (relation.name?.includes(`${oldName}.`)) {
                  return {
                    ...newResult,
                    [relationOutputName]: {
                      ...relation,
                      name: relation.name.replace(`${oldName}.`, `${newName}.`),
                    },
                  };
                }

                return {
                  ...newResult,
                  [relationOutputName]: relation,
                };
              }
            },
            {}
          );

          return result;
        });
      };

      const editField = (fieldsType, path, data, remove: boolean) => {
        // Save the field setters to be easily accessible
        const fieldSetters: any = { inputs: setInputs, outputs: setOutputs };
        // Set the new fields
        fieldSetters[fieldsType]((current) => {
          // Clone the current fields
          const result: any = { ...current };
          // Build the path
          const fields: string[] = path.split(/(?<!\\)\./g);
          let newPathList: string[];
          fields.forEach((fieldName) => {
            if (!newPathList) {
              newPathList = [fieldName];
            } else {
              newPathList.push('type', 'fields', fieldName);
            }
          });

          // Always remove the original object
          unset(result, newPathList);

          if (remove) {
            return result;
          }
          // Build the updated path
          const oldFields: string[] = path.split(/(?<!\\)\./g);
          // Remove the last value from the fields
          oldFields.pop();
          // Add the new name to the end of the fields list
          oldFields.push(data.name);

          let newUpdatedPathList: string[];

          oldFields.forEach((fieldName) => {
            if (!newUpdatedPathList) {
              newUpdatedPathList = [fieldName];
            } else {
              newUpdatedPathList.push('type', 'fields', fieldName);
            }
          });
          // Get the object at the exact path
          set(result, newUpdatedPathList, {
            ...data,
            path: oldFields.join('.'),
          });

          updateRelations(fieldsType, path, oldFields.join('.'));
          // Return new data
          return result;
        });
      };

      const removeCodeFromRelations = (removedMapperCode?: string[]) => {
        setRelations((current) => {
          const newRelations = reduce(
            current,
            (newRels, relationData, relationName) => {
              const newRelationData = { ...relationData };
              // Check if this relation has code
              if (newRelationData.code) {
                // Get the mapper code without method
                const [mapperCodeName] = newRelationData.code.split('.');
                // Check if the code matches the removed code
                // or if the removed mapper code is empty
                // which means all code needs to be removed
                if (!removedMapperCode || removedMapperCode.includes(mapperCodeName)) {
                  // Delete the code
                  delete newRelationData.code;
                }
                // Check if there is any other key in the relation
                if (size(newRelationData)) {
                  // Return the new relation
                  return { ...newRels, [relationName]: newRelationData };
                } else {
                  // Return without this relation
                  return { ...newRels };
                }
              }
              // Return unchanged
              return { ...newRels, [relationName]: relationData };
            },
            {}
          );

          return newRelations;
        });
      };

      return (
        <MapperContext.Provider
          value={{
            isContextLoaded,
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
            relations: fixRelations(relations, flattenFields(outputs), flattenFields(inputs)),
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
            isEditingMapper: props.isEditingMapper,
            isFromConnectors: mapper?.isFromConnectors,
            hasInitialInput: mapper?.hasInitialInput,
            hasInitialOutput: mapper?.hasInitialOutput,
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
            removeCodeFromRelations,
            contextInputs,
            defaultMapper: mapper,
            setMapperFromDraft,
          }}
        >
          <Component {...props} />
        </MapperContext.Provider>
      );
    };

    return compose(
      withInitialDataConsumer(),
      withFieldsConsumer(),
      mapProps(({ mapper, getSelectedFieldValue, ...rest }) => ({
        initialShow: !!mapper,
        mapper,
        isEditingMapper: !!mapper?.name,
        currentMapperContext: getSelectedFieldValue('mapper', 'context'),
        ...rest,
      })),
      withTextContext(),
      withMessageHandler()
    )(EnhancedComponent);
  };
