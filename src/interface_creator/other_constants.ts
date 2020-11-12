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
