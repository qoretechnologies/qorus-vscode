import { IField } from '../containers/InterfaceCreator/panel';
const cron = require('cron-validator');
import isNumber from 'lodash/isNumber';
import isNaN from 'lodash/isNaN';
import uniqWith from 'lodash/uniqWith';
import size from 'lodash/size';
import jsyaml from 'js-yaml';
import isObject from 'lodash/isPlainObject';

export const validateField: (type: string, value: any, field?: IField) => boolean = (type, value, field) => {
    switch (type) {
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
        case 'hash<auto>':
        case 'list':
        case 'list<auto>':
            // Check if the value isn't empty
            if (value === undefined || value === null || value === '') {
                return false;
            }
            let yamlCorrect = true;
            // Parse the yaml
            try {
                jsyaml.safeLoad(value);
            } catch (e) {
                yamlCorrect = false;
            }

            return yamlCorrect;
        case 'mapper-code':
            if (!value) {
                return false;
            }
            // Split the value
            const [code, method] = value.split('.');
            // Both fields need to be strings & filled
            return validateField('string', code) && validateField('string', method);
        default:
            return true;
    }
};
