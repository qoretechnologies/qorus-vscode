import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import MapperInput from './input';
import MapperOutput from './output';
import { FieldWrapper, ActionsWrapper, IField } from '../InterfaceCreator/panel';
import Select from '../../components/Field/select';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { Callout, Spinner, ButtonGroup, Tooltip, Button, Intent, Dialog } from '@blueprintjs/core';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import omit from 'lodash/omit';
import filter from 'lodash/filter';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';
import compose from 'recompose/compose';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import MapperFieldModal from './modal';
import Provider from './provider';
import MappingModal from './mappingModal';
import useMount from 'react-use/lib/useMount';
import { useDrop } from 'react-dnd';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import { Messages } from '../../constants/messages';
import withMessageHandler from '../../hocomponents/withMessageHandler';

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
};

const StyledMapperWrapper = styled.div`
    width: 900px;
    display: flex;
    flex-flow: row;
    justify-content: space-between;
    margin: 0 auto;
    overflow-x: scroll;
`;

const StyledFieldsWrapper = styled.div`
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
    
    height: ${FIELD_HEIGHT}px;
    border: 1px solid #d7d7d7;
    border-radius: 3px;
    margin-bottom: ${FIELD_MARGIN}px;
    transition: all 0.3s;
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
    position: relative;
    cursor: ${({ isDisabled }) => (isDisabled ? 'initial' : 'pointer')};

    .field-manage {
        display: none;
    }

    ${({ input, isDisabled }) =>
        input &&
        css`
            &:hover {
                border-color: ${isDisabled ? '#d7d7d7' : '#137cbd'};

                .field-manage {
                    display: unset;
                }
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

    p {
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
    postMessage,
}) => {
    const [{ isDragging }, _dropRef] = useDrop({
        accept: 'none',
        canDrop: () => false,
        collect: monitor => ({
            isDragging: !!monitor.getItem(),
        }),
    });
    const [addDialog, setAddDialog] = useState({});
    const [mappingDialog, setMappingDialog] = useState({});

    useMount(() => {
        (async () => {
            if (initialData.qorus_instance) {
                const response = await initialData.fetchData('system/default_mapper_keys');
                setMapperKeys(response.data);
            }
        })();
    });

    if (!initialData.qorus_instance) {
        return (
            <Callout title={t('MapperNoInstanceTitle')} icon="warning-sign" intent="warning">
                {t('MapperNoInstance')}
            </Callout>
        );
    }

    if (!mapperKeys) {
        return <p>Loading...</p>;
    }

    const saveRelationData: (outputPath: string, data: any, merge?: boolean) => void = (outputPath, data, merge) => {
        setRelations(current => {
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

    // This functions flattens the fields, by taking all the
    // deep fields from `type` and adds them right after their
    // respective parent field
    const flattenFields: (fields: any, isChild?: boolean, parent?: string, level?: number, path?: string) => any[] = (
        fields,
        isChild = false,
        parent,
        level = 0,
        path = ''
    ) =>
        reduce(
            fields,
            (newFields, field, name) => {
                let res = [...newFields];
                // Build the path for the child fields
                const newPath = level === 0 ? name : `${path}.${name}`;
                const parentPath = level !== 0 && `${path}`;
                // Add the current field
                res = [...res, { name, ...{ ...field, isChild, level, parent, path: newPath, parentPath } }];
                // Check if this field has hierarchy
                if (size(field.type.fields)) {
                    // Recursively add deep fields
                    res = [...res, ...flattenFields(field.type.fields, true, name, level + 1, newPath)];
                }
                // Return the new fields
                return res;
            },
            []
        );

    const removeRelation: (outputPath: string) => void = outputPath => {
        // Remove the selected relation
        // @ts-ignore
        setRelations((current: any): any =>
            reduce(
                current,
                (newRelations, rel: any, relationOutput): boolean => {
                    if (relationOutput === outputPath) {
                        return { ...newRelations, [relationOutput]: omit(rel, ['name']) };
                    }
                    return { ...newRelations, [relationOutput]: rel };
                },
                {}
            )
        );
    };

    const removeFieldRelations: (path: string) => void = path => {
        // Remove the selected relation
        // @ts-ignore
        setRelations(current =>
            reduce(current, (newRelations, rel, relationOutput: string) => {
                if (rel.name && rel.name.startsWith(path)) {
                    return { ...newRelations, [relationOutput]: omit(rel, ['name']) };
                }
                return { ...newRelations, [relationOutput]: rel };
            })
        );
    };

    const clearInputs: (soft?: boolean) => void = soft => {
        // Reset all the data to default
        if (!soft) {
            setInputProvider(null);
            setInputChildren([]);
        }
        setRelations({});
        setInputs(null);
        setInputsLoading(false);
        setInputRecord(null);
    };

    const clearOutputs: (soft?: boolean) => void = soft => {
        // Reset all the data to default
        if (!soft) {
            setOutputProvider(null);
            setOutputChildren([]);
        }
        setRelations({});
        setOutputs(null);
        setOutputsLoading(false);
        setOutputRecord(null);
    };

    const reset: () => void = () => {
        clearInputs();
        clearOutputs();
    };

    const isMapperValid: () => boolean = () => isFormValid && size(relations) !== 0;
    const flattenedInputs = inputs && flattenFields(inputs);
    const flattenedOutputs = outputs && flattenFields(outputs);

    const hasAvailableRelation: (types: string[]) => boolean = types => {
        if (flattenedOutputs) {
            let availableOutputsCount = 0;
            // Loop through all the output fields that support this field
            // with the provided types
            flattenedOutputs
                .filter(
                    output =>
                        size(types) <= size(output.type.types_accepted) &&
                        output.type.types_accepted.some((type: string) => types.includes(type))
                )
                .forEach(output => {
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
        if (unique_roles.every(role => !uniqueRoles.includes(role)) && !uniqueRoles.includes('*')) {
            return true;
        }
        return false;
    };

    const getFieldTypeColor: (type: 'inputs' | 'outputs', name: string) => string = (type, name) => {
        const fieldTypes = {
            inputs: flattenedInputs,
            outputs: flattenedOutputs,
        };
        // Find the field
        const field = fieldTypes[type].find(input => input.path === name);
        // Return the color
        return TYPE_COLORS[field.type.types_returned[0].replace(/</g, '').replace(/>/g, '')];
    };

    const getLastChildIndex = (field: any, type: 'inputs' | 'outputs') => {
        // Save the fields into a accessible object
        const fields = { inputs: flattenedInputs, outputs: flattenedOutputs };
        // Only get the child index for fields
        // that actually have children
        if (size(field.type.fields)) {
            // Get the name of the last field
            const name: string = Object.keys(field.type.fields).find(
                (_name, index) => index === size(field.type.fields) - 1
            );
            // Get the index of the last field in this
            // hierarchy based on the name
            return findIndex(fields[type], curField => curField.path === `${field.path}.${name}`);
        }
        // Return nothing
        return 0;
    };

    const handleClick = type => (field: any, edit?: boolean, remove?: boolean): void => {
        if (remove) {
            editField(type, field.path, null, true);
            removeFieldRelations(field.path);
        } else {
            setAddDialog({
                isOpen: true,
                siblings: field.type.fields,
                fieldData: edit ? field : null,
                type,
                onSubmit: data => {
                    edit ? editField(type, field.path, data) : addField(type, field.path, data);
                },
            });
        }
    };

    const handleManageClick = output => {
        setMappingDialog({
            isOpen: true,
            relationData: relations[output.path],
            inputs: flattenedInputs,
            mapperKeys,
            output,
            onSubmit: relation => {
                setRelations(current => {
                    const result = { ...current };
                    result[output.path] = relation;
                    return result;
                });
            },
        });
    };

    const handleDrop = (inputPath: string, outputPath: string): void => {
        saveRelationData(outputPath, { name: inputPath });
    };

    const handleSubmitClick = () => {
        // Build the mapper object
        const mapper = reduce(
            selectedFields.mapper,
            (result: { [key: string]: any }, field: IField) => ({
                ...result,
                [field.name]: field.value,
            }),
            {}
        );
        // Add the relations
        mapper.options = relations;
        // Post the data
        postMessage(Messages.CREATE_INTERFACE, {
            iface_kind: 'mapper',
            data: mapper,
            open_file_on_success: true,
        });
    };

    return (
        <>
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
            />
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
            />
            <div
                style={{
                    width: '100%',
                    marginTop: '15px',
                    padding: 10,
                    flex: 1,
                    overflow: 'auto',
                    background: `url(${
                        process.env.NODE_ENV === 'development'
                            ? `http://localhost:9876/images/tiny_grid.png`
                            : `vscode-resource:${initialData.path}/images/tiny_grid.png)`
                    }`,
                }}
            >
                <StyledMapperWrapper>
                    <StyledFieldsWrapper>
                        <StyledFieldHeader>Input</StyledFieldHeader>
                        {size(flattenedInputs) !== 0
                            ? map(flattenedInputs, (input, index) => (
                                  <MapperInput
                                      key={input.path}
                                      name={input.name}
                                      types={input.type.types_returned}
                                      {...input}
                                      field={input}
                                      id={index + 1}
                                      lastChildIndex={getLastChildIndex(input, 'inputs') - index}
                                      onClick={handleClick('inputs')}
                                      hasAvailableOutput={hasAvailableRelation(input.type.types_returned)}
                                  />
                              ))
                            : null}
                        {size(flattenedInputs) === 0 ? (
                            <StyledInfoMessage>{t('MapperNoInputFields')}</StyledInfoMessage>
                        ) : null}
                    </StyledFieldsWrapper>
                    <StyledConnectionsWrapper>
                        {size(relations) && !isDragging ? (
                            <svg
                                height={
                                    Math.max(flattenedInputs.length, flattenedOutputs.length) *
                                        (FIELD_HEIGHT + FIELD_MARGIN) +
                                    31
                                }
                            >
                                {map(
                                    relations,
                                    (relation, outputPath) =>
                                        !!relation.name && (
                                            <>
                                                <defs>
                                                    <linearGradient
                                                        id={outputPath}
                                                        x1="0"
                                                        y1={
                                                            (flattenedInputs.findIndex(
                                                                input => input.path === relation.name
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            31 -
                                                            0.5
                                                        }
                                                        x2={0}
                                                        y2={
                                                            (flattenedOutputs.findIndex(
                                                                output => output.path === outputPath
                                                            ) +
                                                                1) *
                                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                            31 +
                                                            0.5
                                                        }
                                                        gradientUnits="userSpaceOnUse"
                                                    >
                                                        <stop
                                                            stop-color={getFieldTypeColor('inputs', relation.name)}
                                                            offset="0"
                                                        />
                                                        <stop
                                                            stop-color={getFieldTypeColor('outputs', outputPath)}
                                                            offset="1"
                                                        />
                                                    </linearGradient>
                                                </defs>
                                                <StyledLine
                                                    key={outputPath}
                                                    stroke={`url(#${outputPath})`}
                                                    onClick={() => removeRelation(outputPath)}
                                                    x1={0}
                                                    y1={
                                                        (flattenedInputs.findIndex(
                                                            input => input.path === relation.name
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        31 -
                                                        1.5
                                                    }
                                                    x2={300}
                                                    y2={
                                                        (flattenedOutputs.findIndex(
                                                            output => output.path === outputPath
                                                        ) +
                                                            1) *
                                                            (FIELD_HEIGHT + FIELD_MARGIN) -
                                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                                        31 +
                                                        1.5
                                                    }
                                                />
                                            </>
                                        )
                                )}
                            </svg>
                        ) : null}
                    </StyledConnectionsWrapper>
                    <StyledFieldsWrapper>
                        <StyledFieldHeader>Output</StyledFieldHeader>
                        {size(flattenedOutputs) !== 0
                            ? map(flattenedOutputs, (output, index) => (
                                  <MapperOutput
                                      key={output.path}
                                      name={output.name}
                                      hasRelation={!isAvailableForDrop(output.path)}
                                      {...output}
                                      field={output}
                                      onDrop={handleDrop}
                                      id={index + 1}
                                      accepts={output.type.types_accepted}
                                      lastChildIndex={getLastChildIndex(output, 'outputs') - index}
                                      onClick={handleClick('outputs')}
                                      onManageClick={() => handleManageClick(output)}
                                  />
                              ))
                            : null}
                        {size(flattenedOutputs) === 0 ? (
                            <StyledInfoMessage>{t('MapperNoOutputFields')}</StyledInfoMessage>
                        ) : null}
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
                                onClick={reset}
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
                            text={t('Submit')}
                            onClick={handleSubmitClick}
                            disabled={!isMapperValid()}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
            {addDialog.isOpen && <MapperFieldModal t={t} onClose={() => setAddDialog({})} {...addDialog} />}
            {mappingDialog.isOpen && (
                <MappingModal t={t} onClose={() => setMappingDialog({})} {...mappingDialog} methods={methods} />
            )}
        </>
    );
};

export default compose(
    withInitialDataConsumer(),
    withTextContext(),
    withMapperConsumer(),
    withFieldsConsumer(),
    withMessageHandler()
)(MapperCreator);
