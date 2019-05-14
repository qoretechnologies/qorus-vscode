import * as fs from 'fs';
import { fillTemplate, createHeaders } from './creator_common';
import { service_template } from './service_template';


export function createService(data: any) {
    const headers: string = createHeaders(data.headers);
    const code = fillTemplate(service_template, data);

    fs.writeFileSync(data.target_path, headers + '\n\n' + code);
}
