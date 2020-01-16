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
import { getTypeFromValue, maybeParseYaml, getValueOrDefaultValue } from '../../helpers/validations';
import { isBoolean } from 'util';

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
    const [currentInternalType, setInternalType] = useState<string>(null);
    const [isInitialType, setIsInitialType] = useState<boolean>(true);

    useMount(() => {
        const defType = defaultType && defaultType.replace(/"/g, '').trim();
        // If value already exists, but the type is auto or any
        // set the type based on the value
        if (value && (defType === 'auto' || defType === 'any')) {
            setInternalType(getTypeFromValue(maybeParseYaml(value)));
        } else {
            setInternalType(defType);
        }

        setType(defType);

        // Set the default value
        onChange(name, getValueOrDefaultValue(value, default_value, false));
    });

    useEffect(() => {
        // Auto field type depends on other fields' value
        // which will be used as a type
        if (rest['type-depends-on']) {
            // Get the requested type
            const typeValue: string = requestFieldData(rest['type-depends-on'], 'value');
            // Check if the field has the value set yet
            if (typeValue && typeValue !== currentType) {
                // If this is auto / any field
                // set the internal type
                if (typeValue === 'auto' || typeValue === 'any') {
                    setInternalType(value ? getTypeFromValue(maybeParseYaml(value)) : 'string');
                } else {
                    setInternalType(typeValue);
                }
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
                onChange(name, value, currentInternalType);
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
            onChange(name, value, currentInternalType);
        }
    };

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
            {(defaultType === 'auto' || defaultType === 'any' || currentType === 'auto' || currentType === 'any') && (
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
                    value={currentInternalType}
                    onChange={(_name, value) => {
                        onChange(name, null, currentInternalType);
                        setInternalType(value);
                    }}
                />
            )}
            {renderField(currentInternalType)}
        </>
    );
};

export default AutoField;
