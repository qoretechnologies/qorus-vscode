export const fillTemplate = (template: string,
                             lang: string,
                             add_default_parse_options: boolean,
                             vars: any): string =>
    (add_default_parse_options && lang === 'qore' ? default_parse_options : '')
        + new Function('return `' + template[lang] + '`;').call(vars);

export const lang_suffix = {
    java: '.java',
    qore: '',
};

export const comment_chars = {
    java: '//',
    qore: '#',
};

const default_parse_options = "\
%new-style\n\
%strict-args\n\
%require-types\n\
%enable-all-warnings\n\n\
";

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
