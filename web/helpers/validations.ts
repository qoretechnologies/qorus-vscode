import { IField } from '../containers/InterfaceCreator/panel';
const cron = require('cron-validator');
import isNumber from 'lodash/isNumber';
import isArray from 'lodash/isArray';
import isNaN from 'lodash/isNaN';
import uniqWith from 'lodash/uniqWith';
import size from 'lodash/size';
import jsyaml from 'js-yaml';
import isObject from 'lodash/isPlainObject';
import { isString, isDate, isBoolean, isUndefined, isNull } from 'util';

export const validateField: (type: string, value: any, field?: IField, canBeNull?: boolean) => boolean = (
    type,
    value,
    field,
    canBeNull
) => {
    // If the value can be null an is null
    // immediately return true, no matter what type
    if (canBeNull && isNull(value)) {
        return true;
    }
    // Check individual types
    switch (type) {
        case 'binary':
        case 'string':
        case 'select-string':
        case 'file-string':
        case 'long-string':
            // Strings cannot be empty
            return value !== undefined && value !== null && value !== '';
        case 'mapper-options': {
            if (isObject(value)) {
                return false;
            }
            // Check if every pair has key & value
            // assigned properly
            return value.every(
                (pair: { [key: string]: string }): boolean =>
                    pair.name && pair.name !== '' && validateField(pair.type, pair.value, field)
            );
        }
        case 'array-of-pairs': {
            // Check if every pair has key & value
            // assigned properly
            return value.every(
                (pair: { [key: string]: string }): boolean =>
                    pair[field.fields[0]] !== '' && pair[field.fields[1]] !== ''
            );
        }
        case 'class-connectors': {
            let valid = true;
            // Check if every pair has name, input method and output method
            // assigned properly
            if (
                !value.every(
                    (pair: { [key: string]: string }): boolean =>
                        pair.name !== '' && (pair['input-method'] !== '' || pair['output-method'] !== '')
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
            let valid = true;
            // Check if the fields are not empty
            if (!value.every((pair: { [key: string]: string }): boolean => pair.name && pair.name !== '')) {
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
        case 'float':
        case 'number':
            return !isNaN(value) && isNumber(value);
        case 'select-array':
        case 'array':
        case 'file-tree':
            // Check if there is atleast one value
            // selected
            return value.length !== 0;
        case 'cron':
            // Check if the cron is valid
            return cron.isValidCron(value, { alias: true });
        case 'date':
            // Check if the date is valid
            return (
                value !== undefined && value !== null && value !== '' && new Date(value).toString() !== 'Invalid Date'
            );
        case 'hash':
        case 'hash<auto>': {
            // Get the parsed yaml
            const parsedValue: any = maybeParseYaml(value);
            // If the value is not an object or empty
            if (!parsedValue || !isObject(parsedValue)) {
                return false;
            }
            return true;
        }
        case 'list':
        case 'list<auto>': {
            // Get the parsed yaml
            const parsedValue: any = maybeParseYaml(value);
            // If the value is not an object or empty
            if (!parsedValue || !isArray(parsedValue)) {
                return false;
            }
            return true;
        }
        case 'mapper-code':
            if (!value) {
                return false;
            }
            // Split the value
            const [code, method] = value.split('.');
            // Both fields need to be strings & filled
            return validateField('string', code) && validateField('string', method);
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
        case 'nothing':
            return false;
        default:
            return true;
    }
};

export const maybeParseYaml: (yaml: any) => any = yaml => {
    // If we are dealing with basic boolean
    if (yaml === true || yaml === false) {
        return yaml;
    }
    // Leave numbers as they are
    if (isNumber(yaml)) {
        return yaml;
    }
    // Check if the value isn't empty
    if (yaml === undefined || yaml === null || yaml === '' || !isString(yaml)) {
        return null;
    }
    // Parse the string as yaml
    let yamlCorrect = true;
    let parsedData;
    // Parse the yaml
    try {
        parsedData = jsyaml.safeLoad(yaml);
    } catch (e) {
        yamlCorrect = false;
    }

    if (!yamlCorrect) {
        return null;
    }

    if (parsedData) {
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
    if (new Date(value).toString() !== 'Invalid Date') {
        return 'date';
    }
    if (isObject(value)) {
        return 'hash';
    }
    if (isArray(value)) {
        return 'list';
    }
    if (isNumber(value)) {
        return 'int';
    }
    if (isString(value)) {
        return 'string';
    }

    return 'none';
};
