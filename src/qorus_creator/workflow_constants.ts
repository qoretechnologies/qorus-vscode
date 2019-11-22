import { field } from './common_constants';

export const workflowFields = ({is_editing, default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.author,
    field.version,
    {
        ... field.class_name,
        mandatory: false,
        notify_on_add: true,
        notify_on_remove: true,
    },
    field.lang(is_editing),
    field.constants,
    field.functions,
    field.mapper,
    field.vmaps,
    field.modules,
    field.remote,
    field.groups,
    field.tags,
    {
        ...field.classes,
        on_change: undefined,
        notify_on_remove: false,
    },
    {
        name: 'base-class-name',
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
        mandatory: false,
        notify_on_add: true,
        notify_on_remove: true,
    },
    {
        name: 'workflow-autostart',
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
        name: 'keylist',
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
