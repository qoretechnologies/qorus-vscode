import { field } from './common_constants';

let class_template: any = {};
let method_template: any = {};

class_template.qore = '\
class ${this.class_name} {\n\
${this.methods}\
}\n\
';

class_template.java = '\
class ${this.class_name} {\n\
${this.methods}\
}\n\
';

method_template.qore = '\
    static auto ${this.name}(auto ctx, hash<auto> record) {\n\
    }\n\
';

method_template.java = '\
    public static void ${this.name}() {\n\
    }\n\
';

export const mapper_code_class_template = class_template;
export const mapper_code_method_template = method_template;

export const mapperFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.version,
    {
        name: 'mappertype',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'mapper-type',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'mapper-type',
            return_value: 'objects',
        },
    },
    {
        name: 'options',
        type: 'mapper-options',
        requires_fields: 'mappertype'
    },
    field.author,
    {
        name: 'codes',
        type: 'select-array',
        mandatory: false,
        get_message: {
            action: 'creator-get-objects',
            object_type: 'mapper-code',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'mapper-code',
            return_value: 'objects',
        },
    },
    field.classes,
];

export const mapperCodeFields = ({default_target_dir}) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.version,
    {
        ...field.desc,
        mandatory: false,
    },
    field.class_name,
    field.author,
];

export const mapper_method_fields = [
    field.name,
    field.desc,
];
