import { commonFields } from './common_constants';

let template: any = {};

template.qore = '\
class ${this.class_name} inherits ${this.base_class_name} {\n\
    run() {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
';

template.java = '\
class ${this.class_name} extends ${this.base_class_name} {\n\
    public void run() throws Throwable {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
';

export const job_template = template;

export const jobFields = default_target_dir => [
    ... commonFields(default_target_dir),
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
    },
    {
        name: 'config_target_dir',
        mandatory: false,
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
        name: 'config_target_file',
        mandatory: false,
    }
];
