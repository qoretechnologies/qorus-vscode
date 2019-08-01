export const fillTemplate = (template: string, vars: any): Function => {
    return new Function('return `' + template + '`;').call(vars);
}

export const suffix = {
    java: '.java',
    qore: '',
};

export const comment_chars = {
    java: '//',
    qore: '#',
};

export const default_parse_options = "\
%new-style\n\
%strict-args\n\
%require-types\n\
%enable-all-warnings\n\
";

export const createHeaders = (headers: any): string => {
    const list_indent = '  - ';
    const indent = '    ';
    let result: string = '';

    for (let key in headers) {
        const value = headers[key];
        if (!value) {
            continue;
        }

        const tag = key.replace(/_/g, '-');

        if (Array.isArray(value)) {
            switch (key) {
                case 'groups':
                    result += 'groups:\n';
                    for (let item of value) {
                        result += `${list_indent}${item.name}\n`;
                    }
                    break;
                case 'tags':
                    result += 'tags:\n';
                    for (let item of value) {
                        result += `${indent}${item.key}: ${item.value}\n`;
                    }
                    break;
                case 'define_auth_label':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${indent}${item.label}: ${item.value}\n`;
                    }
                    break;
                case 'author':
                case 'classes':
                case 'constants':
                case 'functions':
                case 'vmaps':
                case 'mappers':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${list_indent}${item.name}\n`;
                    }
                    break;
                case 'resource':
                case 'text_resource':
                case 'bin_resource':
                case 'template':
                    result += `${tag}:\n`;
                    for (let item of value) {
                        result += `${list_indent}${item}\n`;
                    }
                    break;
            }
        }
        else {
            switch (key) {
                case 'orig_name':
                    break;
                default:
                    result += `${tag}: ${value}\n`;
            }
        }
    }

    return result;
};

export const createMethodHeaders = (methods: any): string => {
    const list_indent = '  - ';
    const indent = '    ';
    let result: string = 'methods:\n';

    for (let method of methods) {
        result += `${list_indent}name: ${method.name}\n`
        for (let tag in method) {
            switch (tag) {
                case 'name':
                case 'orig_name':
                    break;
                case 'author':
                    result += `${indent}author:\n`;
                    for (let author of method.author) {
                        result += `${indent}${list_indent}${author.name}\n`;
                    }
                    break;
                default:
                    result += `${indent}${tag}: ${method[tag]}\n`
            }
        }
    }

    return result;
};

export const authorsToArray = (data: any) => {
    if (data.author) {
        const author = data.author.split(',').map(value => ({ name: value.trim() }));
        data.author = author;
    }
    for (const method of data.methods || []) {
        if (method.author) {
            const author = method.author.split(',').map(value => ({ name: value.trim() }));
            method.author = author;
        }
    }
};

export const commonFields = default_target_dir => [
    {
        name: 'target_dir',
        type: 'file-string',
        default_value: default_target_dir,
        get_message: {
            action: 'creator-get-directories',
            object_type: 'target-dir',
        },
        return_message: {
            action: 'creator-return-directories',
            object_type: 'target-dir',
            return_value: 'directories',
        },
    },
    {
        name: 'target_file',
        mandatory: false,
    },
    {
        name: 'name',
    },
    {
        name: 'version',
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
        name: 'modules',
        mandatory: false,
        type: 'array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'module',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'module',
            return_value: 'objects',
        },
    },
    {
        name: 'remote',
        mandatory: false,
        type: 'boolean',
        default_value: true,
    },
    {
        name: 'class_name',
        prefill: 'name',
        style: 'PascalCase',
    },
    {
        name: 'lang',
        type: 'enum',
        items: [
            {
                value: 'qore',
                icon_filename: 'qore-106x128.png',
            },
            {
                value: 'java',
                icon_filename: 'java-96x128.png',
            },
        ],
        default_value: 'qore',
    },
    {
        name: 'classes',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'class',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'class',
            return_value: 'objects',
        },
    },
    {
        name: 'constants',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'constant',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'constant',
            return_value: 'objects',
        },
    },
    {
        name: 'functions',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'function',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'function',
            return_value: 'objects',
        },
    },
    {
        name: 'mappers',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'mapper',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'mapper',
            return_value: 'objects',
        },
    },
    {
        name: 'vmaps',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'value-map',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'value-map',
            return_value: 'objects',
        },
    },
    {
        name: 'groups',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['name', 'desc'],
        get_message: {
            action: 'creator-get-objects',
            object_type: 'group',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'group',
            return_value: 'objects',
        },
    },
    {
        name: 'tags',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['key', 'value'],
        get_message: {
            action: 'creator-get-objects',
            object_type: 'tag',
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'tag',
            return_value: 'objects',
        },
    },
];
