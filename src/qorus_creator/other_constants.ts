import { field } from './common_constants';

const types = ['Group', 'Event', 'Queue'];

export const otherFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    {
        ...field.desc,
        mandatory: false,
    },
    {
        name: 'type',
        type: 'enum',
        items: types.map(type => ({value: type})),
        default_value: 'Group'
    },
];
