import { IField } from '../containers/InterfaceCreator/panel';
const cron = require('cron-validator');
import isNumber from 'lodash/isNumber';
import jsyaml from 'js-yaml';

export const validateField: (type: string, value: any, field: IField) => boolean = (type, value, field) => {
    switch (type) {
        case 'string':
        case 'select-string':
        case 'file-string':
            // Strings cannot be empty
            return value !== null && value !== '';
        case 'array-of-pairs': {
            // Check if every pair has key & value
            // assigned properly
            return value.every(
                (pair: { [key: string]: string }): boolean =>
                    pair[field.fields[0]] !== '' && pair[field.fields[1]] !== ''
            );
        }
        case 'int':
        case 'float':
            return value !== null && value !== '' && isNumber(value);
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
            return value !== null && value !== '' && new Date(value).toString() !== 'Invalid Date';
        case 'hash':
        case 'list':
            // Check if the value isn't empty
            if (value === null || value === '') {
                return false;
            }
            let yamlCorrect;
            // Parse the yaml
            try {
                jsyaml.safeLoad(value);
            } catch (e) {
                yamlCorrect = false;
            }

            return yamlCorrect;
        default:
            return true;
    }
};
