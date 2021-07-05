import {
    classToPythonModule,
    root_job
} from '../qorus_constants';
import { field } from './common_constants';

export const jobImports = (lang: string, base_class_name: string) => {
    switch (lang) {
        case 'python':
            // FIXME: we need to know the language of the base class to generate the import statement correctly
            // here we just assume Qore for now
            return base_class_name === root_job
                ? [`from ${classToPythonModule(root_job)} import ${base_class_name}`]
                : [`from qore.__root__ import ${base_class_name}`];
        case 'java':
            return ['import com.qoretechnologies.qorus.*;', 'import com.qoretechnologies.qorus.job.*;'];
        default:
            return [];
    }
};

export const jobFields = ({ default_target_dir, limited_editing }) => [
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
            object_type: 'job-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'job-base-class',
            return_value: 'objects',
        },
        on_change: 'get-config-items',
        disabled: limited_editing,
    },
    {
        name: 'active',
        mandatory: false,
        type: 'boolean',
        default_value: true,
    },
    {
        name: 'run-skipped',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'single-instance',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'expiry-date',
        mandatory: false,
        type: 'date',
    },
    {
        name: 'schedule',
        type: 'cron',
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
