import * as os from 'os';
import { SQLAuthorLen, SQLDescLen, SQLVersionLen, SQLNameLen, SQLPatchLen } from './creator_common';


export const service_template =
"\
class ${this.class_name} inherits ${this.inherits} {\n\
    init() {\n\
    }\n\
}\n\
";


export const defaultServiceHeaders = data => ({
    'class-based': true,
    'class-name': data.class_name,
    'parse-options': ['PO_NEW_STYLE', 'PO_STRICT_ARGS', 'PO_REQUIRE_TYPES'],
});


// default - mandatory: true, type: string
export const service_fields = {
    target_path: {},
    class_name: {maxlen: SQLNameLen},
    inherits: {},

    name: {maxlen: SQLNameLen},
    desc: {maxlen: SQLDescLen, type: 'array'},
    version: {maxlen: SQLVersionLen},
    author: {maxlen: SQLAuthorLen, type: 'array'},
    lang: {maxlen: 80, type: 'enum', values: ["qore", "java"], default_value: "qore"},
    constants: {type: 'array', mandatory: false},
    classes: {type: 'array', mandatory: false},
    functions: {type: 'array', mandatory: false},
    groups: {type: 'array', mandatory: false},
//    'class-name': {maxlen: SQLNameLen},
    lock: {mandatory: false},
    internal: {type: 'boolean'},
    write: {type: 'boolean', mandatory: false},
   'import-code': {mandatory: false},
    servicetype: {mandatory: false},
    service: {maxlen: SQLNameLen},
    servicepatch: {maxlen: SQLPatchLen, mandatory: false},
    mappers: {type: 'array', mandatory: false},
    vmaps: {type: 'array', mandatory: false},
    resource: {type: 'array', mandatory: false},
    'text-resource': {type: 'array', mandatory: false},
    'bin-resource': {type: 'array', mandatory: false},
    template: {type: 'array', mandatory: false},
    autostart: {type: 'boolean'},
    remote: {type: 'boolean'},
    'parse-options': {mandatory: false},
    'service-modules': {type: 'array'},
    'define-auth': {mandatory: false},
    'define-auth-label': {mandatory: false},
};


export const fake_service_data = {
    target_path: os.homedir(),
    iface_kind: 'service',
    class_name: 'ExampleService',
    inherits: 'QorusService',
    headers: {
        service: 'example-service',
        version: '1.0',
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
