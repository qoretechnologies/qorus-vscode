import { comment_chars, commonFields } from './creator_common';

let class_template: any = {};
let method_template: any = {};

class_template.qore = '\
class ${this.class_name} inherits ${this.base_class_name} {\n\
${this.methods}\
}\n\
';

class_template.java = '\
class ${this.class_name} extends ${this.base_class_name} {\n\
${this.methods}\
}\n\
';

method_template.qore = '\
    ${this.name}() {\n\
    }\n\
';

method_template.java = '\
    public void ${this.name}() {\n\
    }\n\
';

export const service_class_template = class_template;
export const service_method_template = method_template;

export const serviceFields = default_target_dir => [
    ... commonFields(default_target_dir),
    {
        name: 'base_class_name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'service-base-class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'service-base-class',
            return_value: 'objects',
        },
    },
    {
        name: 'autostart',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'resource',
            return_value: 'resources',
        },
    },
    {
        name: 'text_resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'text-resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'text-resource',
            return_value: 'resources',
        },
    },
    {
        name: 'bin_resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'bin-resource',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'bin-resource',
            return_value: 'resources',
        },
    },
    {
        name: 'template',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'template',
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'template',
            return_value: 'resources',
        },
    },
    {
        name: 'define_auth_label',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['label', 'value'],
    },
];

export const service_methods = [
    {
        name: 'name',
    },
    {
        name: 'desc',
    },
    {
        name: 'author',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'author',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'author',
            return_value: 'objects',
        },
    },
    {
        name: 'lock',
        mandatory: false,
        default_value: 'none',
    },
    {
        name: 'write',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
    {
        name: 'internal',
        mandatory: false,
        type: 'boolean',
        default_value: false,
    },
];

export const defaultOldServiceHeaders = data => {
    switch (data.lang) {
        case 'java':
            return {
                'class-name': data.class_name,
            };
        default:
            return {
                'class-based': true,
                'class-name': data.class_name,
                'parse-options': ['PO_NEW_STYLE', 'PO_STRICT_ARGS', 'PO_REQUIRE_TYPES'],
            };
    }
};

export const createOldServiceHeaders = (headers: any, lang: string = 'qore'): string => {
    let result: string = '';

    let comment: string = comment_chars[lang];

    for (let key in headers) {
        const value = headers[key];
        if (!value) {
            continue;
        }

        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            switch (key) {
                case 'groups':
                    let names: string[] = [];
                    for (let item of value) {
                        names.push(item.name);
                        result += `${comment} define-group: ${item.name}: ${item.desc}\n`;
                    }
                    result += `${comment} groups: ${names.join(', ')}\n`;
                    break;
                case 'define_auth_label':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item.label}=${item.value}\n`;
                    }
                    break;
                case 'tags':
                    for (let item of value) {
                        result += `${comment} TAG: ${item.key}: ${item.value}\n`;
                    }
                    break;
                case 'author':
                    for (let item of value) {
                        result += `${comment} serviceauthor: ${item.name}\n`;
                    }
                    break;
                case 'resource':
                case 'text_resource':
                case 'bin_resource':
                case 'template':
                    for (let item of value) {
                        result += `${comment} ${tag}: ${item}\n`;
                    }
                    break;
                case 'classes':
                case 'constants':
                case 'functions':
                case 'vmaps':
                case 'mappers':
                    result += `${comment} ${tag}: `;
                    let separator = '';
                    for (let item of value) {
                        result += `${separator}${item.name}`;
                        separator = ', ';
                    }
                    result += '\n';
                    break;
                default:
                    result += `${comment} ${tag}: ${value.join(', ')}\n`;
            }
        } else {
            switch (key) {
                case 'name':
                    result += `${comment} service: ${value}`;
                    break;
                case 'desc':
                    result += `${comment} servicedesc: ${value}`;
                    break;
                case 'version':
                    result += `${comment} serviceversion: ${value}`;
                    break;
                default:
                    result += `${comment} ${tag}: ${value}`;
            }
            result += '\n';
        }
    }

    return result;
};
