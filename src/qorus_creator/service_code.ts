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


export const service_fields = {
    service:            {mandatory: true,  type: 'string'},
    serviceversion:     {mandatory: true,  type: 'string'},
    servicedesc:        {mandatory: true,  type: 'string'},
    'class-name':       {mandatory: true,  type: 'string'},
    patch:              {mandatory: false, type: 'string'},
    remote:             {mandatory: false, type: 'boolean'},
    author:             {mandatory: false, type: 'array'},
    groups:             {mandatory: false, type: 'array-of-pairs'},
    constants:          {mandatory: false, type: 'array'},
    classes:            {mandatory: false, type: 'array'},
    functions:          {mandatory: false, type: 'array'},
    'service-modules':  {mandatory: false, type: 'array'},
    lock:               {mandatory: false, type: 'string'},
    autostart:          {mandatory: false, type: 'boolean'},
    internal:           {mandatory: false, type: 'boolean'},
    write:              {mandatory: false, type: 'boolean'},
    mappers:            {mandatory: false, type: 'array'},
    vmaps:              {mandatory: false, type: 'array'},
    resource:           {mandatory: false, type: 'array'},
    'text-resource':    {mandatory: false, type: 'array'},
    'bin-resource':     {mandatory: false, type: 'array'},
    template:           {mandatory: false, type: 'array'},
    'define-auth-label':{mandatory: false, type: 'array-of-pairs'},
    TAG:                {mandatory: false, type: 'array-of-pairs'},
};


export const fake_service_data = {
    target_dir: os.homedir(),
//    target_file: 
    iface_kind: 'service',
    lang: 'java',
    class_name: 'ExampleService',
    base_class_name: 'QorusService',

    service: 'example-service',
    serviceversion: '1.0',
    desc: 'example service',
    classes: ['ExampleClass1', 'ExampleClass2'],
    groups: [{
        name: 'GROUP1',
        desc: 'example group 1'
    }, {
        name: 'GROUP2',
        desc: 'example group 2'
    }]
}

/*

??? attrib

public const ServiceTags = {
    "define-group": {"list": True},
    "groups": {"mandatory": False},
    "constants": {"list": True, "mandatory": False},
    "classes": {"list": True, "mandatory": False},
    "functions": {"list": True, "mandatory": False},
    "author": {"maxlen": SQLAuthorLen, "multi": ", ", "attrib": True},
    "desc": {"maxlen": SQLDescLen, "multi": " ", "warn": True},
    "version": {"mandatory": True, "attrib": True, "maxlen": SQLVersionLen},
    "name": {"maxlen": SQLNameLen},
    "lang": {"maxlen": 80, "values": ("qore", "java"), "default": "qore"}
    "class-based": {"type": Type::Boolean, "default": False},
    "class-name": {"maxlen": SQLNameLen},

    "lock": {"mandatory": False},
    "internal": {"type": Type::Boolean},
    "write": {"type": Type::Boolean},
    "import-code": {"mandatory": False},
    "servicetype": {"mandatory": False},
    "service": {"maxlen": SQLNameLen},
    "servicedesc": {"multi": " ", "maxlen": SQLDescLen},                             ???
    "serviceauthor": {"multi": ", ", "maxlen": SQLAuthorLen, "attrib": True},        ???
    "servicepatch": {"maxlen": SQLPatchLen, "attrib": True},
    "serviceversion": {"attrib": True, "maxlen": SQLVersionLen},                     ???
    "mappers": {"list": True, "mandatory": False},
    "vmaps": {"list": True, "mandatory": False},
    "resource": {"list": True, "mandatory": False},
    "text-resource": {"list": True, "mandatory": False},
    "bin-resource": {"list": True, "mandatory": False},
    "template": {"list": True, "mandatory": False},
    "autostart": {"type": Type::Boolean},
    "remote": {"type": Type::Boolean},
    "parse-options": {"mandatory": False},
    "service-modules": {"list": True,},
    "define-auth": ("mandatory": False),
    "define-auth-label": ("mandatory": False),
};
*/
