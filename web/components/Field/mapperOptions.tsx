import React, { FunctionComponent, useState, useEffect } from 'react';
import SelectField from './select';
import { Button, ButtonGroup, ControlGroup } from '@blueprintjs/core';
import styled from 'styled-components';
import size from 'lodash/size';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import AutoField from './auto';
import compose from 'recompose/compose';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import reduce from 'lodash/reduce';

type IPair = {
    id: number;
    value: string;
    name: string;
};

export const StyledPairField = styled.div`
    margin-bottom: 10px;
`;

const MapperOptionsField: FunctionComponent<{
    t: TTranslator;
    items: any[];
    mapperType: string;
    initialData?: any;
} & IField &
    IFieldChange> = ({
    name,
    onChange,
    value = [{ id: 1, value: '', name: '' }],
    get_message,
    return_message,
    t,
    mapperType,
    initialData,
}) => {
    const [options, setOptions] = useState(null);
    const [items, setItems] = useState([]);

    useEffect(() => {
        if (mapperType) {
            (async () => {
                setOptions(null);
                setItems([]);
                onChange(name, [{ id: 1, value: '', name: '' }]);
                // Fetch the options for this mapper type
                const data = await initialData.fetchData('/mappertypes/' + mapperType);
                // Save the new options
                setOptions(data.data.user_options);
                // Save the items
                setItems(
                    reduce(
                        data.data.user_options,
                        (transformedOpts, data, opt) => [...transformedOpts, { name: opt, desc: data.desc }],
                        []
                    )
                );
            })();
        }
    }, [mapperType]);

    if (!options) {
        return <p> Loading options ... </p>;
    }

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
        onChange(name, [...value, { id: size(value) + 1, value: '', name: '' }]);
    };

    const handleRemoveClick: (id: number) => void = id => {
        // Remove the selected pair
        onChange(
            name,
            value.filter((_p: IPair, index: number) => id !== index)
        );
    };

    const getNameType: (name: string) => string = name => {
        // Find the option and return it's type
        return options[name].type;
    };

    // Filter the items
    const filteredItems = items
        .filter(item => !value.find(val => val.name === item.name))
        .filter(item => item.name !== 'global_type_options');

    return (
        <>
            {value.map((pair: IPair, index: number) => (
                <StyledPairField key={pair.name}>
                    <div>
                        <ControlGroup fill>
                            <Button text={`${index + 1}.`} />
                            <SelectField
                                name="name"
                                value={pair.name}
                                get_message={get_message}
                                return_message={return_message}
                                defaultItems={filteredItems}
                                onChange={(fieldName: string, value: string) => {
                                    changePairData(index, fieldName, value);
                                }}
                                fill
                            />
                            {pair.name ? (
                                <AutoField
                                    defaultType={getNameType(pair.name)}
                                    name="value"
                                    value={pair.value}
                                    onChange={(fieldName: string, value: string): void => {
                                        changePairData(index, fieldName, value);
                                    }}
                                    fill
                                    t={t}
                                />
                            ) : null}
                            {size(value) !== 1 && <Button icon={'trash'} onClick={() => handleRemoveClick(index)} />}
                        </ControlGroup>
                    </div>
                </StyledPairField>
            ))}
            {size(value) !== size(options) && (
                <ButtonGroup fill>
                    <Button text={t('AddNew')} icon={'add'} onClick={handleAddClick} />
                </ButtonGroup>
            )}
        </>
    );
};

export default compose(withInitialDataConsumer(), withTextContext())(MapperOptionsField);
