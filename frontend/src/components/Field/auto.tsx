import { ReqoreButton, ReqoreMessage } from '@qoretechnologies/reqore';
import { get, map, set } from 'lodash';
import { FunctionComponent, useEffect, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import { IField } from '../../components/FieldWrapper';
import {
  getTypeFromValue,
  getValueOrDefaultValue,
  maybeParseYaml,
  validateField,
} from '../../helpers/validations';
import withTextContext from '../../hocomponents/withTextContext';
import SubField from '../SubField';
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
import { IOptionsSchema, IQorusType } from './systemOptions';

export interface IAutoFieldProps extends IField {
  arg_schema?: IOptionsSchema;
  path?: string;
  column?: boolean;
  level?: number;
  defaultType?: IQorusType;
  defaultInternalType?: IQorusType;
  noSoft?: boolean;
  allowed_values?: { name: string; desc?: string }[];
}

const AutoField: FunctionComponent<IAutoFieldProps> = ({
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
    let internalType;
    // If value already exists, but the type is auto or any
    // set the type based on the value
    if (value && (defType === 'auto' || defType === 'any') && !defaultInternalType) {
      internalType = getTypeFromValue(maybeParseYaml(value));
    } else {
      internalType = defaultInternalType || defType;
    }
    setInternalType(internalType);
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
    handleChange(
      name,
      getValueOrDefaultValue(value, default_value, canBeNull(internalType)),
      internalType
    );
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
          handleChange(name, value === undefined ? undefined : value, typeValue);
        } else if (typeValue !== 'any') {
          const typeFromValue =
            value || value === null ? getTypeFromValue(maybeParseYaml(value)) : 'any';

          handleChange(
            name,
            value === null ? null : typeValue === typeFromValue ? value : undefined,
            typeValue
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
    if (type === 'any' || type === 'Any' || canBeNull) {
      return true;
    }

    if (requestFieldData) {
      return requestFieldData('can_be_undefined', 'value');
    }

    return false;
  };

  const handleChange: (name: string, value: any, type?: string) => void = (name, value, type) => {
    const returnType = currentInternalType || type;
    // Run the onchange
    if (onChange && returnType) {
      onChange(name, value, returnType, canBeNull(returnType));
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
            onChange={(name, value) => {
              handleChange(name, value);
            }}
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

          return map(arg_schema, (schema, option) => {
            return (
              <SubField
                title={option}
                {...schema}
                desc={`${currentPath}${option} <${schema.type}>`}
                collapsible
                nested={level > 0}
                isValid={
                  schema.required
                    ? validateField(schema.type, get(transformedValue, `${option}`))
                    : true
                }
                detail={schema.required ? 'Required' : 'Optional'}
              >
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
                        const newValue = set(transformedValue || {}, n, v);

                        handleChange(name, newValue);
                      } else {
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
            placeholder={'Yaml'}
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
            placeholder={'Yaml'}
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
        );
      }
      case 'any':
        return null;
      case 'auto':
        return <ReqoreMessage intent="info">Please select data type</ReqoreMessage>;
      default:
        return <ReqoreMessage intent="danger">{t('UnknownType')}</ReqoreMessage>;
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
    <div
      style={{
        flexFlow: column || arg_schema ? 'column' : 'row',
        marginLeft: arg_schema ? 10 * level : 0,
        overflow: 'hidden',
        flex: '1 0 auto',
        maxHeight: arg_schema && level === 0 ? '500px' : undefined,
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
        <ReqoreButton
          intent={isSetToNull ? 'warning' : undefined}
          icon={isSetToNull ? 'CloseLine' : undefined}
          onClick={handleNullToggle}
          fixed
        >
          {isSetToNull ? 'Unset null' : 'Set as null'}
        </ReqoreButton>
      )}
    </div>
  );
};

export default withTextContext()(AutoField) as React.FC<IAutoFieldProps>;
