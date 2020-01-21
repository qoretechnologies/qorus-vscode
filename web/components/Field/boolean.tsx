import React, { FunctionComponent, FormEvent } from 'react';
import { Switch } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { getValueOrDefaultValue } from '../../helpers/validations';
import { isUndefined } from 'util';

const BooleanField: FunctionComponent<IField & IFieldChange> = ({ name, onChange, value, default_value }) => {
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

    return <Switch checked={value || false} large onChange={handleEnabledChange} />;
};

export default BooleanField;
