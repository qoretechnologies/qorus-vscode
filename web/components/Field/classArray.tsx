import React, { FunctionComponent, useState, useEffect } from 'react';
import SelectPairField from './selectPair';
import { Button, ButtonGroup, Callout } from '@blueprintjs/core';
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

const ClassArrayField: FunctionComponent<
    { t: TTranslator; showClassesWarning: boolean; defaultSelectItems: any[]; withTextField?: boolean } & IField &
        IFieldChange
> = ({
    name,
    onChange,
    value = [{ id: 1, prefix: '', name: '' }],
    get_message,
    return_message,
    t,
    resetClassConnections,
    showClassesWarning,
    defaultSelectItems,
    reference,
    withTextField,
    canRemoveLast,
}) => {
    const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
        // Check if the current value is empty
        if (key === 'name' && !(value[index][key] === '' || !value[index][key])) {
            // Reset the class connections if it's not
            resetClassConnections && resetClassConnections();
        }
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

    const handleRemoveClick: (id: number) => void = (id) => {
        // Get the pair data
        const pairData: IPair = value.find((_p: IPair, index: number) => id === index);
        // Check if this field had a class selected
        if (pairData.name) {
            // Reset the class connections if it's not
            resetClassConnections && resetClassConnections();
        }
        // Remove the selected pair
        onChange(
            name,
            value.filter((_p: IPair, index: number) => id !== index)
        );
    };

    return (
        <>
            {showClassesWarning && <Callout intent="warning">{t('ClassChangesWarning')}</Callout>}
            {value.map((pair: IPair, index: number) => (
                <StyledPairField key={index + 1}>
                    <SelectPairField
                        index={index + 1}
                        canBeRemoved={canRemoveLast || size(value) !== 1}
                        onRemoveClick={() => handleRemoveClick(index)}
                        key={index + 1}
                        keyName="prefix"
                        valueName="name"
                        keyValue={pair.prefix}
                        valueValue={pair.name}
                        get_message={get_message}
                        defaultSelectItems={defaultSelectItems}
                        reference={reference}
                        return_message={return_message}
                        onChange={(fieldName: string, value: any) => {
                            changePairData(index, fieldName, value);
                        }}
                        hideTextField={!withTextField}
                    />
                </StyledPairField>
            ))}
            <ButtonGroup fill style={{ marginBottom: '10px' }}>
                <Button text={t('AddAnother')} icon={'add'} onClick={handleAddClick} />
            </ButtonGroup>
        </>
    );
};

export default withTextContext()(ClassArrayField);
