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

export const errorsFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    {
        name: 'errors',
        type: 'array-of-error',
    }
];

export const errorFields = () => [
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
        type: 'integer',
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
