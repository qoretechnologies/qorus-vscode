import {
    classToPythonModule,
    root_job
} from '../qorus_constants';
import { field } from './common_constants';

export const jobImports = (lang: string, base_class_name: string) => {
    switch (lang) {
        case 'python':
            return base_class_name === root_job
                ? [`from ${classToPythonModule(root_job)} import ${base_class_name}`]
                : [];
        case 'java':
            return ['import com.qoretechnologies.qorus.*;', 'import com.qoretechnologies.qorus.job.*;'];
        default:
            return [];
    }
};

export const jobFields = ({ default_target_dir }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.author,
    field.version,
    field.class_name,
    field.lang,
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
            object_type: 'job-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'job-base-class',
            return_value: 'objects',
        },
        on_change: 'get-config-items',
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
        type: 'system-options',
        mandatory: false,
    }
];
