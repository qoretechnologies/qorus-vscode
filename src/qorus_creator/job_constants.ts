import { field } from './common_constants';

export const job_imports = {
    qore: [],
    python: [],
    java: [
        'import com.qoretechnologies.qorus.*;',
        'import com.qoretechnologies.qorus.job.*;'
    ]
};

export const jobFields = ({default_target_dir, is_editing}) => [
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
            object_type: 'job-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'job-base-class',
            return_value: 'objects',
        },
        on_change: 'get-config-items'
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
    }
];
