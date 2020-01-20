import { field, subclass_template } from './common_constants';

const java_headers = '\
import com.qoretechnologies.qorus.*;\n\
import com.qoretechnologies.qorus.step.*;\n\n';

export const step_template: any = {
    qore: subclass_template.qore,
    java: java_headers + subclass_template.java,
};

export const stepFields = ({default_target_dir, is_editing}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.author,
    field.version,
    field.class_name,
    field.lang(is_editing),
    field.constants,
    field.classes,
    field.functions,
    field.mapper,
    field.vmaps,
    {
        name: 'base-class-name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'step-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'step-base-class',
            return_value: 'objects',
        },
        on_change: ['get-config-items', 'creator-set-fields'],
        notify_on_remove: true
    },
    {
        name: 'event',
        mandatory: false,
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'event',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'event',
            return_value: 'objects',
        },
    },
    {
        name: 'queue',
        mandatory: false,
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'queue',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'queue',
            return_value: 'objects',
        },
    },
];

export const stepTypeHeaders = step_type => {
    switch (step_type) {
        case 'QorusAsyncStep': return {steptype: 'ASYNC'};
        case 'QorusEventStep': return {steptype: 'EVENT'};
        case 'QorusNormalStep': return {steptype: 'NORMAL'};
        case 'QorusSubworkflowStep': return {steptype: 'SUBWORKFLOW'};
        case 'QorusAsyncArrayStep': return {steptype: 'ASYNC', arraytype: 'SERIES'};
        case 'QorusEventArrayStep': return {steptype: 'EVENT', arraytype: 'SERIES'};
        case 'QorusNormalArrayStep': return {steptype: 'NORMAL', arraytype: 'SERIES'};
        case 'QorusSubworkflowArrayStep': return  {steptype: 'SUBWORKFLOW', arraytype: 'SERIES'};
        default: return {};
    }
};
