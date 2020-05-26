import React, { FunctionComponent, useEffect, useState } from 'react';

import useMount from 'react-use/lib/useMount';
import { isNull } from 'util';

import { Button, Callout, ControlGroup } from '@blueprintjs/core';

import { IFieldChange } from '../../containers/InterfaceCreator/panel';
import { getTypeFromValue, getValueOrDefaultValue, maybeParseYaml } from '../../helpers/validations';
import { IField } from './';
import BooleanField from './boolean';
import DateField from './date';
import NumberField from './number';
import OptionHashField from './optionHash';
import SelectField from './select';
import StringField from './string';
import TextareaField from './textarea';
import withTextContext from '../../hocomponents/withTextContext';

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
    const [currentInternalType, setInternalType] = useState<string>('any');
    const [isSetToNull, setIsSetToNull] = useState<boolean>(false);

    useMount(() => {
        let defType = defaultType && defaultType.replace(/"/g, '').trim();
        defType = defType || 'any';
        // If value already exists, but the type is auto or any
        // set the type based on the value
        if (value && (defType === 'auto' || defType === 'any')) {
            setInternalType(getTypeFromValue(maybeParseYaml(value)));
        } else {
            setInternalType(defType);
        }

        setType(defType);
        // If the value is null and can be null, set the null flag
        if (isNull(getValueOrDefaultValue(value, default_value, canBeNull(defType))) && canBeNull(defType)) {
            setIsSetToNull(true);
        }

        // Set the default value
        handleChange(name, getValueOrDefaultValue(value, default_value, canBeNull(defType)));
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
                    setInternalType(value ? getTypeFromValue(maybeParseYaml(value)) : 'any');
                } else {
                    setInternalType(typeValue);
                }
                // Set the new type
                setType(typeValue);
                if (!currentType) {
                    handleChange(name, value === undefined ? undefined : value);
                } else if (typeValue !== 'any') {
                    handleChange(name, undefined);
                }
            }
        }
        // If can be undefined was toggled off, but the value right now is null
        // we need to set the ability to be null to false and remove
        if (!canBeNull() && isSetToNull) {
            setIsSetToNull(false);
            handleChange(name, null);
        }
    });

    const canBeNull = (type = currentType) => {
        if (type === 'any' || type === 'Any') {
            return true;
        }

        if (requestFieldData) {
            return requestFieldData('can_be_undefined', 'value');
        }

        return false;
    };

    const handleChange: (name: string, value: any) => void = (name, value) => {
        // Run the onchange
        if (onChange && currentInternalType) {
            onChange(name, value, currentInternalType, canBeNull());
        }
    };

    const handleNullToggle = () => {
        setType(defaultType || 'any');
        setInternalType(defaultType || 'any');
        setIsSetToNull((current) => !current);
        // Handle change
        handleChange(name, null);
    };

    const renderField = (currentType: string) => {
        // If this field is set to null
        if (isSetToNull) {
            // Render a readonly field with null
            return <StringField name={name} value={null} onChange={handleChange} read_only canBeNull />;
        }
        if (!currentType) {
            return null;
        }
        // Check if there is a `<` in the type
        const pos: number = currentType.indexOf('<');

        if (pos > 0) {
            // Get the type from start to the position of the `<`
            currentType = currentType.slice(0, pos);
        }

        // Render the field based on the type
        switch (currentType) {
            case 'string':
            case 'data':
            case 'binary':
                return (
                    <StringField fill {...rest} name={name} onChange={handleChange} value={value} type={currentType} />
                );
            case 'bool':
                return (
                    <BooleanField fill {...rest} name={name} onChange={handleChange} value={value} type={currentType} />
                );
            case 'date':
                return (
                    <DateField fill {...rest} name={name} onChange={handleChange} value={value} type={currentType} />
                );
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
            case 'any':
                return null;
            default:
                return <Callout>{t('AutoFieldSelectType')}</Callout>;
        }
    };

    const showPicker =
        !isSetToNull &&
        (defaultType === 'auto' || defaultType === 'any' || currentType === 'auto' || currentType === 'any');

    // Render type picker if the type is auto or any
    return (
        <>
            <ControlGroup fill>
                {showPicker && (
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
                            handleChange(name, null);
                            setInternalType(value);
                        }}
                    />
                )}

                {renderField(currentInternalType)}
                {canBeNull() && (
                    <Button
                        intent={isSetToNull ? 'warning' : 'none'}
                        icon={isSetToNull && 'cross'}
                        onClick={handleNullToggle}
                    >
                        {isSetToNull ? 'Unset null' : 'Set as null'}
                    </Button>
                )}
            </ControlGroup>
        </>
    );
};

export default withTextContext()(AutoField);
