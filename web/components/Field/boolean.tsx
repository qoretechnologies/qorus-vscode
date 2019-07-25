import React, { FunctionComponent, FormEvent } from 'react';
import { Switch } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';

const BooleanField: FunctionComponent<IField & IFieldChange> = ({ name, onChange, value, default_value }) => {
    useMount(() => {
        // Set the default value
        onChange(name, value || default_value || false);
    });

    const handleEnabledChange: (event: FormEvent<HTMLInputElement>) => void = () => {
        // Run the onchange
        if (onChange) {
            onChange(name, !value);
        }
    };

    console.log('BOOLEAN VAL', value);

    return <Switch checked={value} large onChange={handleEnabledChange} />;
};

export default BooleanField;
