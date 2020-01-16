import React, { FunctionComponent, useState, useEffect } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField } from '.';
import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import StringField from './string';
import BooleanField from './boolean';
import DateField from './date';
import TextareaField from './textarea';
import SelectField from './select';
import { Callout } from '@blueprintjs/core';
import NumberField from './number';
import OptionHashField from './optionHash';
import { getTypeFromValue } from '../../helpers/validations';

const AutoField: FunctionComponent<IField & IFieldChange> = ({
    name,
    onChange,
    value,
    default_value,
    defaultType,
    requestFieldData,
    type,
    t,
    ...rest
}) => {
    const [currentType, setType] = useState<string>(null);
    const [isInitialType, setIsInitialType] = useState<boolean>(true);

    useMount(() => {
        // If value already exists, but the type is auto or any
        // set the type based on the value
        if (value && (defaultType === 'auto' || defaultType === 'any')) {
            setType(getTypeFromValue(value));
        } else {
            setType(defaultType);
        }
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
        // Check if there is actually any type
        if (currentType) {
            // Is this the first time the type is set
            if (isInitialType) {
                // Reset the value
                onChange(name, value, currentType);
                // Set the initial type was set
                setIsInitialType(false);
            } else {
                // Reset the value
                onChange(name, null);
            }
        }
    }, [currentType]);

    const handleChange: (name: string, value: any) => void = (name, value) => {
        // Run the onchange
        if (onChange) {
            onChange(name, value, currentType);
        }
    };

    console.log(value);

    const renderField = currentType => {
        // Render the field based on the type
        switch (currentType) {
            case 'string':
            case 'data':
            case 'binary':
                return <StringField {...rest} name={name} onChange={handleChange} value={value} type={currentType} />;
            case 'bool':
                return <BooleanField {...rest} name={name} onChange={handleChange} value={value} type={currentType} />;
            case 'date':
                return <DateField {...rest} name={name} onChange={handleChange} value={value} type={currentType} />;
            case 'hash':
            case 'hash<auto>':
            case 'list':
            case 'list<auto>':
                return (
                    <TextareaField
                        {...rest}
                        name={name}
                        onChange={handleChange}
                        value={value}
                        fill
                        type={currentType}
                        placeholder={t('Yaml')}
                    />
                );
            case 'int':
            case 'float':
                return (
                    <NumberField {...rest} name={name} onChange={handleChange} value={value} fill type={currentType} />
                );
            case 'option_hash':
                return (
                    <OptionHashField
                        {...rest}
                        name={name}
                        onChange={handleChange}
                        value={value || undefined}
                        fill
                        type={currentType}
                    />
                );
            default:
                return <Callout>{t('AutoFieldSelectType')}</Callout>;
        }
    };

    // Render type picker if the type is auto or any
    return (
        <>
            {(defaultType === 'auto' || defaultType === 'any') && (
                <SelectField
                    name="type"
                    defaultItems={[
                        { name: 'bool' },
                        { name: 'date' },
                        { name: 'string' },
                        { name: 'binary' },
                        { name: 'float' },
                        { name: 'list' },
                        { name: 'hash' },
                        { name: 'int' },
                    ]}
                    value={currentType}
                    onChange={(_name, value) => {
                        setType(value);
                    }}
                />
            )}
            {renderField(currentType)}
        </>
    );
};

export default AutoField;
