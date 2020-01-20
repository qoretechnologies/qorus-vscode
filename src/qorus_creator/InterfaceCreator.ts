import { workspace, window, Position } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { field } from './common_constants';
import { defaultValue } from './config_item_constants';
import { lang_suffix, lang_inherits, default_parse_options } from './common_constants';
import * as jsyaml from 'js-yaml';
import { quotesIfNum } from '../qorus_utils';
import { t } from 'ttag';
import * as globals from '../global_config_item_values';
import * as msg from '../qorus_message';


export abstract class InterfaceCreator {
    protected suffix: string;
    protected lang: string;
    protected target_dir: string;
    protected file_base: string;
    protected yaml_file_base: string;
    protected code_info: QorusProjectCodeInfo;
    protected edit_info: any;

    protected init(data: any, suffix: string): any {
        this.suffix = suffix;
        const { target_dir, target_file, ...other_data } = data;

        this.target_dir = target_dir;
        this.lang = data.lang || 'qore';

        if (this.lang === 'qore') {
            this.file_base = target_file
                ? path.basename(path.basename(target_file, lang_suffix[this.lang]), this.suffix || '.yaml')
                : (data.version !== undefined
                    ? `${data.name}-${data.version}`
                    : data.name);
            this.yaml_file_base = this.file_base;
        } else {
            this.file_base = target_file
                ? path.basename(path.basename(target_file, lang_suffix[this.lang]), '.yaml')
                : data['class-name'];
            this.yaml_file_base = data.version !== undefined
                ? `${data.name}-${data.version}`
                : data.name;
        }

        return other_data;
    }

    protected hasCode = (): boolean => !!this.suffix;

    edit(params: any) {
        this.code_info = projects.currentProjectCodeInfo();
        if (params.orig_data) {
            this.code_info.setPending('edit_info', true);
            const orig_file = path.join(params.orig_data.target_dir, params.orig_data.target_file);
            const addFileCodeInfoMethod = params.data.lang === 'java' ? 'addJavaFileCodeInfo' : 'addFileCodeInfo';
            this.code_info[addFileCodeInfoMethod](
                orig_file,
                params.orig_data['class-name'],
                params.orig_data['base-class-name']
            ).then(() => {
                this.code_info.setPending('edit_info', false);
                this.editImpl(params);
            });
        }
        else {
            if (params.edit_type === 'edit') {
                msg.error(t`MissingEditData`);
                return;
            }
            this.editImpl(params);
        }
    }

    protected abstract editImpl(params: any);

    protected get file_name() {
        return this.hasCode()
            ? (this.lang !== 'java'
                ? `${this.file_base}${this.suffix || ''}${lang_suffix[this.lang]}`
                : `${this.file_base}${lang_suffix[this.lang]}`)
            : undefined;
    }

    protected get yaml_file_name() {
        return this.hasCode() && this.lang !== 'java' ? `${this.file_name}.yaml` : `${this.yaml_file_base}.yaml`;
    }

    protected get file_path() {
        return this.hasCode() ? path.join(this.target_dir, this.file_name) : undefined;
    }

    protected get yaml_file_path() {
        return path.join(this.target_dir, this.yaml_file_name);
    }

    protected writeYamlFile(headers: string, file_path?: string) {
        const generated_file_info = '# This is a generated file, don\'t edit!\n';
        file_path = file_path || this.yaml_file_path;

        fs.writeFile(file_path, generated_file_info + headers, err => {
            if (err) {
                msg.error(t`WriteFileError ${file_path} ${err.toString()}`);
                return;
            }
        });
    }

    protected writeFiles(contents: string, headers: string, open_file_on_success: boolean = true) {
        fs.writeFile(this.file_path, contents, err => {
            if (err) {
                msg.error(t`WriteFileError ${this.file_path} ${err.toString()}`);
                return;
            }

            this.writeYamlFile(headers);

            if (open_file_on_success) {
                workspace.openTextDocument(this.file_path).then(doc => window.showTextDocument(doc));
            }
        });
    }

    protected renameClassAndBaseClass(lines: string[], orig_data: any, header_data): string[] {
        const orig_class_name = orig_data['class-name'];
        const orig_base_class_name = orig_data['base-class-name'];
        const class_name = header_data['class-name'];
        const base_class_name = header_data['base-class-name'];

        const {
            class_name_range,
            main_base_class_name_range,
            first_base_class_line,
            last_class_line,
            base_class_names,
            main_base_class_ord
        } = this.edit_info;

        const num_inherited = base_class_names.length;
        const has_other_base_class = num_inherited > 1 || (num_inherited > 0 && main_base_class_ord === -1);

        const replace = (position: Position, orig_str: string, new_name: string) => {
            let chars = lines[position.line].split('');
            chars.splice(position.character, orig_str.length, new_name);
            lines[position.line] = chars.join('');
        }

        const inherits_kw = lang_inherits[this.lang];

        const eraseInheritsKw = () => {
            const strings_to_erase =[` ${inherits_kw}`, `${inherits_kw} `, `${inherits_kw}`];
            for (let n = class_name_range.start.line; n <= first_base_class_line; n++) {
                for (const string_to_erase of strings_to_erase) {
                    if (lines[n].includes(string_to_erase)) {
                        lines[n] = lines[n].replace(string_to_erase, '');
                        return;
                    }
                }
            }
        };

        const eraseCommaAfterBaseClassName = () => {
            for (let n = main_base_class_name_range.start.line; n <= last_class_line; n++) {
                const pos_from = n === main_base_class_name_range.start.line
                    ? main_base_class_name_range.end.character
                    : 0;
                for (const string_to_erase of [', ', ',']) {
                    const pos = lines[n].indexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseCommaBeforeBaseClassName = () => {
            for (let n = main_base_class_name_range.start.line; n >= first_base_class_line; n--) {
                const pos_from = n === main_base_class_name_range.start.line
                    ? main_base_class_name_range.start.character
                    : 0;
                for (const string_to_erase of [', ', ',']) {
                    const pos = lines[n].lastIndexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseBaseClassName = (only_without_space: boolean = false) => {
            let strings_to_erase = [orig_base_class_name];
            if (!only_without_space) {
                strings_to_erase.unshift(`${orig_base_class_name} `);
                strings_to_erase.unshift(` ${orig_base_class_name}`);
            }

            const line = main_base_class_name_range.start.line;
            for (const string_to_erase of strings_to_erase) {
                if (lines[line].includes(string_to_erase)) {
                    lines[line] = lines[line].replace(string_to_erase, '');
                    return;
                }
            }
        };

        if (base_class_name && !orig_base_class_name) {
            if (has_other_base_class) {
                if (!base_class_name.includes(base_class_name)) {
                    eraseInheritsKw();
                    replace(class_name_range.end, '', ` ${inherits_kw} ${base_class_name},`);
                }
            } else {
                replace(class_name_range.end, '', ` ${inherits_kw} ${base_class_name}`);
            }
        }
        else if (!base_class_name && orig_base_class_name) {
            if (has_other_base_class) {
                if (main_base_class_ord > 0) {
                    eraseBaseClassName(true);
                    eraseCommaBeforeBaseClassName();
                } else {
                    eraseCommaAfterBaseClassName();
                    eraseBaseClassName(true);
                }
            } else {
                eraseInheritsKw();
                eraseBaseClassName();
            }
        }
        else if (base_class_name !== orig_base_class_name) {
            replace(main_base_class_name_range.start, orig_base_class_name, base_class_name);
        }

        if (class_name !== orig_class_name) {
            replace(class_name_range.start, orig_class_name, class_name);
        }
        return lines;
    }

    protected static createConfigItemHeaders = (items: any[]): string => {
        const list_indent = '  - ';
        const indent = '    ';
        let result: string = 'config-items:\n';

        for (const item of [...items]) {
            result += `${list_indent}name: ${item.name}\n`;

            if (item['global-value']) {
                globals.set(item);
            }
            if (item['remove-global-value']) {
                globals.remove(item.name);
            }

            for (const tag of ['local-value', 'default_value']) {
                if (item[tag] !== undefined && (!item.parent_data || item.parent_data[tag] != item[tag])) {
                    switch (item.type) {
                        case 'list':
                        case '*list':
                            result += `${indent}${tag}:\n`;
                            for (let entry of item[tag]) {
                                result += `${indent}${list_indent}${JSON.stringify(entry)}\n`;
                            }
                            break;
                        case 'hash':
                        case '*hash':
                            result += `${indent}${tag}:\n`;
                            for (let key in item[tag]) {
                                result += `${indent}${indent}${key}: ${JSON.stringify(item[tag][key])}\n`;
                            }
                            break;
                        default:
                            result += `${indent}${tag}: ${JSON.stringify(item[tag])}\n`;
                    }
                }
            }

            if (item.parent) {
                result += `${indent}parent:\n`;
                for (const tag in item.parent) {
                    result += `${indent}${indent}${tag}: ${quotesIfNum(item.parent[tag])}\n`;
                }
            }

            for (const tag in item) {
                if (['name', 'parent', 'parent_data', 'parent_class', 'value', 'level',
                     'is_set', 'yamlData', 'orig_name', 'local-value', 'global-value',
                     'default_value', 'remove-global-value', 'workflow-value'].includes(tag))
                {
                    continue;
                }

                const has_parent_data: boolean = (item.parent_data || false ) && item.parent_data[tag] !== undefined;

                if ( (!has_parent_data && item[tag] !== defaultValue(tag)) ||
                     (has_parent_data && item[tag] !== item.parent_data[tag]) )
                {
                    if (Array.isArray(item[tag])) {
                        result += `${indent}${tag}:\n`;
                        for (let entry of item[tag]) {
                            result += `${indent}${list_indent}${JSON.stringify(entry)}\n`;
                        }
                    } else {
                        switch (tag) {
                            case 'type':
                                result += `${indent}type: ` + (item.type[0] === '*' ? `"${item.type}"` : item.type) + '\n';
                                break;
                            case 'description':
                                result += `${indent}${tag}: "${item[tag]}"\n`;
                                break;
                            default:
                                result += `${indent}${tag}: ${item[tag]}\n`;
                        }
                    }
                }
            }
        }

        return result;
    }

    protected static createHeaders = (headers: any): string => {
        const list_indent = '  - ';
        const indent = '    ';
        let result: string = '';

        const base_class_name = headers['base-class-name'];
        if (base_class_name && !QorusProjectCodeInfo.isRootBaseClass(base_class_name)) {
            const classes_or_requires = headers.type === 'class' ? 'requires' : 'classes';
            headers[classes_or_requires] = headers[classes_or_requires] || [];
            if (!headers[classes_or_requires].some(item => item.name === base_class_name && !item.prefix)) {
                headers[classes_or_requires].unshift({name: base_class_name});
            }
        }

        let classes = {};
        let exists_prefix = false;
        (headers.classes || headers.requires || []).forEach(class_data => {
            if (!classes[class_data.name]) {
                classes[class_data.name] = {
                    exists_prefix: false,
                    prefixes: []
                };
            }
            classes[class_data.name].prefixes.push(class_data.prefix);
            if (class_data.prefix) {
                classes[class_data.name].exists_prefix = true;
                exists_prefix = true;
            }
        });

        for (const tag in headers) {
            if (['target_dir', 'yaml_file', 'config-item-values'].includes(tag))
            {
                continue;
            }

            const value = headers[tag];
            if (value === undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                result += `${tag === 'workflow_options' ? 'options' : tag}:\n`;

                switch (tag) {
                    case 'tags':
                    case 'workflow_options':
                    case 'define-auth-label':
                    case 'statuses':
                        const [key_name, value_name] = field[tag.replace(/-/g, '_')].fields;
                        for (let item of value) {
                            result += `${indent}${item[key_name]}: ${item[value_name]}\n`;
                        }
                        break;
                    case 'author':
                    case 'constants':
                    case 'functions':
                    case 'vmaps':
                    case 'mappers':
                    case 'keylist':
                    case 'groups':
                        for (let item of value) {
                            result += `${list_indent}${item.name}\n`;
                        }
                        break;
                    case 'classes':
                    case 'requires':
                        let class_prefixes = exists_prefix ? 'class-prefixes:\n' : '';
                        for (let class_name in classes) {
                            result += `${list_indent}${class_name}\n`;
                            if (classes[class_name].exists_prefix) {
                                for (const prefix of classes[class_name].prefixes) {
                                    class_prefixes += `${list_indent}class: ${class_name}\n`;
                                    class_prefixes += `${indent}prefix: ${prefix || null}\n`;
                                }
                            }
                        }
                        result += class_prefixes;
                        break;
                    case 'class_connectors':
                        for (const connector of value) {
                            result += `${list_indent}name: ${connector.name}\n`;
                            for (const key in connector) {
                                if (['name', 'id'].includes(key)) {
                                    continue;
                                }
                                if (['input-provider', 'output-provider'].includes(key) && connector[key]) {
                                    result += `${indent}${key}:\n`;
                                    for (const subkey in connector[key]) {
                                        if (connector[key][subkey] === '') {
                                            result += `${indent}${indent}${subkey}: ""\n`;
                                        } else {
                                            result += `${indent}${indent}${subkey}: ${connector[key][subkey]}\n`;
                                        }
                                    }
                                } else {
                                    result += `${indent}${key}: ${connector[key]}\n`;
                                }
                            }
                        }
                        break;
                    case 'resource':
                    case 'text-resource':
                    case 'bin-resource':
                    case 'template':
                        for (let item of value) {
                            result += `${list_indent}${item}\n`;
                        }
                        break;
                    case 'steps':
                        const lines = JSON.stringify(value, null, 4).split('\n');
                        for (let line of lines) {
                            result += `${indent}${line}\n`;
                        }
                        break;
                }
            }
            else {
                switch (tag) {
                    case 'orig_name':
                    case 'method_index':
                        break;
                    case 'schedule':
                        const cron_values = value.split(' ');
                        if (cron_values.length !== 5) {
                            break;
                        }
                        const cron_items = ['minutes', 'hours', 'days', 'months', 'dow'];
                        result += `${tag}:\n`;
                        for (let i = 0; i < 5; i++) {
                            result += `${indent}${cron_items[i]}: "${cron_values[i]}"\n`;
                        }
                        break;
                    case 'service-autostart':
                    case 'workflow-autostart':
                        result += `autostart: ${value}\n`;
                        break;
                    case 'desc':
                    case 'description':
                        result += `${tag}: "${value}"\n`;
                        break;
                    case 'version':
                        result += `${tag}: ${quotesIfNum(value)}\n`;
                        break;
                    case 'type':
                        result += `${tag}: ${value.toLowerCase()}\n`;
                        break;
                    case 'fields':
                    case 'mapper_options':
                        const tag_name = tag === 'mapper_options' ? 'options' : tag;
                        result += `${tag_name}:\n`;
                        let not_indented = jsyaml.safeDump(value, {indent: 4}).split(/\r?\n/);
                        if (/^\s*$/.test(not_indented.slice(-1)[0])) {
                            not_indented.pop();
                        }
                        result += not_indented.map(str => `${indent}${str}`).join('\n') + '\n';
                        break;
                    default:
                        result += `${tag}: ${value}\n`;
                }
            }
        }

        return result;
    }

    protected deleteOrigFilesIfDifferent(orig_file: string | undefined) {
        if (!orig_file) {
            return;
        }

        let orig_code_file;
        let orig_yaml_file;

        if (this.hasCode()) {
            if (orig_file === this.file_path) {
                return;
            }

            orig_code_file = orig_file;
            orig_yaml_file = (this.code_info.yamlDataBySrcFile(orig_file) || {}).yaml_file;
        } else {
            if (orig_file === this.yaml_file_path) {
                return;
            }

            orig_yaml_file = orig_file;
        }

        [orig_code_file, orig_yaml_file].forEach(file => {
            if (file) {
                fs.unlink(file, err => {
                    if (err) {
                        msg.error(t`RemoveFileError ${file} ${err.toString()}`);
                        return;
                    }
                    msg.info(t`OrigFileRemoved ${file}`);
                });
            }
        });
    }

    protected fillTemplate = (template: any, vars: any, add_default_parse_options: boolean = true): string =>
        (add_default_parse_options && this.lang === 'qore' ? default_parse_options : '')
            + new Function('return `' + template[this.lang] + '`;').call(vars);
};
