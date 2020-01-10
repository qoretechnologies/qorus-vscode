import * as jsyaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs';
import { t } from 'ttag';
import { projects } from './QorusProject';
import * as msg from './qorus_message';


const type = 'global-config-item-values';
const filename = type + '.yaml';

const filepath = () => {
    const folder = projects.getProject()?.folder;
    return folder && path.join(folder, filename);
}

const read = (): any => {
    const file = filepath();
    if (!file) {
        msg.error(t`globalConfigItemValuesFileNotFound`);
        return undefined;
    }

    try {
        const parsed_contents = jsyaml.safeLoad(fs.readFileSync(file));
        return parsed_contents['global-config-item-values'] || [];
    } catch (error) {
        msg.debug({ file, error });
        return undefined;
    }
}

const write = items => {
    const contents = { type, [type]: items };
    const contents_str = jsyaml.safeDump(contents, {indent: 2}).replace(/\r?\n  -\r?\n/g, '\n  - ');
    fs.writeFileSync(filepath(), contents_str);
}

export const set = ({name, 'global-value': value}) => {
    let items = read();
    if (!items) {
        return;
    }

    const index = items.findIndex(item => item.name === name);
    if (index > -1) {
        items[index].value = value;
    } else {
        items.push({name, value});
    }

    write(items);
}

export const get = name => {
    let items = read();
    if (!items) {
        return undefined;
    }

    const index = items.findIndex(item => item.name === name);
    return index > -1 ? items[index].value : undefined;
}
