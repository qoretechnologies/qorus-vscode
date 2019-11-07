import React, { useState, useCallback, useEffect } from 'react';
import { useDrag } from 'react-dnd';
import styled from 'styled-components';
import MapperInput from './input';
import MapperOutput from './output';
import { FieldWrapper } from '../InterfaceCreator/panel';
import String from '../../components/Field/string';
import useMount from 'react-use/lib/useMount';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { Callout } from '@blueprintjs/core';

const FIELD_HEIGHT = 50;
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
    border: 1px solid #000;
    margin-bottom: ${FIELD_MARGIN}px;
`;

export interface IMapperCreatorProps {
    initialData: any;
}

const MapperCreator: React.FC<IMapperCreatorProps> = ({ initialData }) => {
    const [inputs, setInputs] = useState<any[]>([1, 2, 3, 4]);
    const [outputs, setOutputs] = useState<any[]>([1, 2]);
    const [relations, setRelations] = useState<{ input: number; output: number }[]>([]);

    const handleDrop = useCallback((inputId: number, outputId: number): void => {
        setRelations(current => [...current, { input: inputId, output: outputId }]);
    }, []);

    useEffect(() => {
        // Fetch the mapper data providers
        (async () => {
            const data = await initialData.fetchData('dataprovider/types?short=1');
            console.log(data);
        })();
    }, [initialData]);

    console.log(initialData);

    if (!initialData.qorus_instance) {
        return (
            <Callout title="Active instance not set" icon="warning-sign" intent="warning">
                Mappers can only be created with an active Qorus instance selected
            </Callout>
        );
    }

    return (
        <StyledMapperWrapper>
            <StyledFieldsWrapper>
                <FieldWrapper>
                    <String name="input" fill />
                </FieldWrapper>
                {inputs.map(input => (
                    <MapperInput id={input} />
                ))}
            </StyledFieldsWrapper>
            <StyledConnectionsWrapper>
                <svg height={Math.max(inputs.length, outputs.length) * (FIELD_HEIGHT + FIELD_MARGIN)}>
                    {relations.map(relation => (
                        <line
                            x1={0}
                            y1={relation.input * (FIELD_HEIGHT + FIELD_MARGIN) - (FIELD_HEIGHT / 2 + FIELD_MARGIN)}
                            x2={300}
                            y2={relation.output * (FIELD_HEIGHT + FIELD_MARGIN) - (FIELD_HEIGHT / 2 + FIELD_MARGIN)}
                            stroke="#333"
                        />
                    ))}
                </svg>
            </StyledConnectionsWrapper>
            <StyledFieldsWrapper>
                {outputs.map(input => (
                    <MapperOutput onDrop={handleDrop} id={input} />
                ))}
            </StyledFieldsWrapper>
        </StyledMapperWrapper>
    );
};

export default withInitialDataConsumer()(MapperCreator);
