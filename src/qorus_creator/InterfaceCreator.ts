import { workspace, window, Position } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { defaultValue } from './config_item_constants';
import { lang_suffix, lang_inherits, default_parse_options } from './common_constants';
import { quotesIfNum } from '../qorus_utils';
import { t } from 'ttag';
import * as msg from '../qorus_message';


export abstract class InterfaceCreator {
    protected suffix: string;
    protected lang: string;
    protected target_dir: string;
    protected file_base: string;
    protected code_info: QorusProjectCodeInfo;

    protected init(data: any, suffix: string): any {
        this.suffix = suffix;
        const { target_dir, target_file, ...other_data } = data;

        this.target_dir = target_dir;
        this.lang = data.lang || 'qore';

        this.file_base = target_file
            ? path.basename(target_file, this.suffix || '')
            : typeof data.version !== 'undefined'
                ? `${data.name}-${data.version}`
                : data.name;

        return other_data;
    }

    edit(params: any) {
        this.code_info = projects.currentProjectCodeInfo();
        if (params.orig_data) {
            this.code_info.setPending('edit_info', true);
            const orig_file = path.join(params.orig_data.target_dir, params.orig_data.target_file);
            this.code_info.addFileCodeInfo(
                    orig_file,
                    params.orig_data['class-name'],
                    params.orig_data['base-class-name']
            ).then(() => {
                this.editImpl(params);
                this.code_info.setPending('edit_info', false);
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
        return `${this.file_base}${this.suffix || ''}${lang_suffix[this.lang]}`;
    }

    protected get yaml_file_name() {
        return `${this.file_name}.yaml`;
    }

    protected get file_path() {
        return path.join(this.target_dir, this.file_name);
    }

    protected get yaml_file_path() {
        return path.join(this.target_dir, this.yaml_file_name);
    }

    protected writeYamlFile(headers: string, open_file_on_success: boolean = true, file_to_open?: string) {
        const generated_file_info = '# This is a generated file, don\'t edit!\n';

        fs.writeFile(this.yaml_file_path, generated_file_info + headers, err => {
            if (err) {
                msg.error(t`WriteFileError ${this.yaml_file_path} ${err.toString()}`);
                return;
            }

            if (open_file_on_success) {
                workspace.openTextDocument(file_to_open || this.yaml_file_path)
                         .then(doc => window.showTextDocument(doc));
            }
        });
    }

    protected writeFiles(contents: string, headers: string, open_file_on_success: boolean = true) {
        fs.writeFile(this.file_path, contents, err => {
            if (err) {
                msg.error(t`WriteFileError ${this.file_path} ${err.toString()}`);
                return;
            }

            this.writeYamlFile(headers, open_file_on_success, this.file_path);
        });
    }

    protected renameClassAndBaseClass(
            lines: string[],
            edit_info: any,
            orig_data: any,
            header_data): string[]
    {
        const orig_class_name = orig_data['class-name'];
        const orig_base_class_name = orig_data['base-class-name'];
        const class_name = header_data['class-name'];
        const base_class_name = header_data['base-class-name'];

        const replace = (position: Position, orig_str: string, new_name: string) => {
            let chars = lines[position.line].split('');
            chars.splice(position.character, orig_str.length, new_name);
            lines[position.line] = chars.join('');
        }

        if (base_class_name && !orig_base_class_name) {
            replace(edit_info.class_name_range.end, '', ` ${lang_inherits[this.lang]} ${base_class_name}`);
        }
        else if (!base_class_name && orig_base_class_name) {
            const line_no = edit_info.base_class_name_range.start.line;
            lines[line_no] = lines[line_no].replace(` ${lang_inherits[this.lang]}`, '')
                                           .replace(` ${orig_base_class_name}`, '');
        }
        else if (base_class_name !== orig_base_class_name) {
            replace(edit_info.base_class_name_range.start, orig_base_class_name, base_class_name);
        }

        if (class_name !== orig_class_name) {
            replace(edit_info.class_name_range.start, orig_class_name, class_name);
        }
        return lines;
    }

    protected static createConfigItemHeaders = (items: any[]): string => {
        const list_indent = '  - ';
        const indent = '    ';
        let result: string = 'config-items:\n';

        for (const item of [...items]) {
            result += `${list_indent}name: ${item.name}\n`;

            for (const tag of ['local-value', 'global-value', 'workflow-value']) {
                if (typeof item[tag] !== 'undefined') {
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
                if (['name', 'parent', 'parent_data', 'parent_class', 'value', 'level', 'is_set', 'yamlData',
                     'orig_name', 'local-value', 'global-value', 'workflow-value'].includes(tag))
                {
                    continue;
                }

                const has_parent_data: boolean = (item.parent_data || false ) && item.parent_data[tag] !== undefined;

                if ( (!has_parent_data && item[tag] !== defaultValue(tag)) ||
                     (has_parent_data && item[tag] !== item.parent_data[tag]) )
                {
                    if (tag === 'type') {
                        result += `${indent}type: ` + (item.type[0] === '*' ? `"${item.type}"` : item.type) + '\n';
                    }
                    else  {
                        result += `${indent}${tag}: ${item[tag]}\n`;
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
            headers.classes = headers.classes || [];
            if (!headers.classes.some(item => item.name === base_class_name && !item.prefix)) {
                headers.classes.unshift({name: base_class_name});
            }
        }

        let classes = {};
        let exists_prefix = false;
        (headers.classes || []).forEach(class_data => {
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
            const value = headers[tag];
            if (typeof(value) === 'undefined') {
                continue;
            }

            if (Array.isArray(value)) {
                result += `${tag}:\n`;
                switch (tag) {
                    case 'tags':
                        for (let item of value) {
                            result += `${indent}${item.key}: ${item.value}\n`;
                        }
                        break;
                    case 'define-auth-label':
                        for (let item of value) {
                            result += `${indent}${item.label}: ${item.value}\n`;
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
                        result += `${tag}: ${quotesIfNum(value)}\n`;
                        break;
                    case 'type':
                        result += `${tag}: ${value.toLowerCase()}\n`;
                        break;
                    case 'version':
                        result += `${tag}: ${quotesIfNum(value)}\n`;
                        break;
                    default:
                        result += `${tag}: ${value}\n`;
                }
            }
        }

        return result;
    }

    protected deleteOrigFilesIfDifferent(orig_file: string | undefined) {
        if (!orig_file || orig_file === this.file_path) {
            return;
        }

        const orig_yaml_file = (this.code_info.yamlDataBySrcFile(orig_file) || {}).yaml_file;

        if (orig_file) {
            fs.unlink(orig_file, err => {
                if (err) {
                    msg.error(t`RemoveFileError ${orig_file} ${err.toString()}`);
                    return;
                }
                msg.info(t`OrigFileRemoved ${orig_file}`);
                if (orig_yaml_file) {
                    fs.unlink(orig_yaml_file, err => {
                        if (err) {
                            msg.error(t`RemoveFileError ${orig_yaml_file} ${err.toString()}`);
                        }
                        else {
                            msg.info(t`OrigFileRemoved ${orig_yaml_file}`);
                        }
                    });
                }
            });
        }
    }

    protected fillTemplate = (template: any, vars: any, add_default_parse_options: boolean = true): string =>
        (add_default_parse_options && this.lang === 'qore' ? default_parse_options : '')
            + new Function('return `' + template[this.lang] + '`;').call(vars);
};
