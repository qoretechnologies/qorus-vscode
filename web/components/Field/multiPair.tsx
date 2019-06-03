import React, { FunctionComponent, useState, useEffect } from 'react';
import PairField from './pair';
import { Button, ButtonGroup } from '@blueprintjs/core';
import styled from 'styled-components';
import { size } from 'lodash';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';

type IPair = {
    id: number;
    [key: string]: string | number;
};

const StyledPairField = styled.div`
    margin-bottom: 10px;
`;

const MultiPairField: FunctionComponent<IField & IFieldChange> = ({ fields, name, onChange }) => {
    const [pairs, setPairs] = useState<IPair[]>([{ id: 1, [fields[0]]: '', [fields[1]]: '' }]);

    const changePairData: (index: number, key: string, value: any) => void = (index, key, value) => {
        setPairs(
            (currentPairs: IPair[]): IPair[] => {
                // Get the pair based on the index
                const pair: IPair = currentPairs[index];
                // Update the field
                pair[key] = value;

                // Update the pairs
                onChange(name, currentPairs);
                // Return updated pairs
                return currentPairs;
            }
        );
    };

    useEffect(() => {
        // Update values
        onChange(name, pairs);
    }, [pairs]);

    const handleAddClick: () => void = () => {
        // Add new pair
        setPairs(
            (currentPairs: IPair[]): IPair[] => [
                ...currentPairs,
                { id: size(currentPairs) + 1, [fields[0]]: '', [fields[1]]: '' },
            ]
        );
    };

    const handleRemoveClick: (id: number) => void = id => {
        // Remove the selected pair
        setPairs((currentPairs: IPair[]): IPair[] => currentPairs.filter((p: IPair) => id !== p.id));
    };

    return (
        <>
            {pairs.map((pair: IPair, index: number) => (
                <StyledPairField key={pair.id}>
                    <PairField
                        index={index + 1}
                        onRemoveClick={() => handleRemoveClick(pair.id)}
                        key={pair.id}
                        keyName={Object.keys(pair)[1]}
                        valueName={Object.keys(pair)[2]}
                        onChange={(fieldName: string, value: any) => {
                            changePairData(index, fieldName, value);
                        }}
                    />
                </StyledPairField>
            ))}
            <ButtonGroup fill>
                <Button text={'Add new'} icon={'add'} onClick={handleAddClick} />
            </ButtonGroup>
        </>
    );
};

export default MultiPairField;
