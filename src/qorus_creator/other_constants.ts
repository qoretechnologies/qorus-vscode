const types = ['Group', 'Event', 'Queue'];

export const otherFields = ({default_target_dir}) => [
    {
        name: 'target_dir',
        type: 'file-string',
        default_value: default_target_dir,
        get_message: {
            action: 'creator-get-directories',
            object_type: 'target_dir',
        },
        return_message: {
            action: 'creator-return-directories',
            object_type: 'target_dir',
            return_value: 'directories',
        },
    },
    {
        name: 'target_file',
        mandatory: false,
    },
    {
        name: 'name',
    },
    {
        name: 'desc',
        mandatory: false,
        type: 'long-string',
        markdown: true
    },
    {
        name: 'type',
        type: 'enum',
        items: types.map(type => ({value: type})),
        default_value: 'Group'
    },
];
