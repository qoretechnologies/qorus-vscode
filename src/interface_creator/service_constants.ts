import {
    classToPythonModule,
    root_service
} from '../qorus_constants';
import { field } from './common_constants';

export const serviceImports = (lang: string, base_class_name: string) => {
    switch (lang) {
        case 'python':
            // FIXME: we need to know the language of the base class to generate the import statement correctly
            // here we just assume Qore for now
            return base_class_name === root_service
                ? [`from ${classToPythonModule(root_service)} import ${base_class_name}`]
                : [`from qore.__root__ import ${base_class_name}`];
        case 'java':
            return [
                'import qore.OMQ.*;',
                'import qore.OMQ.UserApi.*;',
                'import qore.OMQ.UserApi.Service.*;'
            ];
        default:
            return [];
    }
};

export const serviceFields = ({ default_target_dir = undefined, lang = undefined, limited_editing = undefined }): any[] => [
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
        notify_on_add: true,
        notify_on_remove: true,
        on_change: 'stateless-changed',
    },
    {
        name: 'scaling-min-replicas',
        mandatory: false,
        disabled: true,
        type: 'number',
        default_value: 1,
    },
    {
        name: 'scaling-max-replicas',
        mandatory: false,
        disabled: true,
        type: 'number',
        default_value: 3,
    },
    {
        name: 'scaling-cpu',
        mandatory: false,
        disabled: true,
        type: 'number',
        default_value: 80,
    },
    {
        name: 'scaling-memory',
        mandatory: false,
        disabled: true,
        default_value: lang === 'java' ? '1600Mi' : '800Mi',
    },
    {
        name: 'container-memory-request',
        mandatory: false,
        disabled: true,
        default_value: lang === 'java' ? '600Mi' : '300Mi',
    },
    {
        name: 'container-memory-limit',
        mandatory: false,
        disabled: true,
        default_value: lang === 'java' ? '2Gi' : '1Gi',
    },
    {
        name: 'container-cpu-request',
        mandatory: false,
        disabled: true,
        type: 'float',
        default_value: 0.2,
    },
    {
        name: 'container-cpu-limit',
        mandatory: false,
        disabled: true,
        type: 'float',
        default_value: 4.0,
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
