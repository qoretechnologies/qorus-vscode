import { Button, ButtonGroup, Icon, Intent, Tooltip } from '@blueprintjs/core';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useEffect, useState } from 'react';
import { useDrop } from 'react-dnd';
import compose from 'recompose/compose';
import styled, { css } from 'styled-components';
import { TTranslator } from '../../App';
import { AppToaster } from '../../components/Toast';
import { Messages } from '../../constants/messages';
import {
    flattenFields,
    getLastChildIndex,
    getStaticDataFieldname,
    hasStaticDataField,
} from '../../helpers/mapper';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import { ActionsWrapper, IField } from '../InterfaceCreator/panel';
import MapperInput from './input';
import MappingModal, { getKeyType } from './mappingModal';
import MapperFieldModal from './modal';
import MapperOutput from './output';
import Provider from './provider';

const FIELD_HEIGHT = 35;
const FIELD_MARGIN = 14;
const TYPE_COLORS = {
    int: '#3a9c52',
    float: '#1f8c71',
    number: '#217536',

    string: '#2c5ba8',
    date: '#443e9c',

    listauto: '#693594',
    hashauto: '#9723a8',

    bool: '#a66121',
    binary: '#e6b12e',

    any: '#a9a9a9',
    auto: '#d7d7d7',
};

export const StyledMapperWrapper = styled.div`
    width: 920px;
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    margin: 0 auto;
    height: 100%;
`;

export const StyledFieldsWrapper = styled.div`
    flex: 1 1 auto;
    height: 100%;
    width: 300px;
`;

const StyledConnectionsWrapper = styled.div`
    flex: 1 1 auto;
    height: 100%;
    width: 300px;
`;

export const StyledMapperField = styled.div`
    width: ${({ isChild, level }) => (isChild ? `${300 - level * 15}px` : '300px')};

    ${({ input, isChild, level }) =>
        input &&
        css`
            margin-left: ${isChild ? `${level * 15}px` : '0'};
        `}

    height: ${({ isInputHash }) => (isInputHash ? '55px' : `${FIELD_HEIGHT}px`)};
    border: 1px solid #d7d7d7;
    border-radius: 3px;
    margin-bottom: ${FIELD_MARGIN}px;
    transition: all 0.3s;
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
    position: relative;
    cursor: ${({ isDisabled }) => (isDisabled ? 'initial' : 'pointer')};

    ${({ isDisabled }) =>
        css`
            &:hover {
                border-color: ${isDisabled ? '#d7d7d7' : '#137cbd'};
            }
        `};

    ${({ childrenCount, isDragging }) =>
        childrenCount !== 0 && !isDragging
            ? css`
                  &:after {
                      content: '';
                      display: table;
                      position: absolute;
                      width: 1px;
                      ${({ input }) =>
                          input
                              ? css`
                                    left: -1px;
                                `
                              : css`
                                    right: -1px;
                                `};
                      top: ${FIELD_HEIGHT / 2}px;
                      height: ${childrenCount * (FIELD_HEIGHT + FIELD_MARGIN)}px;
                      background-color: #d7d7d7;
                      z-index: 0;
                  }
              `
            : null}

    ${({ isChild, isDragging }) =>
        isChild && !isDragging
            ? css`
                  &:before {
                      content: '';
                      display: table;
                      position: absolute;
                      width: 15px;
                      height: 1px;
                      ${({ input }) =>
                          input
                              ? css`
                                    left: -15px;
                                `
                              : css`
                                    right: -15px;
                                `};
                      top: ${FIELD_HEIGHT / 2}px;
                      background-color: #d7d7d7;
                      z-index: 0;
                  }
              `
            : null}

    h4 {
        text-align: center;
        font-size: 14px;
        line-height: 34px;
        margin: 0;
        padding: 0;
    }

    p.type {
        background-color: #d7d7d7;

        &.string {
            background-color: ${TYPE_COLORS.string};
        }
        &.int {
            background-color: ${TYPE_COLORS.int};
        }
        &.number {
            background-color: ${TYPE_COLORS.number};
        }
        &.float {
            background-color: ${TYPE_COLORS.float};
        }
        &.date {
            background-color: ${TYPE_COLORS.date};
        }
        &.listauto {
            background-color: ${TYPE_COLORS.listauto};
        }
        &.hashauto {
            background-color: ${TYPE_COLORS.hashauto};
        }
        &.binary {
            background-color: ${TYPE_COLORS.binary};
        }
        &.bool {
            background-color: ${TYPE_COLORS.bool};
        }
        &.any {
            background-color: ${TYPE_COLORS.any};
        }
        border-radius: 3px;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        text-align: center;
        font-size: 10px;
        line-height: 14px;
        top: -8px;
        margin: 0;
        padding: 0 3px;
        color: #fff;
    }
`;

const StyledInfoMessage = styled.p`
    text-align: center;
    color: #a9a9a9;
`;

const StyledUrlMessage = styled.p`
    text-align: center;
    height: 30px;
    line-height: 30px;
    text-overflow: ellipsis;
    color: #a9a9a9;
    font-size: 12px;
    font-weight: 300;
    word-break: keep-all;
    white-space: nowrap;
    overflow: hidden;
    margin: 0;
`;

const StyledFieldHeader = styled.h3`
    margin: 0;
    padding: 0;
    margin-bottom: 10px;
    text-align: center;
`;

const StyledLine = styled.line`
    stroke-width: 3px;
    cursor: pointer;

    &:hover {
        stroke: #ff0000;
    }
`;

export interface IMapperCreatorProps {
    initialData: any;
    t: TTranslator;
    inputs: any[];
    setInputs: (inputs: any) => void;
    outputs: any[];
    setOutputs: (outputs: any) => void;
    providerData: any[];
    setProviderData: (data: any) => void;
    inputProvider: string;
    setInputProvider: (provider: string) => void;
    outputProvider: string;
    setOutputProvider: (provider: string) => void;
    relations: any;
    setRelations: (relations: any) => void;
    inputsLoading: boolean;
    setInputsLoading: (loading: boolean) => void;
    outputsLoading: boolean;
    setOutputsLoading: (loading: boolean) => void;
    onBackClick: () => void;
    addField: (fieldsType: string, path: string, name: string, data?: any) => void;
    editField: (fieldsType: string, path: string, name: string, data?: any) => void;
    isFormValid: boolean;
    setMapperKeys: (keys: any) => void;
    mapperKeys: any;
    methods: any[];
    inputOptionProvider: { optionKey: string; optionUrl: string };
    outputOptionProvider: { optionKey: string; optionUrl: string };
    setInputOptionProvider: any;
    setOutputOptionProvider: any;
    isEditing?: boolean;
    postMessage: TPostMessage;
}

export interface IMapperRelation {
    input: string;
    output: string;
}

const MapperCreator: React.FC<IMapperCreatorProps> = ({
    initialData,
    t,
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
    onBackClick,
    isFormValid,
    addField,
    editField,
    setMapperKeys,
    mapperKeys,
    methods,
    selectedFields,
    inputOptionProvider,
    outputOptionProvider,
    setInputOptionProvider,
    setOutputOptionProvider,
    hideInputSelector,
    hideOutputSelector,
    setHideInputSelector,
    setHideOutputSelector,
    isEditingMapper: isEditing,
    postMessage,
    interfaceId,
    getUrlFromProvider,
    mapperSubmit,
    resetAllInterfaceData,
    resetMapper,
    isFromConnectors,
    contextInputs,
    hasInitialInput,
    hasInitialOutput,
    onSubmitSuccess,
    defaultMapper,
    setShowMapperConnections,
    context,
    isContextLoaded,
    interfaceIndex,
}) => {
    const [{ isDragging }, _dropRef] = useDrop({
        accept: 'none',
        canDrop: () => false,
        collect: (monitor) => ({
            isDragging: !!monitor.getItem(),
        }),
    });
    const [addDialog, setAddDialog] = useState({});
    const [mappingDialog, setMappingDialog] = useState({});

    useEffect(() => {
        const mapper = selectedFields.mapper[interfaceIndex];
        const ctx = mapper.find((mapperField) => mapperField.name === 'context');

        if (ctx && isContextLoaded) {
            // Fix relations
            // If the context and previous context are different
            // remove all the context fields
            const contextFields = contextInputs && flattenFields(contextInputs);
            let hasFixedContext = false;

            setRelations((cur) => {
                let result = { ...cur };

                result = reduce(
                    result,
                    (newResult, relation, outputField) => {
                        if (relation.context) {
                            // check if the field exists in inputs
                            const contextInputFieldName = getStaticDataFieldname(relation.context);

                            if (
                                hasStaticDataField(relation.context) &&
                                (!contextFields ||
                                    !contextFields.find((cF) => cF.path === contextInputFieldName))
                            ) {
                                hasFixedContext = true;
                                return {
                                    ...newResult,
                                    [outputField]: {
                                        ...omit(relation, ['context']),
                                    },
                                };
                            }
                        }

                        return {
                            ...newResult,
                            [outputField]: relation,
                        };
                    },
                    {}
                );

                if (hasFixedContext) {
                    AppToaster.show({
                        message: t('RemovedIncompatibleContext'),
                        intent: 'warning',
                        timeout: 3000,
                        icon: 'warning-sign',
                    });
                }

                return result;
            });
        }
    }, [outputs, contextInputs, isContextLoaded]);

    if (!isContextLoaded) {
        return <p> Loading... </p>;
    }

    const saveRelationData: (outputPath: string, data: any, merge?: boolean) => void = (
        outputPath,
        data,
        merge
    ) => {
        setRelations((current) => {
            const result = { ...current };
            // Check if this output already exists
            if (!result[outputPath]) {
                // Create it
                result[outputPath] = {};
            }
            // Add / merge the new data
            return reduce(
                result,
                (newRelations, relation, output) => {
                    // Check if the output matches
                    if (output === outputPath) {
                        relation = merge ? { ...relation, ...data } : data;
                    }
                    // Return new data
                    return { ...newRelations, [output]: relation };
                },
                {}
            );
        });
    };

    const removeRelation: (
        outputPath: string,
        usesContext?: boolean,
        isInputHash?: boolean
    ) => void = (outputPath, usesContext, isInputHash) => {
        // Remove the selected relation
        // @ts-ignore
        setRelations((current: any): any =>
            reduce(
                current,
                (newRelations, rel: any, relationOutput): boolean => {
                    if (relationOutput === outputPath) {
                        return {
                            ...newRelations,
                            [relationOutput]: omit(
                                rel,
                                usesContext
                                    ? ['context']
                                    : isInputHash
                                    ? ['use_input_record']
                                    : ['name']
                            ),
                        };
                    }
                    return { ...newRelations, [relationOutput]: rel };
                },
                {}
            )
        );
    };

    const removeFieldRelations: (path: string, type: string) => void = (path, type) => {
        // Remove the selected relation
        // @ts-ignore
        setRelations((current) =>
            reduce(
                current,
                (newRelations, rel, relationOutput: string) => {
                    if (type === 'outputs') {
                        if (relationOutput && relationOutput.startsWith(path)) {
                            return { ...newRelations };
                        }

                        return { ...newRelations, [relationOutput]: rel };
                    } else {
                        if (rel.name && rel.name.startsWith(path)) {
                            return { ...newRelations, [relationOutput]: omit(rel, ['name']) };
                        }

                        return { ...newRelations, [relationOutput]: rel };
                    }
                },
                {}
            )
        );
    };

    const renameFieldRelation: (oldPath: string, newPath: string, type: string) => void = (
        oldPath,
        newPath,
        type
    ) => {
        // Remove the selected relation
        // @ts-ignore
        setRelations((current) =>
            reduce(
                current,
                (newRelations, rel, relationOutput: string) => {
                    if (type === 'outputs') {
                        if (relationOutput && relationOutput.startsWith(oldPath)) {
                            const path = relationOutput.replace(oldPath, newPath);

                            return { ...newRelations, [path]: rel };
                        }

                        return { ...newRelations, [relationOutput]: rel };
                    } else {
                        if (rel.name && rel.name.startsWith(oldPath)) {
                            rel.name = rel.name.replace(oldPath, newPath);

                            return { ...newRelations, [relationOutput]: rel };
                        }

                        return { ...newRelations, [relationOutput]: rel };
                    }
                },
                {}
            )
        );
    };

    const clearInputs: (soft?: boolean) => void = (soft) => {
        // Reset all the data to default
        if (!soft) {
            setInputProvider(null);
            setInputChildren([]);
        }
        setRelations({});
        setInputs(null);
        setInputsLoading(false);
        setInputRecord(null);
        setHideInputSelector(false);
    };

    const clearOutputs: (soft?: boolean) => void = (soft) => {
        // Reset all the data to default
        if (!soft) {
            setOutputProvider(null);
            setOutputChildren([]);
        }
        setRelations({});
        setOutputs(null);
        setOutputsLoading(false);
        setOutputRecord(null);
        setHideOutputSelector(false);
    };

    const reset: () => void = () => {
        resetAllInterfaceData('mapper', true);
    };

    const isMapperValid: () => boolean = () =>
        isFormValid && size(filterEmptyRelations(relations)) !== 0;
    const flattenedInputs = inputs && flattenFields(inputs);
    const flattenedContextInputs = contextInputs && flattenFields(contextInputs);
    const flattenedOutputs = outputs && flattenFields(outputs);

    const hasAvailableRelation: (types: string[]) => boolean = (types) => {
        if (flattenedOutputs) {
            let availableOutputsCount = 0;
            // Loop through all the output fields that support this field
            // with the provided types
            flattenedOutputs
                .filter(
                    (output) =>
                        types.includes('any') ||
                        output.type.types_accepted.includes('any') ||
                        (size(types) <= size(output.type.types_accepted) &&
                            output.type.types_accepted.some((type: string) => types.includes(type)))
                )
                .forEach((output) => {
                    if (isAvailableForDrop(output.path)) {
                        availableOutputsCount++;
                    }
                });
            if (availableOutputsCount) {
                return true;
            }
            return false;
        }
        return false;
    };

    const isAvailableForDrop = (outputPath: string): boolean => {
        // Get the unique roles for the name key
        const { unique_roles } = mapperKeys.name;
        // Get the unique roles for this output
        const uniqueRoles: string[] = reduce(
            relations[outputPath],
            (roles, _value, key) =>
                mapperKeys[key].unique_roles ? [...roles, ...mapperKeys[key].unique_roles] : roles,
            []
        );
        // Check if none of the keys roles & a * role isn't
        // yet included
        if (
            unique_roles.every((role) => !uniqueRoles.includes(role)) &&
            !uniqueRoles.includes('*')
        ) {
            return true;
        }
        return false;
    };

    const getFieldTypeColor: (
        type: 'inputs' | 'outputs' | 'context',
        name: string,
        types?: string[]
    ) => string = (type, name, types) => {
        if (types) {
            // Return the color
            return TYPE_COLORS[types[0].replace(/</g, '').replace(/>/g, '')];
        }
        const fieldTypes = {
            inputs: flattenedInputs,
            outputs: flattenedOutputs,
            context: flattenedContextInputs,
        };
        // Find the field
        const field = fieldTypes[type].find((input) => input.path === name);
        if (field) {
            // Return the color
            return TYPE_COLORS[field.type.types_returned[0].replace(/</g, '').replace(/>/g, '')];
        }
        return null;
    };

    const handleClick =
        (type) =>
        (field?: any, edit?: boolean, remove?: boolean): void => {
            if (remove) {
                editField(type, field.path, null, true);
                removeFieldRelations(field.path, type);
            } else {
                // Save the fields into a accessible object
                const fields = { inputs, outputs };

                setAddDialog({
                    isOpen: true,
                    siblings: field ? field?.type?.fields : fields[type],
                    fieldData: edit ? field : null,
                    type,
                    isParentCustom: field?.isCustom,
                    onSubmit: (data) => {
                        if (edit) {
                            editField(type, field.path, data);
                            renameFieldRelation(field.path, data.path, type);
                        } else {
                            addField(type, field?.path || '', data);
                        }
                    },
                });
            }
        };

    const handleManageClick = (output) => {
        setMappingDialog({
            isOpen: true,
            relationData: relations[output.path],
            inputs: flattenedInputs,
            mapperKeys,
            output,
            onSubmit: (relation) => {
                setRelations((current) => {
                    const result = { ...current };
                    result[output.path] = relation;
                    return result;
                });
            },
        });
    };

    const filterEmptyRelations: (relations: any) => any = (relations) => {
        return reduce(
            relations,
            (newRel, rel, name) => {
                if (size(rel)) {
                    return {
                        ...newRel,
                        [name]: rel,
                    };
                }
                return newRel;
            },
            {}
        );
    };

    const getCustomFields: (type: string) => any[] = (type) => {
        if (type === 'inputs') {
            if (flattenedInputs) {
                return flattenedInputs.reduce((newInputs, input) => {
                    if (input.firstCustomInHierarchy) {
                        return { ...newInputs, [input.name]: input };
                    }
                    return newInputs;
                }, {});
            }
            return {};
        } else {
            return flattenedOutputs.reduce((newOutputs, output) => {
                if (output.firstCustomInHierarchy) {
                    return { ...newOutputs, [output.name]: output };
                }
                return newOutputs;
            }, {});
        }
    };

    const handleDrop = (
        inputPath: string,
        outputPath: string,
        usesContext?: boolean,
        isInputHash?: boolean
    ): void => {
        // If the user is mapping the whole input hash
        if (isInputHash) {
            // If the user is mapping static data inputi
            if (usesContext) {
                saveRelationData(outputPath, { context: `$static:*` });
            }
            // User is mapping the selected type type
            else {
                saveRelationData(outputPath, { use_input_record: true });
            }
        }
        // User is mapping ordinary field
        else {
            saveRelationData(
                outputPath,
                usesContext ? { context: `$static:{${inputPath}}` } : { name: inputPath },
                true
            );
        }
    };

    const handleSubmitClick = async () => {
        // Build the mapper object
        const mapper = reduce(
            selectedFields.mapper[interfaceIndex],
            (result: { [key: string]: any }, field: IField) => ({
                ...result,
                [field.name]: field.value,
            }),
            {}
        );
        // Add the relations
        mapper.fields = filterEmptyRelations(relations);
        // Rebuild the mapper options
        const mapperOptions: { [key: string]: any } = mapper.mapper_options;
        // Add the input & output providers
        mapper.mapper_options = {
            ...mapperOptions,
            'mapper-input': {
                ...inputOptionProvider,
                'custom-fields': getCustomFields('inputs'),
            },
            'mapper-output': {
                ...outputOptionProvider,
                'custom-fields': getCustomFields('outputs'),
            },
        };
        // Create the mapper field options type list
        const relationTypeList = [];
        forEach(mapper.fields, (relationData, outputFieldName) => {
            const outputField = flattenedOutputs.find((o) => o.path === outputFieldName);
            // Go through the data in the output field relation
            forEach(relationData, (_, relationName) => {
                relationTypeList.push({
                    outputField: outputFieldName,
                    field: relationName,
                    type: getKeyType(relationName, mapperKeys, outputField),
                });
            });
        });

        mapper.output_field_option_types = relationTypeList;

        if (mapper.context) {
            delete mapper.context.static_data;
        }

        const result = await initialData.callBackend(
            !isEditing ? Messages.CREATE_INTERFACE : Messages.EDIT_INTERFACE,
            undefined,
            {
                iface_kind: 'mapper',
                data: mapper,
                orig_data: defaultMapper || initialData.mapper,
                open_file_on_success: !mapperSubmit,
                iface_id: interfaceId.mapper,
                no_data_return: !!onSubmitSuccess || !!mapperSubmit,
            },
            t('Saving mapper...')
        );

        if (result.ok) {
            // If on submit
            if (mapperSubmit) {
                mapperSubmit(mapper.name, mapper.version);
            }
            // If on submit success exists
            if (onSubmitSuccess) {
                onSubmitSuccess(mapper);
            }
            // Reset the interface data
            resetAllInterfaceData('mapper');
        }
    };

    return (
        <>
            {!hideInputSelector && (
                <Provider
                    type="inputs"
                    title={t('InputProvider')}
                    provider={inputProvider}
                    setProvider={setInputProvider}
                    record={inputRecord}
                    setRecord={setInputRecord}
                    nodes={inputChildren}
                    setChildren={setInputChildren}
                    isLoading={inputsLoading}
                    setIsLoading={setInputsLoading}
                    setFields={setInputs}
                    clear={clearInputs}
                    setOptionProvider={setInputOptionProvider}
                    hide={() => setHideInputSelector(true)}
                    canSelectNull
                />
            )}
            {!hideOutputSelector && (
                <Provider
                    type="outputs"
                    title={t('OutputProvider')}
                    provider={outputProvider}
                    setProvider={setOutputProvider}
                    record={outputRecord}
                    setRecord={setOutputRecord}
                    nodes={outputChildren}
                    setChildren={setOutputChildren}
                    isLoading={outputsLoading}
                    setIsLoading={setOutputsLoading}
                    setFields={setOutputs}
                    clear={clearOutputs}
                    setMapperKeys={setMapperKeys}
                    setOptionProvider={setOutputOptionProvider}
                    hide={() => setHideOutputSelector(true)}
                />
            )}
            <div
                style={{
                    width: '100%',
                    marginTop:
                        isFromConnectors || isEditing || (hideInputSelector && hideOutputSelector)
                            ? 0
                            : '15px',
                    padding: 10,
                    flex: 1,
                    overflow: 'auto',
                    background: `url(${`${initialData.image_path}/images/tiny_grid.png)`}`,
                }}
            >
                <StyledMapperWrapper>
                    <StyledFieldsWrapper>
                        <StyledFieldHeader>
                            <MapperInput
                                name={
                                    <>
                                        <span> Input </span>
                                        {hideInputSelector ? (
                                            <>
                                                {isFromConnectors && hasInitialInput ? (
                                                    <Tooltip content={getUrlFromProvider('input')}>
                                                        <Icon
                                                            style={{ lineHeight: '10px' }}
                                                            icon="info-sign"
                                                            iconSize={16}
                                                            color="#a9a9a9"
                                                        />
                                                    </Tooltip>
                                                ) : (
                                                    <Tooltip content={t('EditProvider')}>
                                                        <Button
                                                            icon="edit"
                                                            small
                                                            minimal
                                                            onClick={() => {
                                                                setHideInputSelector(false);
                                                                if (isEditing) {
                                                                    clearInputs();
                                                                }
                                                            }}
                                                        />
                                                    </Tooltip>
                                                )}
                                                <Tooltip
                                                    targetTagName="div"
                                                    content={getUrlFromProvider('input')}
                                                >
                                                    <StyledUrlMessage
                                                        style={{
                                                            height: '12px',
                                                            lineHeight: '12px',
                                                        }}
                                                    >
                                                        {getUrlFromProvider('input') === ''
                                                            ? '-'
                                                            : getUrlFromProvider('input')}
                                                    </StyledUrlMessage>
                                                </Tooltip>
                                            </>
                                        ) : (
                                            <StyledUrlMessage
                                                style={{ height: '12px', lineHeight: '12px' }}
                                            >
                                                -
                                            </StyledUrlMessage>
                                        )}
                                    </>
                                }
                                types={['hash<auto>']}
                                type={{
                                    base_type: 'hash<auto>',
                                }}
                                id={1}
                                isWholeInput
                                lastChildIndex={0}
                                hasAvailableOutput={hasAvailableRelation(['hash<auto>'])}
                            />
                        </StyledFieldHeader>
                        {size(flattenedInputs) !== 0
                            ? map(flattenedInputs, (input, index) => (
                                  <MapperInput
                                      key={input.path}
                                      name={input.name}
                                      types={input.type.types_returned}
                                      {...input}
                                      field={input}
                                      id={index + 1}
                                      lastChildIndex={
                                          getLastChildIndex(input, flattenedInputs) - index
                                      }
                                      onClick={handleClick('inputs')}
                                      hasAvailableOutput={hasAvailableRelation(
                                          input.type.types_returned
                                      )}
                                  />
                              ))
                            : null}
                        {size(flattenedInputs) === 0 &&
                        !(hideInputSelector && inputOptionProvider?.can_manage_fields) ? (
                            <StyledInfoMessage>
                                {inputOptionProvider?.type === 'factory'
                                    ? t('NoMapperFieldsAvailable')
                                    : t('MapperNoInputFields')}
                            </StyledInfoMessage>
                        ) : null}
                        {hideInputSelector && inputOptionProvider?.can_manage_fields && (
                            <Button
                                fill
                                text={t('AddNewField')}
                                minimal
                                intent="success"
                                icon="add"
                                style={{ marginBottom: '10px' }}
                                onClick={() => handleClick('inputs')()}
                            />
                        )}
                        {size(flattenedContextInputs) !== 0 && (
                            <MapperInput
                                name={
                                    <>
                                        <span>{t('StaticData')}</span>

                                        <StyledUrlMessage
                                            style={{ height: '12px', lineHeight: '12px' }}
                                        >
                                            {t('StaticDataFieldDesc')}
                                        </StyledUrlMessage>
                                    </>
                                }
                                types={['hash<auto>']}
                                type={{
                                    base_type: 'hash<auto>',
                                }}
                                id={1}
                                isWholeInput
                                usesContext
                                lastChildIndex={0}
                                hasAvailableOutput={hasAvailableRelation(['hash<auto>'])}
                            />
                        )}
                        {size(flattenedContextInputs) !== 0
                            ? map(flattenedContextInputs, (input, index) => (
                                  <MapperInput
                                      key={input.path}
                                      name={input.name}
                                      types={input.type.types_returned}
                                      {...input}
                                      field={input}
                                      id={(flattenedInputs?.length || 0) + (index + 1)}
                                      lastChildIndex={
                                          getLastChildIndex(input, flattenedContextInputs) - index
                                      }
                                      usesContext
                                      hasAvailableOutput={hasAvailableRelation(
                                          input.type.types_returned
                                      )}
                                  />
                              ))
                            : null}
                    </StyledFieldsWrapper>
                    <StyledConnectionsWrapper>
                        {size(relations) && !isDragging ? (
                            <svg
                                height={
                                    Math.max(
                                        [
                                            ...(flattenedInputs || []),
                                            ...(flattenedContextInputs || []),
                                        ]?.length,
                                        flattenedOutputs?.length
                                    ) *
                                        (FIELD_HEIGHT + FIELD_MARGIN) +
                                    126
                                }
                            >
                                {map(relations, (relation, outputPath) => (
                                    <>
                                        {!!relation.name && (
                                            <>
                                                <defs>
                                                    <linearGradient
                                                        id={outputPath
                                                            .replace(/ /g, '')
                                                            .replace(/\./g, '')
                                                            .replace(/\\/g, '')}
                                                        x1="0"
                                                        y1={
                                                            (flattenedInputs.findIndex(
                                                                (input) =>
                                                                    input.path === relation.name
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            68 -
                                                            0.5
                                                        }
                                                        x2={0}
                                                        y2={
                                                            (flattenedOutputs.findIndex(
                                                                (output) =>
                                                                    output.path === outputPath
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            61 +
                                                            0.5
                                                        }
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'inputs',
                                                                relation.name
                                                            )}
                                                            offset="0"
                                                        />
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'outputs',
                                                                outputPath
                                                            )}
                                                            offset="1"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <StyledLine
                                                    key={outputPath.replace(/ /g, '')}
                                                    stroke={`url(#${outputPath
                                                        .replace(/ /g, '')
                                                        .replace(/\./g, '')
                                                        .replace(/\\/g, '')})`}
                                                    onClick={() => removeRelation(outputPath)}
                                                    x1={0}
                                                    y1={
                                                        (flattenedInputs.findIndex(
                                                            (input) => input.path === relation.name
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        68 -
                                                        1.5
                                                    }
                                                    x2={300}
                                                    y2={
                                                        (flattenedOutputs.findIndex(
                                                            (output) => output.path === outputPath
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        61 +
                                                        1.5
                                                    }
                                                />
                                            </>
                                        )}
                                        {relation.use_input_record && (
                                            <>
                                                <defs>
                                                    <linearGradient
                                                        id={outputPath
                                                            .replace(/ /g, '')
                                                            .replace(/\./g, '')
                                                            .replace(/\\/g, '')}
                                                        x1="0"
                                                        y1={27}
                                                        x2={0}
                                                        y2={
                                                            (flattenedOutputs.findIndex(
                                                                (output) =>
                                                                    output.path === outputPath
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            61 +
                                                            0.5
                                                        }
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'inputs',
                                                                null,
                                                                ['hash<auto>']
                                                            )}
                                                            offset="0"
                                                        />
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'outputs',
                                                                outputPath
                                                            )}
                                                            offset="1"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <StyledLine
                                                    key={outputPath.replace(/ /g, '')}
                                                    stroke={`url(#${outputPath
                                                        .replace(/ /g, '')
                                                        .replace(/\./g, '')
                                                        .replace(/\\/g, '')})`}
                                                    onClick={() =>
                                                        removeRelation(outputPath, false, true)
                                                    }
                                                    x1={0}
                                                    y1={27}
                                                    x2={300}
                                                    y2={
                                                        (flattenedOutputs.findIndex(
                                                            (output) => output.path === outputPath
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        61 +
                                                        1.5
                                                    }
                                                />
                                            </>
                                        )}
                                        {!!relation.context &&
                                        hasStaticDataField(relation.context) &&
                                        size(flattenedContextInputs) ? (
                                            <>
                                                <defs>
                                                    <linearGradient
                                                        id={outputPath
                                                            .replace(/ /g, '')
                                                            .replace(/\./g, '')
                                                            .replace(/\\/g, '')}
                                                        x1="0"
                                                        y1={
                                                            63 +
                                                            63 +
                                                            (size(flattenedInputs) +
                                                                (inputOptionProvider?.can_manage_fields
                                                                    ? 1
                                                                    : 0) +
                                                                flattenedContextInputs.findIndex(
                                                                    (input) =>
                                                                        input.path ===
                                                                        getStaticDataFieldname(
                                                                            relation.context
                                                                        )
                                                                ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN)
                                                        }
                                                        x2={0}
                                                        y2={
                                                            (flattenedOutputs.findIndex(
                                                                (output) =>
                                                                    output.path === outputPath
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            61 +
                                                            0.5
                                                        }
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'context',
                                                                getStaticDataFieldname(
                                                                    relation.context
                                                                )
                                                            )}
                                                            offset="0"
                                                        />
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'outputs',
                                                                outputPath
                                                            )}
                                                            offset="1"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <StyledLine
                                                    key={outputPath}
                                                    stroke={`url(#${outputPath
                                                        .replace(/ /g, '')
                                                        .replace(/\./g, '')
                                                        .replace(/\\/g, '')})`}
                                                    onClick={() =>
                                                        removeRelation(outputPath, true, true)
                                                    }
                                                    x1={0}
                                                    y1={
                                                        63 +
                                                        63 +
                                                        (size(flattenedInputs) +
                                                            (inputOptionProvider?.can_manage_fields
                                                                ? 1
                                                                : 0) +
                                                            flattenedContextInputs.findIndex(
                                                                (input) =>
                                                                    input.path ===
                                                                    getStaticDataFieldname(
                                                                        relation.context
                                                                    )
                                                            ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN)
                                                    }
                                                    x2={300}
                                                    y2={
                                                        (flattenedOutputs.findIndex(
                                                            (output) => output.path === outputPath
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        61 +
                                                        1.5
                                                    }
                                                />
                                            </>
                                        ) : null}
                                        {!!relation.context &&
                                        relation.context === '$static:*' &&
                                        size(flattenedContextInputs) ? (
                                            <>
                                                <defs>
                                                    <linearGradient
                                                        id={outputPath
                                                            .replace(/ /g, '')
                                                            .replace(/\./g, '')
                                                            .replace(/\\/g, '')}
                                                        x1="0"
                                                        y1={
                                                            63 +
                                                            63 +
                                                            (size(flattenedInputs) +
                                                                (inputOptionProvider?.can_manage_fields
                                                                    ? 1
                                                                    : 0)) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            31.5
                                                        }
                                                        x2={0}
                                                        y2={
                                                            (flattenedOutputs.findIndex(
                                                                (output) =>
                                                                    output.path === outputPath
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            61 +
                                                            0.5
                                                        }
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'context',
                                                                null,
                                                                ['hash<auto>']
                                                            )}
                                                            offset="0"
                                                        />
                                                        <stop
                                                            stop-color={getFieldTypeColor(
                                                                'outputs',
                                                                outputPath
                                                            )}
                                                            offset="1"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <StyledLine
                                                    key={outputPath}
                                                    stroke={`url(#${outputPath
                                                        .replace(/ /g, '')
                                                        .replace(/\./g, '')
                                                        .replace(/\\/g, '')})`}
                                                    onClick={() => removeRelation(outputPath, true)}
                                                    x1={0}
                                                    y1={
                                                        63 +
                                                        63 +
                                                        (size(flattenedInputs) +
                                                            (inputOptionProvider?.can_manage_fields
                                                                ? 1
                                                                : 0)) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        31.5
                                                    }
                                                    x2={300}
                                                    y2={
                                                        (flattenedOutputs.findIndex(
                                                            (output) => output.path === outputPath
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        61 +
                                                        1.5
                                                    }
                                                />
                                            </>
                                        ) : null}
                                    </>
                                ))}
                            </svg>
                        ) : null}
                    </StyledConnectionsWrapper>
                    <StyledFieldsWrapper>
                        <StyledFieldHeader>
                            {t('Output')}{' '}
                            {hideOutputSelector && (
                                <>
                                    {isFromConnectors && hasInitialOutput ? (
                                        <Tooltip content={outputRecord}>
                                            <Icon icon="info-sign" iconSize={16} color="#a9a9a9" />
                                        </Tooltip>
                                    ) : (
                                        <Tooltip content={t('EditProvider')}>
                                            <Button
                                                icon="edit"
                                                small
                                                minimal
                                                onClick={() => {
                                                    setHideOutputSelector(false);
                                                    if (isEditing) {
                                                        clearOutputs();
                                                    }
                                                }}
                                            />
                                        </Tooltip>
                                    )}
                                    <Tooltip
                                        targetTagName="div"
                                        content={getUrlFromProvider('output')}
                                    >
                                        <StyledUrlMessage>
                                            {getUrlFromProvider('output')}
                                        </StyledUrlMessage>
                                    </Tooltip>
                                </>
                            )}
                        </StyledFieldHeader>
                        {size(flattenedOutputs) !== 0
                            ? map(flattenedOutputs, (output, index) => (
                                  <MapperOutput
                                      key={output.path}
                                      name={output.name}
                                      hasRelation={!isAvailableForDrop(output.path)}
                                      highlight={!!size(relations[output.path])}
                                      {...output}
                                      field={output}
                                      onDrop={handleDrop}
                                      id={index + 1}
                                      accepts={output.type.types_accepted}
                                      lastChildIndex={
                                          getLastChildIndex(output, flattenedOutputs) - index
                                      }
                                      onClick={handleClick('outputs')}
                                      onManageClick={() => handleManageClick(output)}
                                      t={t}
                                  />
                              ))
                            : null}
                        {size(flattenedOutputs) === 0 ? (
                            <StyledInfoMessage>{t('MapperNoOutputFields')}</StyledInfoMessage>
                        ) : null}
                        {hideOutputSelector && outputOptionProvider?.can_manage_fields && (
                            <Button
                                fill
                                text={t('AddNewField')}
                                minimal
                                intent="success"
                                icon="add"
                                onClick={() => handleClick('outputs')()}
                            />
                        )}
                    </StyledFieldsWrapper>
                </StyledMapperWrapper>
            </div>
            <ActionsWrapper>
                <div style={{ float: 'right', width: '100%' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                disabled={inputsLoading || outputsLoading}
                                onClick={() => {
                                    initialData.confirmAction(
                                        'ResetFieldsConfirm',
                                        reset,
                                        'Reset',
                                        'warning'
                                    );
                                }}
                            />
                        </Tooltip>
                        <Tooltip content={t('BackTooltip')}>
                            <Button
                                text={t('Back')}
                                icon={'undo'}
                                disabled={inputsLoading || outputsLoading}
                                onClick={() => onBackClick()}
                            />
                        </Tooltip>
                        <Button
                            name={'interface-creator-submit-mapper'}
                            text={t('Submit')}
                            onClick={handleSubmitClick}
                            disabled={!isMapperValid()}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
            {addDialog.isOpen && (
                <MapperFieldModal t={t} onClose={() => setAddDialog({})} {...addDialog} />
            )}
            {mappingDialog.isOpen && (
                <MappingModal
                    t={t}
                    onClose={() => setMappingDialog({})}
                    {...mappingDialog}
                    methods={methods}
                />
            )}
        </>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext(),
    withMapperConsumer(),
    withFieldsConsumer(),
    withMessageHandler(),
    withGlobalOptionsConsumer()
)(MapperCreator);
