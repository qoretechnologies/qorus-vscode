import { field } from './common_constants';

export const service_imports = {
    java: [
        'import com.qoretechnologies.qorus.*;',
        'import com.qoretechnologies.qorus.service.*;'
    ]
};

export const serviceFields = ({default_target_dir, is_editing}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.author,
    field.version,
    field.class_name,
    field.lang(is_editing),
    field.constants,
    field.functions,
    field.mappers,
    field.vmaps,
    field.modules,
    field.remote,
    field.groups,
    field.tags,
    field.classes,
    {
        name: 'base-class-name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'service-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'service-base-class',
            return_value: 'objects',
        },
        on_change: 'get-config-items'
    },
    {
        name: 'service-autostart',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'resource',
            return_value: 'resources',
        },
    },
    {
        name: 'text-resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'text-resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'text-resource',
            return_value: 'resources',
        },
    },
    {
        name: 'bin-resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'bin-resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'bin-resource',
            return_value: 'resources',
        },
    },
    {
        name: 'template',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'template',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'template',
            return_value: 'resources',
        },
    }
];

export const service_methods = [
    {
        ...field.name,
        type: 'method-name',
        has_to_be_valid_identifier: true,
    },
    field.desc,
    field.author,
    {
        name: 'lock',
        type: 'enum',
        items: [
            {value: 'none'},
            {value: 'read'},
            {value: 'write'}
        ],
        mandatory: false,
        default_value: 'none',
    },
    {
        name: 'write',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'internal',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
];
