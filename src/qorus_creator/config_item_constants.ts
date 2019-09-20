export const configItemsFileFields = default_target_dir => [
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
    }
];

export const config_item_fields = [
    {
        name: 'name',
    },
    {
        name: 'desc',
    },
    {
        name: 'type',
    },
    {
        name: 'default_value',
        mandatory: false,
        type: 'any',
    },
    {
        name: 'strictly_local',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'config_group',
        mandatory: false,
        default_value: 'Default',
    },
    {
        name: 'allowed_values',
        mandatory: false,
        type: 'array-of-any'
    },
];
