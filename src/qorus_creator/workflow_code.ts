import { commonFields } from './creator_common';


export const workflowFields = default_target_dir => [
    ... commonFields(default_target_dir),
    {
        name: 'base_class_name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'workflow-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'workflow-base-class',
            return_value: 'objects',
        },
    },
    {
        name: 'workflow_autostart',
        type: 'number',
        default_value: 1,
    },
    {
        name: 'sla_threshold',
        type: 'number',
        default_value: 1800,
    },
    {
        name: 'max_instances',
        type: 'number',
    },
    {
        name: 'attach',
    },
    {
        name: 'detach',
    },
    {
        name: 'onetimeinit',
    },
    {
        name: 'error_handler',
    },
    {
        name: 'errorfunction',
    },
    {
        name: 'options',
        type: 'array-of-pairs',
        fields: ['key', 'value'],
    },
    {
        name: 'key_list',
        type: 'array',
    },
    {
        name: 'statuses',
        type: 'array-of-pairs',
        fields: ['code', 'desc'],
    },
];
