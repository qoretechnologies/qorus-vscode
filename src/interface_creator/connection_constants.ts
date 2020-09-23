import { field } from './common_constants';

export const connectionFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    {
        name: 'url',
    },
    {
        name: 'connection_options',
        type: 'options',
        mandatory: false,
    },
];
