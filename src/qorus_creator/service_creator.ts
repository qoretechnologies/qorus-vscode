import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { fillTemplate, createHeaders } from './creator_common';
import { service_template, default_service_headers } from './service_template';


export function createService(data: any) {
    data = fake_data;

    const {target_path, headers: header_vars, ...code_vars} = data;

    const headers: string = createHeaders(Object.assign({}, header_vars, default_service_headers, header_vars));
    const code: string = fillTemplate(service_template, code_vars);

    fs.writeFileSync(
        path.join(target_path, `${header_vars.service}-${header_vars.serviceversion}.qsd`),
        headers + '# ENDSERVICE\n\n' + code
    );
}

export const fake_data = {
    iface_kind: 'service',
    target_path: os.homedir(),
    class_name: 'MyService',
    inherits: 'QorusService',
    headers: {
        service: 'my-service',
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
