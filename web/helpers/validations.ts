import { IField } from '../containers/InterfaceCreator/panel';
const cron = require('cron-validator');

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
        default:
            return true;
    }
};
