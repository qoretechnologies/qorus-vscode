import * as os from 'os';

export const service_template =
"\
class ${this.class_name} inherits ${this.inherits} {\n\
    init() {\n\
    }\n\
}\n\
";


export const default_service_headers = {
    'class-based': true,
    'parse-options': ['PO_NEW_STYLE', 'PO_STRICT_ARGS', 'PO_REQUIRE_TYPES'],
};


export const fake_service_data = {
    target_path: os.homedir(),
    iface_kind: 'service',
    class_name: 'ExampleService',
    inherits: 'QorusService',
    headers: {
        service: 'example-service',
        serviceversion: '1.0',
        servicedesc: 'example service',
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
