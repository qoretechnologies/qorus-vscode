import * as os from 'os';
// import { SQLAuthorLen, SQLDescLen, SQLVersionLen, SQLNameLen, SQLPatchLen } from './creator_common';


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


export const service_fields = [
    {
        name: 'target_dir',
        get_message: {
            action: 'get-opening-path',
        },
        return_message: {
            action: 'return-opening-path',
            return_value: 'path'
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
        values: ['qore', 'java'],
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
        type: 'file-tree',
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
        type: 'file-tree',
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
        type: 'file-tree',
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
        type: 'file-tree',
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


export const fake_service_data = {
    target_dir: os.homedir(),
//    target_file: 
    iface_kind: 'service',

    service: 'example-service',
    serviceversion: '1.0',
    servicedesc: 'example service',
    serviceauthor: ['first author', 'second author'],
    lang: 'qore',
    class_name: 'ExampleService',
    base_class_name: 'QorusService',
    classes: ['ExampleClass1', 'ExampleClass2'],
    mappers: ['Mapper1', 'Mapper2', 'Mapper3'],
    remote: true,
    autostart: true,
    groups: [{
        name: 'GROUP1',
        desc: 'example group 1'
    }, {
        name: 'GROUP2',
        desc: 'example group 2'
    }],
    TAG: [{
        key: 'example-code',
        value: 'true'
    }]
};
