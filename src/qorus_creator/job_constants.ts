import { commonFields4 } from './common_constants';

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

export const jobFields = params => [
    ... commonFields4(params),
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
