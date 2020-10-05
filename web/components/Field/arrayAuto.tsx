import { Button, ButtonGroup, Callout, Classes, ControlGroup } from '@blueprintjs/core';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { FunctionComponent, useContext, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import AutoField from './auto';
import { StyledPairField } from './multiPair';

export const allowedTypes: string[] = ['string', 'int', 'float', 'date'];

const ArrayAutoField: FunctionComponent<IField & IFieldChange> = ({
    name,
    onChange,
    value = [''],
    default_value,
    ...rest
}) => {
    const transformValues: (toValues: boolean, data: any[] | { [id: number]: string | number | null }) => any[] = (
        toValues,
        data
    ) => {
        // Transform data to the object based values
        if (toValues) {
            return data.reduce(
                (newData, val: string | number, index: number) => ({ ...newData, [index + 1]: val }),
                {}
            );
        }
        // Transform the data to the end result (simple list)
        else {
            return reduce(data, (newData, value: string | number | null) => [...newData, value], []);
        }
    };

    const t = useContext(TextContext);
    const [values, setValues] = useState<{ [id: number]: string | number | null }>(transformValues(true, value));
    const [type, setType] = useState<string>(null);
    const [lastId, setLastId] = useState<number>(1);
    const initContext = useContext(InitialContext);

    useMount(() => {
        // Set the default value
        onChange(name, value || default_value || transformValues(false, values));
    });

    useEffect(() => {
        // Auto field type depends on other fields' value
        // which will be used as a type
        if (rest['type-depends-on']) {
            // Get the requested type
            const typeValue: string = rest.requestFieldData(rest['type-depends-on'], 'value');
            // Check if the field has the value set yet
            if (typeValue && typeValue !== type) {
                // Set the new type
                setType(typeValue);
                // Reset the values if the type is not
                // supported for allowed values
                if (!allowedTypes.includes(typeValue)) {
                    setValues({ 1: '' });
                }
            }
        }
    });

    const canBeNull = () => {
        if (rest.requestFieldData) {
            return rest.requestFieldData('can_be_undefined', 'value');
        }

        return false;
    };

    useEffect(() => {
        // Transform the values and send them
        const data = transformValues(false, values);
        // Send the data
        onChange(name, data, undefined, canBeNull());
    }, [values]);

    const addValue: () => void = () => {
        setLastId((current: number) => {
            setValues((currentValues) => ({
                ...currentValues,
                [current + 1]: '',
            }));

            return current + 1;
        });
    };

    const handleRemoveClick: (name: number) => void = (name) => {
        setValues((current) => {
            const newValues = { ...current };
            delete newValues[name];
            return newValues;
        });
    };

    const handleChange: (name: string, value: any) => void = (name, value) => {
        // Set the new values
        setValues((current) => {
            const newValues = { ...current };
            newValues[name] = value;
            return newValues;
        });
    };

    // Only types of string, int, float and date can have
    // allowed values
    if (!allowedTypes.includes(type)) {
        // Show the error message
        return <Callout intent="danger">{t('AllowedValuesWarningType')}</Callout>;
    }

    // Render list of auto fields
    return (
        <>
            {map(values, (val: string | number, idx: string) => (
                <StyledPairField>
                    <ControlGroup fill>
                        <Button text={`${idx}.`} className={Classes.FIXED} />
                        <AutoField
                            {...rest}
                            name={`${name}-${idx}`}
                            value={val}
                            onChange={(_name, value) => handleChange(idx, value)}
                        />
                        {size(values) !== 1 && (
                            <Button
                                className={Classes.FIXED}
                                icon={'trash'}
                                intent="danger"
                                onClick={() =>
                                    initContext.confirmAction('ConfirmRemoveItem', () => handleRemoveClick(idx))
                                }
                            />
                        )}
                    </ControlGroup>
                </StyledPairField>
            ))}
            <ButtonGroup fill>
                <Button onClick={addValue} icon="add" />
            </ButtonGroup>
        </>
    );
};

export default ArrayAutoField;
