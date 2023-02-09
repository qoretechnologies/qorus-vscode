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
    ...field.desc,
    mandatory: false,
  },
  field.author,
  {
    name: 'exception',
    mandatory: false,
    type: 'boolean',
    default_value: false,
    group: 'info',
    compact: true,
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
    group: 'resources',
    compact: true,
  },
  {
    name: 'dateformat',
    mandatory: false,
    disabled: true,
    default_value: 'YYYY-MM-DD',
    group: 'info',
    compact: true,
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
    group: 'info',
    compact: true,
  },
  {
    name: 'status',
    mandatory: false,
    type: 'enum',
    items: [{ value: 'ERROR' }, { value: 'RETRY' }],
    default_value: 'ERROR',
    notify_on_remove: true,
    on_change: 'error-status-changed',
    group: 'info',
    compact: true,
  },
  {
    name: 'business',
    mandatory: false,
    type: 'boolean',
    default_value: false,
    group: 'info',
    compact: true,
  },
  {
    name: 'retry-delay',
    mandatory: false,
    disabled: true,
    type: 'number',
    group: 'info',
    compact: true,
  },
  {
    name: 'level',
    mandatory: false,
    type: 'enum',
    items: [{ value: 'AUTO' }, { value: 'GLOBAL' }, { value: 'WORKFLOW' }],
    default_value: 'AUTO',
    group: 'info',
    compact: true,
  },
];
