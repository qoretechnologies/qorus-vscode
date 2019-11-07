export const workflowFields = ({is_editing, default_target_dir}) => [
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
    },
    {
        name: 'author',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'author',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'author',
            return_value: 'objects',
        },
    },
    {
        name: 'version',
    },
    {
        name: 'class-name',
        prefill: 'name',
        style: 'PascalCase',
        mandatory: false,
        notify_on_add: true,
        notify_on_remove: true,
    },
    {
        name: 'lang',
        type: 'enum',
        items: [
            {
                value: 'qore',
                icon_filename: 'qore-106x128.png',
            },
            {
                value: 'java',
                icon_filename: 'java-96x128.png',
            },
        ],
        default_value: 'qore',
        disabled: is_editing,
    },
    {
        name: 'constants',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'constant',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'constant',
            return_value: 'objects',
        },
    },
    {
        name: 'functions',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'function',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'function',
            return_value: 'objects',
        },
    },
    {
        name: 'mappers',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'mapper',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'mapper',
            return_value: 'objects',
        },
    },
    {
        name: 'vmaps',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'value-map',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'value-map',
            return_value: 'objects',
        },
    },
    {
        name: 'modules',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'module',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'module',
            return_value: 'objects',
        },
    },
    {
        name: 'remote',
        mandatory: false,
        type: 'boolean',
        default_value: true,
    },
    {
        name: 'groups',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'group',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'group',
            return_value: 'objects',
        },
    },
    {
        name: 'tags',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['key', 'value'],
        get_message: {
            action: 'creator-get-objects',
            object_type: 'tag',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'tag',
            return_value: 'objects',
        },
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
        name: 'classes',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'class',
            return_value: 'objects',
        },
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
