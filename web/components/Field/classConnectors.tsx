import React, { FunctionComponent, useState, useEffect } from 'react';
import StringField from './string';
import SelectField from './select';
import { Button, ButtonGroup, ControlGroup, Callout } from '@blueprintjs/core';
import styled from 'styled-components';
import { size } from 'lodash';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import ConnectorField from './connectors';

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
    value = [
        {
            id: 1,
            name: '',
            type: 'default',
            'input-method': '',
            'output-method': '',
            'input-provider': null,
            'output-provider': null,
        },
    ],
    t,
    initialData,
    requestFieldData,
}) => {
    const changePairData: (index: number, key: string, val: any) => void = (index, key, val) => {
        const newValue = [...value];
        // Get the pair based on the index
        const pair: IPair = newValue[index];
        // Update the field
        pair[key] = val;
        // Remove the provider iv value is empty
        if (val === '') {
            if (key === 'input-method') {
                pair['input-provider'] = null;
            }
            if (key === 'output-method') {
                pair['output-provider'] = null;
            }
        }
        // Update the pairs
        onChange(name, newValue);
    };

    const handleAddClick: () => void = () => {
        onChange(name, [
            ...value,
            {
                id: size(value) + 1,
                name: `${requestFieldData('class-name', 'value')}${size(value) + 1}`,
                type: 'default',
                'input-method': '',
                'output-method': '',
                'input-provider': null,
                'output-provider': null,
            },
        ]);
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
            {[...value].map((pair: IPair, index: number) => (
                <StyledPairField key={index + 1}>
                    <div>
                        <ControlGroup fill>
                            <Button text={`${index + 1}.`} />
                            <SelectField
                                defaultItems={[{ name: 'default' }, { name: 'event' }]}
                                value={pair.type}
                                name="type"
                                onChange={(fieldName: string, val: string) => {
                                    changePairData(index, fieldName, val);
                                }}
                            />
                            <StringField
                                name="name"
                                value={pair.name}
                                onChange={(fieldName: string, val: string) => {
                                    changePairData(index, fieldName, val);
                                }}
                                placeholder={t('Name')}
                                fill
                            />
                            <StringField
                                name="input-method"
                                value={pair['input-method']}
                                onChange={(fieldName: string, val: string) => {
                                    changePairData(index, fieldName, val);
                                }}
                                placeholder={t('InputMethod')}
                                fill
                            />
                            <StringField
                                name="output-method"
                                value={pair['output-method']}
                                onChange={(fieldName: string, val: string) => {
                                    changePairData(index, fieldName, val);
                                }}
                                placeholder={t('OutputMethod')}
                                fill
                            />

                            {size(value) !== 1 && <Button icon={'trash'} onClick={() => handleRemoveClick(index)} />}
                        </ControlGroup>
                    </div>
                    <div>
                        {initialData.qorus_instance ? (
                            <>
                                {pair['input-method'] && (
                                    <ConnectorField
                                        value={pair['input-provider']}
                                        isInitialEditing={!!initialData.class}
                                        title="Input"
                                        id={index}
                                        name="input-provider"
                                        onChange={changePairData}
                                    />
                                )}
                                {pair['output-method'] && (
                                    <ConnectorField
                                        isInitialEditing={!!initialData.class}
                                        value={pair['output-provider']}
                                        title="Output"
                                        id={index}
                                        name="output-provider"
                                        onChange={changePairData}
                                    />
                                )}
                            </>
                        ) : (
                            <Callout intent="warning">{t('ActiveInstanceProvidersConnectors')}</Callout>
                        )}
                    </div>
                </StyledPairField>
            ))}
            <ButtonGroup fill>
                <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
            </ButtonGroup>
        </>
    );
};

export default compose(withInitialDataConsumer(), withTextContext())(ClassConnectorsField);
