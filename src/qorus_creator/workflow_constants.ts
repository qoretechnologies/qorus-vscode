import { field, subclass_template } from './common_constants';

const java_headers = '\
import com.qoretechnologies.qorus.*;\n\
import com.qoretechnologies.qorus.workflow.*;\n\n';

export const workflow_template: any = {
    qore: subclass_template.qore,
    java: java_headers + subclass_template.java,
};

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
    {
        ...field.lang(is_editing),
        mandatory: false,
        notify_on_add: true,
        notify_on_remove: true,
    },
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
        on_change: 'get-config-items',
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
    field.workflow_options,
    {
        name: 'keylist',
        type: 'array',
        mandatory: false,
    },
    field.statuses,
];
