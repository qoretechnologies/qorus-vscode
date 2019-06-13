import React, { FunctionComponent, FormEvent } from 'react';
import { Switch } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';

const BooleanField: FunctionComponent<IField & IFieldChange> = ({ name, onChange, value }) => {
    useMount(() => {
        // Set the default value
        onChange(name, false);
    });

    const handleEnabledChange: (event: FormEvent<HTMLInputElement>) => void = () => {
        // Run the onchange
        if (onChange) {
            onChange(name, !value);
        }
    };

    return <Switch checked={value} large onChange={handleEnabledChange} />;
};

export default BooleanField;
