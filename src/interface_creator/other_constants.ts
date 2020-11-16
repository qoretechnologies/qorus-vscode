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
    {
        name: 'value-maps',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['key', 'value'],
    },
];
