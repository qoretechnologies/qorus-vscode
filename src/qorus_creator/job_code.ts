import * as os from 'os';


let template: any = {};

template.qore =
"\
class ${this.class_name} inherits ${this.base_class_name} {\n\
    run() {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
";

template.java =
"\
class ${this.class_name} extends ${this.base_class_name} {\n\
    public void run() throws Throwable {\n\
        log(LL_INFO, \"job info: %y\", getInfo());\n\
    }\n\
}\n\
";

export const job_template = template;


export const defaultJobHeaders = data => {
    switch (data.lang) {
        case 'java': return {
            'active': true,
            'class-name': data.class_name,
        };
        default: return {
            'active': true,
            'class-based': true,
            'class-name': data.class_name,
        };
    }
};


export const default_job_parse_options = "\
%new-style\n\
%require-types\n\
%strict-args\n\
%enable-all-warnings\n\
";


export const job_fields = {
    name:               {mandatory: true,  type: 'string'},
    version:            {mandatory: true,  type: 'string'},
    desc:               {mandatory: true,  type: 'string'},
    'class-name':       {mandatory: true,  type: 'string'},
    schedule:           {mandatory: true,  type: 'string'},
    remote:             {mandatory: false, type: 'boolean'},
    active:             {mandatory: false, type: 'boolean'},
    'run-skipped':      {mandatory: false, type: 'boolean'},
    'single-instance':  {mandatory: false, type: 'boolean'},
    author:             {mandatory: false, type: 'array'},
    groups:             {mandatory: false, type: 'array-of-pairs'},
    constants:          {mandatory: false, type: 'array'},
    classes:            {mandatory: false, type: 'array'},
    functions:          {mandatory: false, type: 'array'},
    'job-modules':      {mandatory: false, type: 'array'},
    mappers:            {mandatory: false, type: 'array'},
    vmaps:              {mandatory: false, type: 'array'},
    TAG:                {mandatory: false, type: 'array-of-pairs'},
};


export const fake_job_data = {
    target_dir: os.homedir(),
    iface_kind: 'job',
    lang: 'java',
    class_name: 'ExampleJob',
    base_class_name: 'QorusJob',

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
