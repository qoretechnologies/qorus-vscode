import React, { FunctionComponent, useState, useEffect } from 'react';
import SelectPairField from './selectPair';
import { Button, ButtonGroup } from '@blueprintjs/core';
import styled from 'styled-components';
import { size } from 'lodash';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';

type IPair = {
    id: number;
    prefix: string;
    name: string;
};

export const StyledPairField = styled.div`
    margin-bottom: 10px;
`;

const ClassArrayField: FunctionComponent<{ t: TTranslator } & IField & IFieldChange> = ({
    name,
    onChange,
    value = [{ id: 1, prefix: '', name: '' }],
    get_message,
    return_message,
    t,
}) => {
    const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
        const newValue = [...value];
        // Get the pair based on the index
        const pair: IPair = newValue[index];
        // Update the field
        pair[key] = val;
        // Update the pairs
        onChange(name, newValue);
    };

    const handleAddClick: () => void = () => {
        onChange(name, [...value, { id: size(value) + 1, prefix: '', name: '' }]);
    };

    const handleRemoveClick: (id: number) => void = id => {
        // Remove the selected pair
        onChange(name, value.filter((p: IPair) => id !== p.id));
    };

    return (
        <>
            {value.map((pair: IPair, index: number) => (
                <StyledPairField key={pair.id}>
                    <SelectPairField
                        index={index + 1}
                        onRemoveClick={() => handleRemoveClick(pair.id)}
                        key={pair.id}
                        keyName={Object.keys(pair)[1]}
                        valueName={Object.keys(pair)[2]}
                        keyValue={pair.prefix}
                        valueValue={pair.name}
                        get_message={get_message}
                        return_message={return_message}
                        onChange={(fieldName: string, value: any) => {
                            changePairData(index, fieldName, value);
                        }}
                    />
                </StyledPairField>
            ))}
            <ButtonGroup fill>
                <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
            </ButtonGroup>
        </>
    );
};

export default withTextContext()(ClassArrayField);
