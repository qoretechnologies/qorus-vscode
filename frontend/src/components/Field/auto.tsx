import { Button, Callout, ControlGroup } from '@blueprintjs/core';
import { get, map, set } from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import { IFieldChange } from '../../components/FieldWrapper';
import {
  getTypeFromValue,
  getValueOrDefaultValue,
  maybeParseYaml,
} from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';
import SubField from '../SubField';
import { IField } from './';
import BooleanField from './boolean';
import ByteSizeField from './byteSize';
import ConnectorField from './connectors';
import DateField from './date';
import FileField from './fileString';
import { InterfaceSelector } from './interfaceSelector';
import LongStringField from './longString';
import NumberField from './number';
import OptionHashField from './optionHash';
import RadioField from './radioField';
import SelectField from './select';
import StringField from './string';
import { IOptionsSchema } from './systemOptions';

const AutoField: FunctionComponent<
  IField &
    IFieldChange & { arg_schema?: IOptionsSchema; path?: string; column?: boolean; level?: number }
> = ({
  name,
  onChange,
  value,
  default_value,
  defaultType,
  defaultInternalType,
  requestFieldData,
  type,
  t,
  noSoft,
  path,
  arg_schema,
  column,
  level = 0,
  ...rest
}) => {
  const [currentType, setType] = useState<string>(defaultInternalType || null);
  const [currentInternalType, setInternalType] = useState<string>(defaultInternalType || 'any');
  const [isSetToNull, setIsSetToNull] = useState<boolean>(false);

  useMount(() => {
    let defType = defaultType && defaultType.replace(/"/g, '').trim();
    defType = defType || 'any';
    // If value already exists, but the type is auto or any
    // set the type based on the value
    if (value && (defType === 'auto' || defType === 'any') && !defaultInternalType) {
      setInternalType(getTypeFromValue(maybeParseYaml(value)));
    } else {
      setInternalType(defaultInternalType || defType);
    }

    setType(defType);
    // If the value is null and can be null, set the null flag
    if (
      (getValueOrDefaultValue(value, default_value, canBeNull(defType)) === 'null' ||
        getValueOrDefaultValue(value, default_value, canBeNull(defType)) === null) &&
      canBeNull(defType)
    ) {
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
          const typeFromValue = value ? getTypeFromValue(maybeParseYaml(value)) : 'any';

          handleChange(
            name,
            value === null ? null : typeValue === typeFromValue ? value : undefined
          );
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
    setIsSetToNull((current) => {
      return !current;
    });

    // Handle change
    handleChange(name, isSetToNull ? undefined : null);
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
      case 'softstring':
      case 'data':
      case 'binary':
        return (
          <LongStringField
            fill
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            type={currentType}
          />
        );
      case 'bool':
      case 'softbool':
        return (
          <BooleanField
            fill
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            type={currentType}
          />
        );
      case 'date':
        return (
          <DateField
            fill
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            type={currentType}
          />
        );
      case 'hash':
      case 'hash<auto>': {
        if (arg_schema) {
          const currentPath = path ? `${path}.` : '';
          const transformedValue = typeof value === 'string' ? maybeParseYaml(value) : value;

          console.log('VALUE HAS MAYBE UPDATED', value, transformedValue, 'ON LEVEL', level);

          return map(arg_schema, (schema, option) => {
            console.log(
              `${currentPath}${option}`,
              get(transformedValue, `${currentPath}${option}`),
              schema
            );
            return (
              <SubField title={option} {...schema} detail={schema.type}>
                <AutoField
                  {...schema}
                  path={`${currentPath}${option}`}
                  name={`${currentPath}${option}`}
                  level={level + 1}
                  defaultType={schema.type}
                  defaultInternalType={schema.type}
                  value={get(transformedValue, `${option}`)}
                  onChange={(n, v) => {
                    if (v !== undefined) {
                      if (level === 0) {
                        console.log('THE TRANSFORMED VALUE', transformedValue);
                        console.log('CHANGING', n, 'TO', v);
                        const newValue = set(transformedValue || {}, n, v);
                        console.log('THE NEW VALUE', newValue);
                        handleChange(name, newValue);
                      } else {
                        console.log('CHANGING', n, 'TO', v);
                        handleChange(n, v);
                      }
                    }
                  }}
                  column
                />
              </SubField>
            );
          });
        }

        return (
          <LongStringField
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            fill
            type={currentType}
            noWrap
            placeholder={t('Yaml')}
          />
        );
      }
      case 'list':
      case 'softlist<string>':
      case 'softlist':
      case 'list<auto>':
        return (
          <LongStringField
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            fill
            type={currentType}
            noWrap
            placeholder={t('Yaml')}
          />
        );
      case 'int':
      case 'softint':
      case 'float':
      case 'softfloat':
      case 'number':
        return (
          <NumberField
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            fill
            type={currentType}
          />
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
      case 'byte-size':
        return (
          <ByteSizeField
            {...rest}
            name={name}
            onChange={handleChange}
            value={value}
            type={currentType}
          />
        );
      case 'enum':
        return (
          <RadioField
            items={rest.allowed_values}
            value={value}
            name={name}
            onChange={handleChange}
            type={currentType}
          />
        );
      case 'select-string': {
        return (
          <SelectField
            defaultItems={rest.allowed_values}
            value={value}
            name={name}
            onChange={handleChange}
            type={currentType}
          />
        );
      }
      case 'mapper':
      case 'workflow':
      case 'service':
      case 'job':
      case 'value-map':
      case 'connection': {
        return (
          <InterfaceSelector type={currentType} name={name} value={value} onChange={handleChange} />
        );
      }
      case 'data-provider': {
        return (
          <ConnectorField
            value={value}
            isInitialEditing={!!default_value}
            name={name}
            inline
            minimal
            isConfigItem
            onChange={handleChange}
          />
        );
      }
      case 'file-as-string': {
        return (
          <div>
            <FileField
              name={name}
              value={value}
              onChange={handleChange}
              type={currentType}
              get_message={{
                action: 'creator-get-resources',
                object_type: 'files',
              }}
              return_message={{
                action: 'creator-return-resources',
                object_type: 'files',
                return_value: 'resources',
              }}
            />
          </div>
        );
      }
      case 'any':
        return null;
      case 'auto':
        return <Callout>Please select data type</Callout>;
      default:
        return <Callout intent="danger">{t('UnknownType')}</Callout>;
    }
  };

  const showPicker =
    !isSetToNull &&
    (defaultType === 'auto' ||
      defaultType === 'any' ||
      currentType === 'auto' ||
      currentType === 'any');

  const types = !noSoft
    ? [
        { name: 'bool' },
        { name: 'softbool' },
        { name: 'date' },
        { name: 'string' },
        { name: 'softstring' },
        { name: 'binary' },
        { name: 'float' },
        { name: 'softfloat' },
        { name: 'list' },
        { name: 'softlist' },
        { name: 'hash' },
        { name: 'int' },
        { name: 'softint' },
      ]
    : [
        { name: 'bool' },
        { name: 'date' },
        { name: 'string' },
        { name: 'binary' },
        { name: 'float' },
        { name: 'list' },
        { name: 'hash' },
        { name: 'int' },
      ];

  // Render type picker if the type is auto or any
  return (
    <>
      <ControlGroup
        fill
        style={{
          flexFlow: column || arg_schema ? 'column' : 'row',
          marginLeft: 10 * level,
          overflow: 'hidden',
          flexShrink: 0,
          width: `calc(100% - ${11 * level}px)`,
          maxHeight: arg_schema && level === 0 ? '300px' : undefined,
          overflowY: arg_schema && level === 0 ? 'auto' : undefined,
        }}
      >
        {showPicker && (
          <SelectField
            name="type"
            defaultItems={types}
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
