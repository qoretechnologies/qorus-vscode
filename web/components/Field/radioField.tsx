import React, { FunctionComponent, useState, FormEvent } from 'react';
import { RadioGroup, Radio } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../containers/InterfaceCreator/panel';
import useMount from 'react-use/lib/useMount';

export interface IRadioField {
    t: TTranslator;
}

const RadioField: FunctionComponent<IRadioField & IField & IFieldChange> = ({
    t,
    values,
    default_value,
    onChange,
    name,
}) => {
    const [value, setValue] = useState<string>(default_value);

    useMount(() => {
        // Set the default value
        onChange(name, default_value);
    });

    const handleValueChange: (event: FormEvent<HTMLInputElement>) => void = event => {
        // Set the current radio value
        setValue(event.currentTarget.value);
        // Send the change
        onChange(name, event.currentTarget.value);
    };

    return (
        <RadioGroup onChange={handleValueChange} selectedValue={value}>
            {values.map((v: string) => (
                <Radio key={v} label={t(`field-label-${v}`)} value={v} />
            ))}
        </RadioGroup>
    );
};

export default withTextContext()(RadioField);
