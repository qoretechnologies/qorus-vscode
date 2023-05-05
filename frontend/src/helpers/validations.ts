import jsyaml from 'js-yaml';
import { isDate } from 'lodash';
import every from 'lodash/every';
import isArray from 'lodash/isArray';
import isNaN from 'lodash/isNaN';
import isNumber from 'lodash/isNumber';
import isObject from 'lodash/isPlainObject';
import size from 'lodash/size';
import uniqWith from 'lodash/uniqWith';
import { isBoolean, isNull, isString, isUndefined } from 'util';
import { TApiManagerEndpoint } from '../components/Field/apiManager';
import { IProviderType, maybeBuildOptionProvider } from '../components/Field/connectors';
import {
  IOptions,
  IOptionsSchemaArg,
  IQorusType,
  TOption,
  fixOperatorValue,
} from '../components/Field/systemOptions';
import { getTemplateKey, getTemplateValue, isValueTemplate } from '../components/Field/template';
import { getAddress, getProtocol } from '../components/Field/urlField';
import { IField } from '../components/FieldWrapper';
import { TTrigger, TVariableActionValue } from '../containers/InterfaceCreator/fsm';
import { splitByteSize } from './functions';

const cron = require('cron-validator');

export const validateField: (
  type: string | IQorusType,
  value?: any,
  field?: IField & any,
  canBeNull?: boolean
) => boolean = (type, value, field, canBeNull) => {
  if (!type) {
    return false;
  }
  // Check if the type starts with a * to indicate it can be null
  if (type.startsWith('*')) {
    type = type.substring(1);
    canBeNull = true;
  }
  // If the value can be null an is null
  // immediately return true, no matter what type
  if (canBeNull && isNull(value)) {
    return true;
  }
  // Get the actual type
  // Check if there is a `<` in the type
  const pos: number = type.indexOf('<');
  // If there is a <
  if (pos > 0) {
    // Get the type from start to the position of the `<`
    type = type.slice(0, pos);
  }
  // Check if the value is a template string
  if (isValueTemplate(value)) {
    // Check if the template has both the key and value
    return !!getTemplateKey(value) && !!getTemplateValue(value);
  }
  // Check individual types
  switch (type) {
    case 'binary':
    case 'string':
    case 'mapper':
    case 'workflow':
    case 'service':
    case 'job':
    case 'connection':
    case 'softstring':
    case 'select-string':
    case 'file-string':
    case 'file-as-string':
    case 'long-string':
    case 'method-name':
    case 'data': {
      if (value === undefined || value === null || value === '' || typeof value !== 'string') {
        return false;
      }

      let isValid = true;

      // Check if this field has to be a valid identifier
      if (field?.has_to_be_valid_identifier) {
        isValid = !value.match(/^[0-9]|\W/);
      }

      if (field?.has_to_have_value) {
        isValid = value !== '' && value.length !== 0;
      }

      // Strings cannot be empty
      return isValid;
    }
    case 'array-of-pairs': {
      let valid = true;
      // Check if every pair has key & value
      // assigned properly
      if (!Array.isArray(value)) {
        return false;
      }
      if (
        !value?.every(
          (pair: { [key: string]: string }): boolean =>
            pair[field.fields[0]] !== '' && pair[field.fields[1]] !== ''
        )
      ) {
        valid = false;
      }
      // Get a list of unique values
      const uniqueValues: any[] = uniqWith(
        value,
        (cur, prev) => cur[field.fields[0]] === prev[field.fields[0]]
      );
      // Check if there are any duplicates
      if (size(uniqueValues) !== size(value)) {
        valid = false;
      }

      return valid;
    }
    case 'class-connectors': {
      if (!Array.isArray(value) || value.length === 0) {
        return false;
      }
      let valid = true;
      // Check if every pair has name, input method and output method
      // assigned properly
      if (
        !value?.every(
          (pair: { [key: string]: string }): boolean =>
            pair.name && pair.name !== '' && pair.method && pair.method !== ''
        )
      ) {
        valid = false;
      }
      // Get a list of unique values
      const uniqueValues: any[] = uniqWith(value, (cur, prev) => cur.name === prev.name);
      // Check if there are any duplicates
      if (size(uniqueValues) !== size(value)) {
        valid = false;
      }

      return valid;
    }
    // Classes check
    case 'class-array': {
      if (!(Array.isArray(value) && value.length > 0)) {
        return false;
      }
      let valid = true;
      // Check if the fields are not empty
      if (
        !value?.every((pair: { [key: string]: string }): boolean => pair.name && pair.name !== '')
      ) {
        valid = false;
      }
      // Get a list of unique values
      const uniqueValues: any[] = uniqWith(
        value,
        (cur, prev) => `${cur.prefix}${cur.name}` === `${prev.prefix}${prev.name}`
      );
      // Check if there are any duplicates
      if (size(uniqueValues) !== size(value)) {
        valid = false;
      }

      return valid;
    }
    case 'int':
    case 'softint':
    case 'number':
      return !isNaN(value) && getTypeFromValue(value) === 'int';
    case 'float':
      return (
        !isNaN(value) && (getTypeFromValue(value) === 'float' || getTypeFromValue(value) === 'int')
      );
    case 'select-array':
    case 'array':
    case 'file-tree':
      // Check if there is atleast one value
      // selected
      return value && value.length > 0;
    case 'cron':
      if (!value) {
        return false;
      }
      // Check if the cron is valid
      return cron.isValidCron(value, { alias: true });
    case 'date':
      // Check if the date is valid
      return (
        value !== undefined &&
        value !== null &&
        value !== '' &&
        new Date(value).toString() !== 'Invalid Date'
      );
    case 'hash':
    case 'hash<auto>': {
      if (field?.arg_schema) {
        return every(field.arg_schema, (fieldData: IOptionsSchemaArg, argName: string) => {
          return validateField(fieldData.type as IQorusType, value?.[argName], fieldData);
        });
      }
      // Get the parsed yaml
      const parsedValue: any = typeof value === 'object' ? value : maybeParseYaml(value);
      // If the value is not an object or empty
      if (!parsedValue || !isObject(parsedValue)) {
        return false;
      }
      return true;
    }
    case 'list':
    case 'softlist':
    case 'list<auto>': {
      // Get the parsed yaml
      const parsedValue: any = maybeParseYaml(value);
      // If the value is not an object or empty
      if (!parsedValue || !isArray(parsedValue)) {
        return false;
      }
      return true;
    }
    case 'list-of-hashes': {
      // Get the parsed yaml
      const parsedValue: any = maybeParseYaml(value);
      // If the value is not an object or empty
      if (!parsedValue || !isArray(parsedValue)) {
        return false;
      }
      // If the value is not an object or empty
      return parsedValue.every((item: any) => validateField('hash', item));
    }
    case 'mapper-code':
      if (!value) {
        return false;
      }
      // Split the value
      const [code, method] = value.split('::');
      // Both fields need to be strings & filled
      return validateField('string', code) && validateField('string', method);
    case 'var-action': {
      const varAction: TVariableActionValue = value;

      if (
        varAction.var_type !== 'localvar' &&
        varAction.var_type !== 'globalvar' &&
        varAction.var_type !== 'autovar'
      ) {
        return false;
      }

      if (!validateField('string', varAction.var_name, { has_to_have_value: true })) {
        return false;
      }

      if (!validateField('string', varAction.action_type, { has_to_have_value: true })) {
        return false;
      }

      // If the action type is transaction, the transaction_action needs to be set
      if (varAction.action_type === 'transaction') {
        if (!validateField('string', varAction.transaction_action, { has_to_have_value: true })) {
          return false;
        }

        return true;
      }

      // If the variable data is missing
      if (!field?.variableData?.value) {
        return false;
      }

      // Get the variable data
      const variableData: TVariableActionValue = { ...value, ...field.variableData.value };

      return validateField(varAction.action_type, variableData, field);
    }
    case 'type-selector':
    case 'data-provider':
    case 'api-call':
    case 'search-single':
    case 'send-message':
    case 'search':
    case 'update':
    case 'delete':
    case 'create':
      let newValue: IProviderType = maybeBuildOptionProvider(value);

      if (!newValue) {
        return false;
      }

      // Api call only supports  requests / response
      if (type === 'api-call' && !value.supports_request) {
        return false;
      }

      // If the provider is from FSM variables, it needs pass this
      if (
        field?.isVariable &&
        !(
          newValue.supports_read ||
          newValue.supports_create ||
          newValue.supports_update ||
          newValue.supports_delete ||
          newValue.supports_request ||
          newValue.supports_messages ||
          newValue.transaction_management
        )
      ) {
        return false;
      }

      // Send message only supports messages
      if (
        type === 'send-message' &&
        (!newValue.supports_messages || !newValue.message_id || !newValue.message)
      ) {
        return false;
      }

      if (newValue.message_id) {
        if (!validateField('string', newValue.message_id)) {
          return false;
        }

        if (!newValue.message || !validateField(newValue.message.type, newValue.message.value)) {
          return false;
        }
      }

      if (newValue.use_args) {
        if (newValue.args?.type !== 'nothing') {
          if (!newValue.args) {
            return false;
          }

          if (
            !validateField(
              newValue.args.type === 'hash' ? 'system-options' : newValue.args.type,
              newValue.args.value
            )
          ) {
            return false;
          }
        }
      }

      if (
        (type === 'search-single' || type === 'search') &&
        size(newValue.search_args) !== 0 &&
        !validateField('system-options-with-operators', newValue.search_args)
      ) {
        return false;
      }

      const isUpdateOrCreate = type === 'update' || type === 'create';

      if (isUpdateOrCreate) {
        const areNormalArgsInvalid =
          `${type}_args` in value &&
          (size(newValue[`${type}_args`]) === 0 ||
            !validateField('system-options', newValue[`${type}_args`]));

        const areFreeFormArgsInvalid =
          `${type}_args_freeform` in value &&
          (size(newValue[`${type}_args_freeform`]) === 0 ||
            !validateField('list-of-hashes', newValue[`${type}_args_freeform`]));

        if (`${type}_args` in newValue && areNormalArgsInvalid) {
          return false;
        }

        if (`${type}_args_freeform` in newValue && areFreeFormArgsInvalid) {
          return false;
        }
      }

      if (newValue?.type === 'factory') {
        if (newValue.optionsChanged) {
          return false;
        }

        let options = true;

        if (newValue.options) {
          options = validateField('system-options', newValue.options);
        }

        // Type path and name are required
        return !!(newValue.type && newValue.name && options);
      }

      if (newValue.record_requires_search_options && newValue.searchOptionsChanged) {
        return false;
      }

      if (newValue.search_options && !validateField('system-options', newValue.search_options)) {
        return false;
      }

      return !!(newValue.type && newValue.name);
    case 'context-selector':
      if (isString(value)) {
        const cont: string[] = value.split(':');
        return validateField('string', cont[0]) && validateField('string', cont[1]);
      }
      return !!value?.iface_kind && !!value?.name;
    case 'service-event': {
      if (!validateField('type-selector', value)) {
        return false;
      }

      if (
        !size(value.handlers) ||
        !every(
          value.handlers,
          (handler) => (handler.type === 'fsm' || handler.type === 'method') && handler.value
        )
      ) {
        return false;
      }

      return true;
    }
    case 'service-events': {
      if (!isArray(value) || !size(value)) {
        return false;
      }

      return value.every((serviceEvent) => {
        return validateField('service-event', serviceEvent);
      });
    }
    case 'auto':
    case 'any': {
      // Parse the string as yaml
      let yamlCorrect = true;
      let parsedData;
      // Parse the yaml
      try {
        parsedData = jsyaml.safeLoad(value);
      } catch (e) {
        yamlCorrect = false;
      }

      if (!yamlCorrect) {
        return false;
      }

      if (parsedData) {
        return validateField(getTypeFromValue(parsedData), value);
      }

      return false;
    }
    case 'processor': {
      let valid = true;
      if (!value || !value['processor-input-type'] || !value['processor-output-type']) {
        return false;
      }
      // Validate the input and output types
      if (
        value?.['processor-input-type'] &&
        !validateField('type-selector', value?.['processor-input-type'])
      ) {
        valid = false;
      }
      if (
        value?.['processor-output-type'] &&
        !validateField('type-selector', value?.['processor-output-type'])
      ) {
        valid = false;
      }

      return valid;
    }
    case 'fsm-list': {
      return value?.every(
        (val: { name: string; triggers?: TTrigger[] }) => validateField('string', val.name) === true
      );
    }
    case 'api-manager': {
      if (!value) {
        return false;
      }

      let valid = true;

      if (!validateField('string', value.factory)) {
        valid = false;
      }

      if (!validateField('system-options', value['provider-options'])) {
        valid = false;
      }

      if (!validateField('api-endpoints', value.endpoints)) {
        valid = false;
      }

      return valid;
    }
    case 'api-endpoints': {
      if (!isArray(value) || !size(value)) {
        return false;
      }

      return value.every((endpoint: TApiManagerEndpoint) =>
        validateField('string', endpoint.value)
      );
    }
    case 'options':
    case 'pipeline-options':
    case 'mapper-options':
    case 'system-options': {
      const isValid = (val) => {
        if (!val || size(val) === 0) {
          if (canBeNull) {
            return true;
          }

          return false;
        }

        return every(val, (optionData) =>
          typeof optionData !== 'object'
            ? validateField(getTypeFromValue(optionData), optionData)
            : validateField(optionData.type, optionData.value)
        );
      };

      if (isArray(value)) {
        return value.every(isValid);
      }

      return isValid(value);
    }
    case 'system-options-with-operators': {
      const isValid = (val: IOptions) => {
        if (!val || size(val) === 0) {
          if (canBeNull) {
            return true;
          }

          return false;
        }

        return every(val, (optionData: TOption) => {
          let isValid: boolean =
            typeof optionData !== 'object'
              ? validateField(getTypeFromValue(optionData), optionData)
              : validateField(optionData.type, optionData.value);

          if (
            !optionData.op ||
            !fixOperatorValue(optionData.op).every((operator) => validateField('string', operator))
          ) {
            isValid = false;
          }

          return isValid;
        });
      };

      if (isArray(value)) {
        return value.every(isValid);
      }

      return isValid(value);
    }
    case 'byte-size': {
      let valid = true;
      if (typeof value !== 'string') return false;

      const [bytes, size] = splitByteSize(value);

      if (!validateField('number', bytes)) {
        valid = false;
      }

      if (!validateField('string', size)) {
        valid = false;
      }

      return valid;
    }
    case 'url': {
      return (
        validateField('string', getProtocol(value)) && validateField('string', getAddress(value))
      );
    }
    case 'nothing':
      return false;
    default:
      return true;
  }
};

export const maybeParseYaml: (yaml: any) => any = (yaml) => {
  // If we are dealing with basic boolean
  if (yaml === true || yaml === false) {
    return yaml;
  }
  // Leave numbers as they are
  if (isNumber(yaml)) {
    return yaml;
  }

  // Leave dates
  if (isDate(yaml)) {
    return yaml;
  }
  // Check if the value isn't empty
  if (yaml === undefined || yaml === null || yaml === '') {
    return null;
  }

  if (!isString(yaml)) {
    return yaml;
  }

  // Parse the string as yaml
  let yamlCorrect = true;
  let parsedData;
  // Parse the yaml
  try {
    parsedData = jsyaml.safeLoad(String(yaml));
  } catch (e) {
    yamlCorrect = false;
  }

  if (!yamlCorrect) {
    return null;
  }

  if (!isNull(parsedData) && !isUndefined(parsedData)) {
    return parsedData;
  }

  return null;
};

export const isValueSet = (value: any, canBeNull?: boolean) => {
  if (canBeNull) {
    return !isUndefined(value);
  }

  return !isNull(value) && !isUndefined(value);
};

export const getValueOrDefaultValue = (value, defaultValue, canBeNull) => {
  if (isValueSet(value, canBeNull)) {
    return value;
  }

  if (isValueSet(defaultValue, canBeNull)) {
    return defaultValue;
  }

  return undefined;
};

export const getTypeFromValue = (value: any) => {
  if (isNull(value)) {
    return 'null';
  }
  if (isBoolean(value)) {
    return 'bool';
  }

  if (value === 0 || (Number(value) === value && value % 1 === 0)) {
    return 'int';
  }

  if (value === 0 || value === 0.0 || (Number(value) === value && value % 1 !== 0)) {
    return 'float';
  }
  if (isObject(value)) {
    return 'hash';
  }
  if (isArray(value)) {
    return 'list';
  }
  if (new Date(value).toString() !== 'Invalid Date') {
    return 'date';
  }
  if (isString(value)) {
    return 'string';
  }

  return 'none';
};
