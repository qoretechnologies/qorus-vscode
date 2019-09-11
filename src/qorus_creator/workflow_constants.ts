import { commonFields } from './common_constants';

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
        mandatory: false,
        default_value: 1,
    },
    {
        name: 'sla_threshold',
        type: 'number',
        mandatory: false,
        default_value: 1800,
    },
    {
        name: 'max_instances',
        type: 'number',
        mandatory: false,
    },
    {
        name: 'attach',
        mandatory: false,
    },
    {
        name: 'detach',
        mandatory: false,
    },
    {
        name: 'onetimeinit',
        mandatory: false,
    },
    {
        name: 'error_handler',
        mandatory: false,
    },
    {
        name: 'errorfunction',
        mandatory: false,
    },
    {
        name: 'options',
        type: 'array-of-pairs',
        fields: ['key', 'value'],
        mandatory: false,
    },
    {
        name: 'key_list',
        type: 'array',
        mandatory: false,
    },
    {
        name: 'statuses',
        type: 'array-of-pairs',
        fields: ['code', 'desc'],
        mandatory: false,
    },
];
