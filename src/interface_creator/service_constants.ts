import {
    classToPythonModule,
    root_service
} from '../qorus_constants';
import { field } from './common_constants';

export const serviceImports = (lang: string, base_class_name: string) => {
    switch (lang) {
        case 'python':
            return base_class_name === root_service
                ? [`from ${classToPythonModule(root_service)} import ${base_class_name}`]
                : [];
        case 'java':
            return ['import com.qoretechnologies.qorus.*;', 'import com.qoretechnologies.qorus.service.*;'];
        default:
            return [];
    }
};

export const serviceFields = ({ default_target_dir, limited_editing }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.author,
    field.version,
    {
        ... field.class_name,
        disabled: limited_editing,
    },
    field.lang,
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
        on_change: 'get-config-items',
        disabled: limited_editing,
    },
    {
        name: 'service-autostart',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'stateless',
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
    },
    {
        name: 'fsm',
        mandatory: false,
        type: 'fsm-list',
        reference: {
            iface_kind: 'fsm',
        },
    },
    {
        name: 'system-options',
        type: 'options',
        url: 'system',
        mandatory: false,
    }
];

export const serviceMethodFields = ({ limited_editing }) => [
    {
        ...field.name,
        type: 'method-name',
        has_to_be_valid_identifier: true,
        disabled: limited_editing,
    },
    field.desc,
    field.author,
    {
        name: 'lock',
        type: 'enum',
        items: [{ value: 'none' }, { value: 'read' }, { value: 'write' }],
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
