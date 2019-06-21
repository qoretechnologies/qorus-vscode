let template: any = {};

template.qore =
"\
class ${this.class_name} inherits ${this.base_class_name} {\n\
    init() {\n\
    }\n\
}\n\
";

template.java =
"\
class ${this.class_name} extends ${this.base_class_name} {\n\
    public void init() {\n\
    }\n\
}\n\
";

export const service_template = template;


export const defaultServiceHeaders = data => {
    switch (data.lang) {
        case 'java': return {
            'class-name': data.class_name,
        };
        default: return {
            'class-based': true,
            'class-name': data.class_name,
            'parse-options': ['PO_NEW_STYLE', 'PO_STRICT_ARGS', 'PO_REQUIRE_TYPES'],
        };
    }
};


export const serviceFields = default_target_dir => [
    {
        name: 'target_dir',
        type: 'file-string',
        default_value: default_target_dir,
        get_message: {
            action: 'creator-get-directories',
            object_type: 'target-dir'
        },
        return_message: {
            action: 'creator-return-directories',
            object_type: 'target-dir',
            return_value: 'directories',
        }
    },
    {
        name: 'target_file'
    },
    {
        name: 'base_class_name',
        type: 'select-string',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'base-class'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'base-class',
            return_value: 'objects'
        }
    },
    {
        name: 'service'
    },
    {
        name: 'serviceversion'
    },
    {
        name: 'servicedesc'
    },
    {
        name: 'serviceauthor',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'author'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'author',
            return_value: 'objects'
        }
    },
    {
        name: 'lang',
        type: 'enum',
        items: [
            {
                value: 'qore',
                icon_filename: 'qore-106x128.png'
            },
            {
                value: 'java',
                icon_filename: 'java-96x128.png'
            }
        ],
        default_value: 'qore'
    },
    {
        name: 'class_name',
        prefill: 'service',
        style: 'PascalCase'
    },
    {
        name: 'remote',
        mandatory: false,
        type: 'boolean'
    },
    {
        name: 'groups',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['name', 'desc']
    },
    {
        name: 'constants',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'constant'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'constant',
            return_value: 'objects'
        }
    },
    {
        name: 'classes',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'class'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'class',
            return_value: 'objects'
        }
    },
    {
        name: 'functions',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'function'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'function',
            return_value: 'objects'
        }
    },
    {
        name: 'service_modules',
        mandatory: false,
        type: 'array'
    },
    {
        name: 'autostart',
        mandatory: false,
        type: 'boolean'
    },
    {
        name: 'mappers',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'mapper'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'mapper',
            return_value: 'objects'
        }
    },
    {
        name: 'vmaps',
        mandatory: false,
        type: 'select-array',
        get_message: {
            action: 'creator-get-objects',
            object_type: 'value-map'
        },
        return_message: {
            action: 'creator-return-objects',
            object_type: 'value-map',
            return_value: 'objects'
        }
    },
    {
        name: 'resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'resource'
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'resource',
            return_value: 'resources'
        }
    },
    {
        name: 'text_resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'text-resource'
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'text-resource',
            return_value: 'resources'
        }
    },
    {
        name: 'bin_resource',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'bin-resource'
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'bin-resource',
            return_value: 'resources'
        }
    },
    {
        name: 'template',
        mandatory: false,
        type: 'file-array',
        get_message: {
            action: 'creator-get-resources',
            object_type: 'template'
        },
        return_message: {
            action: 'creator-return-resources',
            object_type: 'template',
            return_value: 'resources'
        }
    },
    {
        name: 'define_auth_label',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['label', 'value']
    },
    {
        name: 'TAG',
        mandatory: false,
        type: 'array-of-pairs',
        fields: ['key', 'value']
    },
];


export const service_methods = [
    {
        name: 'name'
    },
    {
        name: 'desc'
    },
    {
        name: 'author',
        mandatory: false,
        type: 'select-array'
    },
    {
        name: 'lock',
        mandatory: false
    },
    {
        name: 'write',
        mandatory: false,
        type: 'boolean'
    },
    {
        name: 'intenal',
        mandatory: false,
        type: 'boolean'
    }
];
