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
    if (!folder) {
        msg.error(t`UnableDetermineProjectFolder`);
        return undefined;
    }
    return path.join(folder, filename);
};

const read = (): any => {
    const file = filepath();
    if (!file) {
        return undefined;
    }

    if (!fs.existsSync(file)) {
        write([]);
    }

    try {
        const parsed_contents = jsyaml.safeLoad(fs.readFileSync(file));
        return parsed_contents['global-config-item-values'] || [];
    } catch (error) {
        msg.error(t`ErrorReadingGlobalConfigItemValues`);
        msg.debug({ file, error });
        return undefined;
    }
};

const write = items => {
    const contents = { type, [type]: items };
    const contents_str = jsyaml.safeDump(contents, {indent: 2}).replace(/\r?\n  -\r?\n/g, '\n  - ');
    fs.writeFileSync(filepath(), contents_str);
};

export const set = ({name, 'global-value': value, is_global_value_templated_string}) => {
    let items = read();
    if (!items) {
        return;
    }

    const index = items.findIndex(item => item.name === name);
    if (index > -1) {
        items[index].value = value;
        if (is_global_value_templated_string) {
            items[index].is_value_templated_string = true;
        } else {
            delete items[index].is_value_templated_string;
        }
    } else {
        items.push({name, value, ... is_global_value_templated_string ? {is_value_templated_string: true} : {}});
    }

    write(items);
};

export const remove = name => {
    let items = read();
    if (!items) {
        return;
    }

    const index = items.findIndex(item => item.name === name);
    if (index > -1) {
        items.splice(index, 1);
    }

    write(items);
};

export const get = name => {
    let items = read();
    if (!items) {
        return undefined;
    }

    const index = items.findIndex(item => item.name === name);
    return index > -1 ? items[index] : undefined;
};
