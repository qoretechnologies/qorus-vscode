import React, { useCallback, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import MapperInput from './input';
import MapperOutput from './output';
import { FieldWrapper, ActionsWrapper } from '../InterfaceCreator/panel';
import Select from '../../components/Field/select';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { Callout, Spinner, ButtonGroup, Tooltip, Button, Intent, Dialog } from '@blueprintjs/core';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import get from 'lodash/get';
import findIndex from 'lodash/findIndex';
import { TTranslator } from '../../App';
import withTextContext from '../../hocomponents/withTextContext';
import compose from 'recompose/compose';
import withMapperConsumer from '../../hocomponents/withMapperConsumer';
import MapperFieldModal from './modal';

const FIELD_HEIGHT = 70;
const FIELD_MARGIN = 15;

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

    ${({ childrenCount }) =>
        childrenCount !== 0 &&
        css`
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
            }
        `}

    ${({ isChild }) =>
        isChild &&
        css`
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
            }
        `}

    h4 {
        text-align: center;
        font-size: 16px;
        line-height: 34px;
        margin: 0;
        padding: 0;
    }

    p {
        text-align: center;
        font-size: 12px;
        line-height: 15px;
        margin: 0;
        padding: 0;
        color: #a9a9a9;
    }
`;

const StyledInfoMessage = styled.p`
    text-align: center;
    color: #a9a9a9;
`;

const StyledFieldHeader = styled.h3`
    margin: 0;
    padding: 0;
    text-align: center;
`;

const StyledLine = styled.line`
    stroke: #d7d7d7;
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
    relations: IMapperRelation[];
    setRelations: (relations: IMapperRelation[]) => void;
    inputsLoading: boolean;
    setInputsLoading: (loading: boolean) => void;
    outputsLoading: boolean;
    setOutputsLoading: (loading: boolean) => void;
    onBackClick: () => void;
    addField: (fieldsType: string, path: string, name: string, data?: any) => void;
    editField: (fieldsType: string, path: string, name: string, data?: any) => void;
    isFormValid: boolean;
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
    providerData,
    setProviderData,
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
}) => {
    const [addDialog, setAddDialog] = useState({});
    const handleDrop = useCallback(
        (inputPath: string, outputPath: string): void => {
            // Check if this relation already exists
            const relation = relations.find(
                (relation: IMapperRelation): boolean => relation.input === inputPath && relation.output === outputPath
            );
            // Do nothing if it exists
            if (!relation) {
                // Add new relation
                setRelations((current: IMapperRelation[]): IMapperRelation[] => [
                    ...current,
                    { input: inputPath, output: outputPath },
                ]);
            }
        },
        [relations]
    );

    useEffect(() => {
        // Check if data providers are not set
        if (!providerData) {
            // Fetch the mapper data providers
            (async () => {
                // Get the data
                const { data } = await initialData.fetchData('dataprovider/types');
                // Save data
                setProviderData(data);
            })();
        }
    }, [initialData]);

    const getDefaultItems = useCallback(
        () => providerData && providerData.map(({ name, typename }) => ({ name: typename, desc: name })),
        [providerData]
    );

    if (!initialData.qorus_instance) {
        return (
            <Callout title='Active instance not set' icon='warning-sign' intent='warning'>
                Mappers can only be created with an active Qorus instance selected
            </Callout>
        );
    }

    if (!providerData) {
        return <p> Loading data... </p>;
    }

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
                const newPath = level === 0 ? name : `${path}.type.fields.${name}`;
                const parentPath = level !== 0 && `${path}.type.fields`;
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

    const setFieldsFromType = async (type: string, isInput?: boolean): Promise<void> => {
        // Reset the relations
        setRelations([]);
        // Set the loading
        if (isInput) {
            // Set the input provider
            setInputProvider(type);
            // Reset the inputs
            setInputs(null);
            // Set loading
            setInputsLoading(true);
        } else {
            // Set the output provider
            setOutputProvider(type);
            // reset the outputs
            setOutputs(null);
            // Set loading
            setOutputsLoading(true);
        }
        // Get the fields
        const data = await initialData.fetchData(`dataprovider/types/${type}`);
        // Save either input or output
        if (isInput) {
            // Set new input fields
            setInputs(data.data.fields);
            // Remove loading
            setInputsLoading(false);
        } else {
            // Set new input fields
            setOutputs(data.data.fields);
            // Remove loading
            setOutputsLoading(false);
        }
    };

    const removeRelation: (relation: IMapperRelation) => void = relation => {
        // Remove the selected relation
        setRelations((current: IMapperRelation[]): IMapperRelation[] =>
            current.filter(
                (rel: IMapperRelation): boolean => rel.input !== relation.input || rel.output !== relation.output
            )
        );
    };

    const removeFieldRelations: (path: string) => void = path => {
        // Remove the selected relation
        setRelations((current: IMapperRelation[]): IMapperRelation[] =>
            current.filter(
                (rel: IMapperRelation): boolean => !rel.input.startsWith(path) && !rel.output.startsWith(path)
            )
        );
    };

    const reset: () => void = () => {
        // Reset all the data to default
        setRelations([]);
        setInputs(null);
        setOutputs(null);
        setInputProvider(null);
        setOutputProvider(null);
        setInputsLoading(false);
        setOutputsLoading(false);
    };

    const isMapperValid: () => boolean = () => isFormValid && size(relations) !== 0;
    const flattenedInputs = inputs && flattenFields(inputs);
    const flattenedOutputs = outputs && flattenFields(outputs);

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
            return findIndex(fields[type], curField => curField.path === `${field.path}.type.fields.${name}`);
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
                onSubmit: data => {
                    edit ? editField(type, field.path, data) : addField(type, field.path, data);
                },
            });
        }
    };

    return (
        <>
            <div
                style={{
                    width: '100%',
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
                        <FieldWrapper style={{ marginBottom: '20px' }}>
                            <Select
                                name='input'
                                disabled={inputsLoading}
                                fill
                                disab
                                defaultItems={getDefaultItems()}
                                onChange={(_name, value) => {
                                    setFieldsFromType(value, true);
                                }}
                                value={inputProvider}
                            />
                        </FieldWrapper>
                        {inputsLoading && <Spinner size={20} />}
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
                                  />
                              ))
                            : null}
                        {size(flattenedInputs) === 0 && !inputsLoading ? (
                            <StyledInfoMessage>
                                {' '}
                                No fields available. Please make sure input provider was selected{' '}
                            </StyledInfoMessage>
                        ) : null}
                    </StyledFieldsWrapper>
                    <StyledConnectionsWrapper>
                        {size(relations) ? (
                            <svg
                                height={
                                    Math.max(flattenedInputs.length, flattenedOutputs.length) *
                                        (FIELD_HEIGHT + FIELD_MARGIN) +
                                    91
                                }
                            >
                                {relations.map((relation: IMapperRelation) => (
                                    <StyledLine
                                        onClick={() => removeRelation(relation)}
                                        x1={0}
                                        y1={
                                            (flattenedInputs.findIndex(input => input.path === relation.input) + 1) *
                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                            91
                                        }
                                        x2={300}
                                        y2={
                                            (flattenedOutputs.findIndex(output => output.path === relation.output) +
                                                1) *
                                                (FIELD_HEIGHT + FIELD_MARGIN) -
                                            (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                            91
                                        }
                                    />
                                ))}
                            </svg>
                        ) : null}
                    </StyledConnectionsWrapper>
                    <StyledFieldsWrapper>
                        <StyledFieldHeader>Output</StyledFieldHeader>
                        <FieldWrapper style={{ marginBottom: '20px' }}>
                            <Select
                                name='input'
                                disabled={outputsLoading}
                                fill
                                defaultIt
                                defaultItems={getDefaultItems()}
                                onChange={(_name, value) => {
                                    setFieldsFromType(value);
                                }}
                                value={outputProvider}
                            />
                        </FieldWrapper>
                        {outputsLoading && <Spinner size={20} />}
                        {size(flattenedOutputs) !== 0
                            ? map(flattenedOutputs, (output, index) => (
                                  <MapperOutput
                                      key={output.path}
                                      name={output.name}
                                      {...output}
                                      field={output}
                                      onDrop={handleDrop}
                                      id={index + 1}
                                      accepts={output.type.types_accepted}
                                      lastChildIndex={getLastChildIndex(output, 'outputs') - index}
                                      onClick={handleClick('outputs')}
                                  />
                              ))
                            : null}
                        {size(flattenedOutputs) === 0 && !outputsLoading ? (
                            <StyledInfoMessage>
                                {' '}
                                No fields available. Please make sure output provider was selected{' '}
                            </StyledInfoMessage>
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
                        <Button text={t('Submit')} disabled={!isMapperValid()} icon={'tick'} intent={Intent.SUCCESS} />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
            {addDialog.isOpen && <MapperFieldModal t={t} onClose={() => setAddDialog({})} {...addDialog} />}
        </>
    );
};

export default compose(withInitialDataConsumer(), withTextContext(), withMapperConsumer())(MapperCreator);
