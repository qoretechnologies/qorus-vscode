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
