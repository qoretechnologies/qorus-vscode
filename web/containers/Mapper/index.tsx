import React, { useState, useCallback, useEffect, useMemo } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import MapperInput from './input';
import MapperOutput from './output';
import { FieldWrapper } from '../InterfaceCreator/panel';
import Select from '../../components/Field/select';
import useMount from 'react-use/lib/useMount';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { Callout, Spinner } from '@blueprintjs/core';
import size from 'lodash/size';
import map from 'lodash/map';
import forEach from 'lodash/forEach';
import reduce from 'lodash/reduce';

const FIELD_HEIGHT = 70;
const FIELD_MARGIN = 10;

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
    width: 300px;
    height: ${FIELD_HEIGHT}px;
    border: 1px solid #d7d7d7;
    border-radius: 3px;
    margin-bottom: ${FIELD_MARGIN}px;
    transition: all 0.3s;
    background-color: #fff;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);

    h4 {
        text-align: center;
        font-size: 16px;
        line-height: 34px;
        margin: 0;
        padding: 0;
    }

    p {
        text-align: center;
        line-height: 25px;
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
}

export interface IMapperRelation {
    input: number;
    output: number;
}

const MapperCreator: React.FC<IMapperCreatorProps> = ({ initialData }) => {
    const [inputs, setInputs] = useState<any>(null);
    const [outputs, setOutputs] = useState<any>(null);
    const [providerData, setProviderData] = useState<any>(null);
    const [inputProvider, setInputProvider] = useState<string>(null);
    const [outputProvider, setOutputProvider] = useState<string>(null);
    const [relations, setRelations] = useState<IMapperRelation[]>([]);
    const [inputsLoading, setInputsLoading] = useState<boolean>(false);
    const [outputsLoading, setOutputsLoading] = useState<boolean>(false);

    const handleDrop = useCallback(
        (inputId: number, outputId: number): void => {
            // Check if this relation already exists
            const relation = relations.find(
                (relation: IMapperRelation): boolean => relation.input === inputId && relation.output === outputId
            );
            // Do nothing if it exists
            if (!relation) {
                // Add new relation
                setRelations(current => [...current, { input: inputId, output: outputId }]);
            }
        },
        [relations]
    );

    useEffect(() => {
        // Fetch the mapper data providers
        (async () => {
            // Get the data
            const { data } = await initialData.fetchData('dataprovider/types');
            // Save data
            setProviderData(data);
        })();
    }, [initialData]);

    const getDefaultItems = useCallback(
        () => providerData && providerData.map(({ name, typename }) => ({ name: typename, desc: name })),
        [providerData]
    );

    if (!initialData.qorus_instance) {
        return (
            <Callout title="Active instance not set" icon="warning-sign" intent="warning">
                Mappers can only be created with an active Qorus instance selected
            </Callout>
        );
    }

    if (!providerData) {
        return <p> Loading data... </p>;
    }

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
        // This functions flattens the fields, by taking all the
        // deep fields from `type` and adds them right after their
        // respective parent field
        const flattenFields: (fields: any) => any[] = fields =>
            reduce(
                fields,
                (newFields, field, name) => {
                    let res = [...newFields];
                    // Add the current field
                    res = [...res, { name, ...field }];
                    // Check if this field has hierarchy
                    if (size(field.type.fields)) {
                        // Recursively add deep fields
                        res = [...res, ...flattenFields(field.type.fields)];
                    }
                    // Return the new fields
                    return res;
                },
                []
            );
        // Flatten the fields
        const flattenedFields = flattenFields(data.data.fields);
        // Save either input or output
        if (isInput) {
            // Set new input fields
            setInputs(flattenedFields);
            // Remove loading
            setInputsLoading(false);
        } else {
            // Set new input fields
            setOutputs(flattenedFields);
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

    return (
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
                            name="input"
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
                    {size(inputs) !== 0
                        ? map(inputs, (input, index) => (
                              <MapperInput name={input.name} types={input.type.types_returned} id={index + 1} />
                          ))
                        : null}
                    {size(inputs) === 0 && !inputsLoading ? (
                        <StyledInfoMessage>
                            {' '}
                            No fields available. Please make sure input provider was selected{' '}
                        </StyledInfoMessage>
                    ) : null}
                </StyledFieldsWrapper>
                <StyledConnectionsWrapper>
                    {size(relations) ? (
                        <svg height={Math.max(inputs.length, outputs.length) * (FIELD_HEIGHT + FIELD_MARGIN) + 91}>
                            {relations.map((relation: IMapperRelation) => (
                                <StyledLine
                                    onClick={() => removeRelation(relation)}
                                    x1={0}
                                    y1={
                                        relation.input * (FIELD_HEIGHT + FIELD_MARGIN) -
                                        (FIELD_HEIGHT / 2 + FIELD_MARGIN) +
                                        91
                                    }
                                    x2={300}
                                    y2={
                                        relation.output * (FIELD_HEIGHT + FIELD_MARGIN) -
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
                            name="input"
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
                    {size(outputs) !== 0
                        ? map(outputs, (output, index) => (
                              <MapperOutput
                                  name={output.name}
                                  onDrop={handleDrop}
                                  id={index + 1}
                                  accepts={output.type.types_accepted}
                              />
                          ))
                        : null}
                    {size(outputs) === 0 && !outputsLoading ? (
                        <StyledInfoMessage>
                            {' '}
                            No fields available. Please make sure output provider was selected{' '}
                        </StyledInfoMessage>
                    ) : null}
                </StyledFieldsWrapper>
            </StyledMapperWrapper>
        </div>
    );
};

export default withInitialDataConsumer()(MapperCreator);
