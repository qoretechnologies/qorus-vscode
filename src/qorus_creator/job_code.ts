import * as os from 'os';

export const job_template =
"\
class ${this.class_name} inherits ${this.inherits} {\n\
    run() {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
";


export const defaultJobHeaders = data => ({
    'active': true,
    'class-name': data.class_name,
    'class-based': true,
});


export const default_job_parse_options = "\
%new-style\n\
%require-types\n\
%strict-args\n\
%enable-all-warnings\n\
";


export const fake_job_data = {
    target_path: os.homedir(),
    iface_kind: 'job',
    class_name: 'ExampleJob',
    inherits: 'QorusJob',
    headers: {
        name: 'example-job',
        version: '1.0',
        desc: 'example job',
        groups: [{
            name: 'GROUP1',
            desc: 'example group 1'
        }, {
            name: 'GROUP2',
            desc: 'example group 2'
        }]
    }
}
