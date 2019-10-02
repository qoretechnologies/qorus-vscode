import React, { FunctionComponent, useState, useEffect } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import StringField from './string';
import BooleanField from './boolean';
import DateField from './date';
import TextareaField from './textarea';
import { Callout } from '@blueprintjs/core';
import NumberField from './number';

const AutoField: FunctionComponent<IField & IFieldChange> = ({
    name,
    onChange,
    value,
    default_value,
    requestFieldData,
    type,
    t,
    ...rest
}) => {
    const [currentType, setType] = useState<string>(null);

    useMount(() => {
        // Set the default value
        onChange(name, value || default_value || null);
    });

    useEffect(() => {
        // Auto field type depends on other fields' value
        // which will be used as a type
        if (rest['type-depends-on']) {
            // Get the requested type
            const typeValue: string = requestFieldData(rest['type-depends-on'], 'value');
            // Check if the field has the value set yet
            if (typeValue && typeValue !== currentType) {
                // Set the new type
                setType(typeValue);
            }
        }
    });

    // Reset the value when type changes
    useEffect(() => {
        // Reset the value
        onChange(name, null);
    }, [currentType]);

    const handleChange: (name: string, value: any) => void = (name, value) => {
        // Run the onchange
        if (onChange) {
            onChange(name, value);
        }
    };

    // Render the field based on the type
    switch (currentType) {
        case 'string':
            return <StringField name={name} onChange={handleChange} value={value} type={currentType} />;
        case 'bool':
            return <BooleanField name={name} onChange={handleChange} value={value} type={currentType} />;
        case 'date':
            return <DateField name={name} onChange={handleChange} value={value} type={currentType} />;
        case 'hash':
        case 'list':
            return <TextareaField name={name} onChange={handleChange} value={value} fill type={currentType} />;
        case 'int':
        case 'float':
            return <NumberField name={name} onChange={handleChange} value={value} fill type={currentType} />;
        default:
            return <Callout>{t('AutoFieldSelectType')}</Callout>;
    }
};

export default AutoField;
