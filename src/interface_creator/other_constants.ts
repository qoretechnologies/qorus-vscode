import { field } from './common_constants';

export const groupFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
];

export const eventFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
];

export const queueFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
];

export const valueMapFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    {
        ... field.desc,
        mandatory: false
    },
    field.author,
    {
        name: 'exception',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    field.groups,
    {
        name: 'valuetype',
        mandatory: false,
        type: 'enum',
        items: [
            { value: 'int' },
            { value: 'string' },
            { value: 'float' },
            { value: 'raw' },
            { value: 'date' },
        ],
        notify_on_remove: true,
        on_change: 'valuetype-changed',
    },
    {
        name: 'dateformat',
        mandatory: false,
        disabled: true,
        default_value: 'YYYY-MM-DD',
    },
    field['value-maps'],
];


export const errorsFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
];

export const error_fields = [
    field.name,
    field.desc,
    {
        name: 'severity',
        mandatory: false,
        type: 'enum',
        items: [
            { value: 'FATAL' },
            { value: 'MAJOR' },
            { value: 'MINOR' },
            { value: 'WARNING' },
            { value: 'INFO' },
            { value: 'NONE' },
        ],
        default_value: 'MAJOR',
    },
    {
        name: 'status',
        mandatory: false,
        type: 'enum',
        items: [
            { value: 'ERROR' },
            { value: 'RETRY' },
        ],
        default_value: 'ERROR',
        notify_on_remove: true,
        on_change: 'error-status-changed',
    },
    {
        name: 'business',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'retry-delay',
        mandatory: false,
        disabled: true,
        type: 'number',
    },
    {
        name: 'level',
        mandatory: false,
        type: 'enum',
        items: [
            { value: 'AUTO' },
            { value: 'GLOBAL' },
            { value: 'WORKFLOW' },
        ],
        default_value: 'AUTO',
    },
];
