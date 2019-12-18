import React, { FunctionComponent, useState, useEffect } from 'react';
import StringField from './string';
import { Button, ButtonGroup, ControlGroup } from '@blueprintjs/core';
import styled from 'styled-components';
import { size } from 'lodash';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';

type IPair = {
    id: number;
    [key: string]: string | number;
};

export const StyledPairField = styled.div`
    margin-bottom: 10px;
`;

const ClassConnectorsField: FunctionComponent<TTranslator & IField & IFieldChange> = ({
    name,
    onChange,
    value = [{ id: 1, name: '', 'input-method': '', 'output-method': '' }],
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
        onChange(name, [...value, { id: size(value) + 1, name: '', 'input-method': '', 'output-method': '' }]);
    };

    const handleRemoveClick: (id: number) => void = id => {
        // Remove the selected pair
        onChange(
            name,
            value.filter((_p: IPair, index: number) => id !== index)
        );
    };

    return (
        <>
            {value.map((pair: IPair, index: number) => (
                <StyledPairField key={index + 1}>
                    <div>
                        <ControlGroup fill>
                            <Button text={`${index + 1}.`} />
                            <StringField
                                name="name"
                                value={pair.name}
                                onChange={(fieldName: string, value: string) => {
                                    changePairData(index, fieldName, value);
                                }}
                                placeholder={t('Name')}
                                fill
                            />
                            <StringField
                                name="input-method"
                                value={pair['input-method']}
                                onChange={(fieldName: string, value: string) => {
                                    changePairData(index, fieldName, value);
                                }}
                                placeholder={t('InputMethod')}
                                fill
                            />
                            <StringField
                                name="output-method"
                                value={pair['output-method']}
                                onChange={(fieldName: string, value: string) => {
                                    changePairData(index, fieldName, value);
                                }}
                                placeholder={t('OutputMethod')}
                                fill
                            />

                            {size(value) !== 1 && <Button icon={'trash'} onClick={() => handleRemoveClick(index)} />}
                        </ControlGroup>
                    </div>
                </StyledPairField>
            ))}
            <ButtonGroup fill>
                <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
            </ButtonGroup>
        </>
    );
};

export default withTextContext()(ClassConnectorsField);
