import React, { FunctionComponent, useState, FormEvent } from 'react';
import { Switch } from '@blueprintjs/core';
import useMount from 'react-use/lib/useMount';

export interface IBooleanField {
    onChange: any;
    name: string;
}

const BooleanField: FunctionComponent<IBooleanField> = ({ name, onChange }) => {
    const [enabled, setEnabled] = useState<boolean>(false);

    useMount(() => {
        // Set the default value
        onChange(name, false);
    });

    const handleEnabledChange: (event: FormEvent<HTMLInputElement>) => void = () => {
        // Toggle the checkbox
        setEnabled((current: boolean) => !current);
        // Run the onchange
        if (onChange) {
            onChange(name, !enabled);
        }
    };

    return <Switch checked={enabled} large onChange={handleEnabledChange} />;
};

export default BooleanField;
