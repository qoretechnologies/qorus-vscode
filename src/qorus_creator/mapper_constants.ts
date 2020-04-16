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
    public static Object ${this.name}(Object ctx, Map<String, Object> record) {\n\
    }\n\
';

export const mapperCodeTemplates = lang => ({
    template: class_template[lang],
    method_template: method_template[lang]
});

export const mapper_code_class_template = class_template;
export const mapper_code_method_template = method_template;

export const mapperFields = ({ default_target_dir, context }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    field.name,
    field.desc,
    field.version,
    {
        name: 'mappertype',
        default_value: 'Mapper',
        read_only: true,
    },
    {
        name: 'mapper_options',
        type: 'mapper-options',
        mandatory: false,
        requires_fields: 'mappertype',
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
        reference: {
            iface_kind: 'mapper-code',
        },
    },
    field.classes,
    {
        name: 'context',
        type: 'context-selector',
        default_value: context,
        mandatory: !!context,
        disabled: !!context,
    },
];

export const mapperCodeFields = ({ default_target_dir, is_editing }) => [
    field.targetDir(default_target_dir),
    field.targetFile,
    {
        name: 'class-class-name',
    },
    field.version,
    {
        ...field.desc,
        mandatory: false,
    },
    {
        ...field.lang(is_editing),
        mandatory: false,
    },
    field.author,
];

export const mapper_method_fields = [field.name, field.desc];
