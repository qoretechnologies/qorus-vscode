import { classFields } from './common_constants';

let template: any = {};

template.qore =
"\
class ${this.class_name} inherits ${this.base_class_name} {\n\
}\n\
";

template.java =
"\
class ${this.class_name} extends ${this.base_class_name} {\n\
}\n\
";

export const step_template = template;

export const stepFields = default_target_dir => [
    ... classFields(default_target_dir),
    {
        name: 'base_class_name',
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
    }
];
