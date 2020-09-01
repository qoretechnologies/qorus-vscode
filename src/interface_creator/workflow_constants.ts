import { root_workflow, classToPythonModule } from '../qorus_constants';
import { field } from './common_constants';

export const workflowImports = (lang: string, base_class_name: string) => {
    switch (lang) {
        case 'python':
            return base_class_name === root_workflow
                ? [ `from ${classToPythonModule(root_workflow)} import ${base_class_name}` ]
                : [];
        case 'java':
            return [
                'import com.qoretechnologies.qorus.*;',
                'import com.qoretechnologies.qorus.workflow.*;'
            ];
        default:
            return [];
    }
};

export const workflowFields = ({ default_target_dir}) => [
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
    {
        ...field.lang,
        mandatory: false,
        notify_on_add: true,
        notify_on_remove: true,
    },
    field.constants,
    field.functions,
    field.mappers,
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
        name: 'staticdata-type',
        type: 'type-selector',
        mandatory: false,
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
    field.workflow_options,
    {
        name: 'keylist',
        type: 'array',
        mandatory: false,
    },
    field.statuses,
    {
        name: 'system-options',
        type: 'system-options',
        mandatory: false,
    }
];
