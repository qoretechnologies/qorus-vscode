import { commonFields } from './creator_common';


let template: any = {};

template.qore =
"\
class ${this.class_name} inherits ${this.base_class_name} {\n\
    run() {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
";

template.java =
"\
class ${this.class_name} extends ${this.base_class_name} {\n\
    public void run() throws Throwable {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
";

export const job_template = template;

export const defaultJobHeaders = data => {
    switch (data.lang) {
        case 'java': return {
            'active': true,
            'class-name': data.class_name,
        };
        default: return {
            'active': true,
            'class-based': true,
            'class-name': data.class_name,
        };
    }
};

export const jobFields = default_target_dir => [
    ... commonFields(default_target_dir),
    {
        name: 'base_class_name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'job-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'sjobbase-class',
            return_value: 'objects',
        },
    },
    {
        name: 'active',
        mandatory: false,
        type: 'boolean',
        default_value: true,
    },
    {
        name: 'run_skipped',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'single_instance',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'expiry_date',
        mandatory: false,
        type: 'date',
    },
    {
        name: 'schedule',
        mandatory: false,
        type: 'cron',
    },
];
