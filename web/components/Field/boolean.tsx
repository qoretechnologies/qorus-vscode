import { Switch } from '@blueprintjs/core';
import React, { FormEvent, FunctionComponent } from 'react';
import useMount from 'react-use/lib/useMount';
import { isUndefined } from 'util';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { getValueOrDefaultValue } from '../../helpers/validations';

const BooleanField: FunctionComponent<IField & IFieldChange> = ({ name, onChange, value, default_value, disabled }) => {
    useMount(() => {
        // Set the default value
        onChange(name, getValueOrDefaultValue(value, default_value || false, false));
    });

    const handleEnabledChange: (event: FormEvent<HTMLInputElement>) => void = () => {
        // Run the onchange
        if (onChange) {
            onChange(name, !value);
        }
    };

    if (isUndefined(value)) {
        return null;
    }

    return (
        <Switch
            disabled={disabled}
            checked={value || false}
            large
            onChange={handleEnabledChange}
            name={`field-${name}`}
            className={`field-switch-${name}`}
        />
    );
};

export default BooleanField;
