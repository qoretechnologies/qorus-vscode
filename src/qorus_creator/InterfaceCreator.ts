import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as path from 'path';
import { t } from 'ttag';
import { Position } from 'vscode';

import * as globals from '../global_config_item_values';
import {
    default_version,
    types_with_version
} from '../qorus_constants';
import * as msg from '../qorus_message';
import {
    capitalize,
    isValidIdentifier,
    quotesIfNum,
    removeDuplicates,
    sortRanges
} from '../qorus_utils';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { qorus_webview } from '../QorusWebview';
import {
    default_parse_options,
    field
} from './common_constants';
import { defaultValue } from './config_item_constants';
import { mandatoryStepMethods } from './standard_methods';

const list_indent = '  - ';
const indent = '    ';

const lang_suffix = {
    qore: '',
    python: '.py',
    java: '.java',
};

export abstract class InterfaceCreator {
    protected suffix: string = '';
    protected lang: string;
    protected target_dir: string;
    protected target_subdir: string;
    protected file_base: string;
    protected yaml_file_base: string;
    protected orig_file_path: string;
    protected orig_yaml_file_path: string;
    protected code_info: QorusProjectCodeInfo;
    protected file_edit_info: any;
    protected has_code = false;
    protected had_code = false;

    protected setPaths(data: any, orig_data: any, suffix: string, iface_kind: string, edit_type?: string): any {
        this.file_edit_info = undefined;
        this.suffix = suffix || '';

        let { target_dir, target_file } = data;
        const { target_dir: orig_target_dir, target_file: orig_target_file } = orig_data || {};

        this.target_dir =
            iface_kind === 'type' && edit_type === 'create'
                ? this.code_info.getProject()?.dirForTypePath(target_dir, data.path)
                : target_dir;

        if (iface_kind === 'type' && !target_file) {
            target_file = path.basename(data.path);
        }

        switch (this.lang) {
            case 'java':
                this.file_base = data['class-name'];
                this.yaml_file_base = data.version !== undefined ? `${data.name}-${data.version}` : data.name;
                this.target_subdir = iface_kind ? `${this.yaml_file_base}-${iface_kind}` : this.yaml_file_base;
                break;
            default:
                if (target_file) {
                    this.file_base = target_file;
                    // remove all possible suffixes
                    [
                        'py',
                        'yaml',
                        'qjob',
                        'qstep',
                        'qwf',
                        'qclass',
                        'qmapper',
                        'qtype',
                        'qsd',
                        'qmc',
                        'qevent',
                        'qgroup',
                        'qqueue',
                    ].forEach((suffix) => {
                        this.file_base = path.basename(this.file_base, `.${suffix}`);
                    });
                } else {
                    this.file_base = data.version !== undefined ? `${data.name}-${data.version}` : data.name;
                }
                this.yaml_file_base = this.file_base;
                this.target_subdir = '';
        }

        if (orig_target_dir && orig_target_file) {
            const orig_path = path.join(orig_target_dir, orig_target_file);
            if (this.had_code) {
                this.orig_file_path = orig_path;
                this.orig_yaml_file_path = this.code_info.yaml_info.yamlDataBySrcFile(orig_path)?.yaml_file;
                this.file_edit_info = this.code_info.edit_info.getInfo(orig_path);
            } else {
                this.orig_yaml_file_path = orig_path;
                this.orig_file_path = undefined;
            }
        } else {
            this.orig_file_path = undefined;
            this.orig_yaml_file_path = undefined;
        }
    }

    edit(params: any) {
        this.code_info = projects.currentProjectCodeInfo();

        if (params.orig_data) {
            this.code_info.setPending('edit_info', true);
            const orig_file = path.join(params.orig_data.target_dir, params.orig_data.target_file);
            this.code_info.edit_info.setFileInfo(orig_file, params.orig_data).then(
                () => {
                    this.code_info.setPending('edit_info', false);
                    this.editImpl(params);
                },
                (error) => {
                    msg.error(error);
                    this.code_info.setPending('edit_info', false);
                    qorus_webview.postMessage({
                        action: `creator-edit-interface-complete`,
                        request_id: params.request_id,
                        ok: false,
                        message: error,
                    });
                }
            );
        } else {
            if (params.edit_type !== 'create') {
                msg.error(t`MissingEditData`);
                return;
            }
            this.editImpl(params);
        }
    }

    protected abstract editImpl(params: any);

    protected get rel_file_path() {
        if (!this.has_code) {
            return undefined;
        }

        switch (this.lang) {
            case 'java':
                return path.join(this.target_subdir, `${this.file_base}${lang_suffix.java}`);
            default:
                return `${this.file_base}${this.suffix}${lang_suffix[this.lang]}`;
        }
    }

    protected get yaml_file_name() {
        return `${this.yaml_file_base}${this.suffix}.yaml`;
    }

    protected get file_path() {
        return this.has_code ? path.join(this.target_dir, this.rel_file_path) : undefined;
    }

    protected get yaml_file_path() {
        return path.join(this.target_dir, this.yaml_file_name);
    }

    protected writeYamlFile(headers: string, file_path?: string) {
        const generated_file_info = "# This is a generated file, don't edit!\n";
        file_path = file_path || this.yaml_file_path;

        try {
            fs.writeFileSync(file_path, generated_file_info + headers);
        } catch (err) {
            msg.error(t`WriteFileError ${file_path} ${err.toString()}`);
            return false;
        }

        return true;
    }

    protected writeFiles(contents: string, headers: string) {
        contents = contents.replace(/(\t| )+\n/g, '\n');
        while (contents.match(/\n\n\n/)) {
            contents = contents.replace(/\n\n\n/g, '\n\n');
        }
        contents.replace(/\n\n$/, '\n');
        if (contents[contents.length - 1] !== '\n') {
            contents += '\n';
        }

        if (!this.writeYamlFile(headers)) {
            return false;
        }

        try {
            const true_target_dir = path.join(this.target_dir, this.target_subdir);
            if (!fs.existsSync(true_target_dir)) {
                fs.mkdirSync(true_target_dir);
            }

            fs.writeFileSync(this.file_path, contents);
        } catch (err) {
            msg.error(t`WriteFileError ${this.file_path} ${err.toString()}`);
            return false;
        }

        return true;
    }

    protected checkData = (params: any): any => {
        const items_to_check = ['checkExistingInterface', 'checkClassName'];
        for (const item_to_check of items_to_check) {
            const { ok, message } = this[item_to_check](params);
            if (!ok) {
                return { ok, message };
            }
        }
        return { ok: true };
    }

    protected checkClassName = (params: any): any => {
        const {
            data: { 'class-name': class_name },
        } = params;
        if (!class_name || isValidIdentifier(class_name)) {
            return { ok: true };
        }
        return { ok: false, message: t`InvalidClassName ${class_name}` };
    }

    protected checkExistingInterface = (params: any): any => {
        let {
            iface_kind,
            edit_type,
            data: { name, version, type, 'class-name': class_name },
            orig_data,
        } = params;

        if (!['create', 'edit'].includes(edit_type)) {
            return { ok: true };
        }

        if (iface_kind === 'other') {
            iface_kind = (type || '').toLowerCase();
        }

        const { name: orig_name, version: orig_version, 'class-name': orig_class_name } = orig_data || {};

        const with_version = types_with_version.includes(iface_kind);

        const iface_name = with_version ? `${name}:${version || default_version}` : name;
        const orig_iface_name = with_version ? `${orig_name}:${orig_version || default_version}` : orig_name;

        if (iface_name !== orig_iface_name) {
            const iface = this.code_info.yaml_info.yamlDataByName(iface_kind, iface_name);
            if (iface) {
                return { ok: false, message: t`IfaceAlreadyExists ${capitalize(iface_kind)} ${iface_name}` };
            }
        }
        if (class_name && class_name !== orig_class_name && !['class', 'mapper-code'].includes(iface_kind)) {
            const iface = this.code_info.yaml_info.yamlDataByClass(iface_kind, class_name);
            if (iface) {
                return { ok: false, message: t`ClassAlreadyExists ${capitalize(iface_kind)} ${class_name}` };
            }
        }

        const { file_path, orig_file_path, yaml_file_path, orig_yaml_file_path } = this;

        if (file_path && file_path !== orig_file_path) {
            const iface = this.code_info.yaml_info.yamlDataBySrcFile(file_path);
            if (iface) {
                return { ok: false, message: t`FileAlreadyExists ${file_path}` };
            }
        }

        if (yaml_file_path !== orig_yaml_file_path) {
            const iface = this.code_info.yaml_info.yamlDataByYamlFile(yaml_file_path);
            if (iface) {
                return { ok: false, message: t`FileAlreadyExists ${yaml_file_path}` };
            }
        }

        return { ok: true };
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
            main_base_class_ord,
        } = this.file_edit_info;

        if (!class_name_range) {
            return lines;
        }

        const num_inherited = base_class_names.length;
        const has_other_base_class = num_inherited > 1 || (num_inherited > 0 && main_base_class_ord === -1);

        const replace = (position: Position, orig_str: string, new_name: string) => {
            let chars = lines[position.line].split('');
            chars.splice(position.character, orig_str.length, new_name);
            lines[position.line] = chars.join('');
        };

        const inherits_kw = {
            qore: { before: ' inherits ', after: '' },
            python: { before: '(', after: ')' },
            java: { before: ' extends ', after: '' },
        }[this.lang];

        const eraseInheritsBefore = () => {
            const inherits_before = inherits_kw.before.trim();
            const strings_to_erase = [` ${inherits_before}`, `${inherits_before} `, `${inherits_before}`];

            for (let n = class_name_range.start.line; n <= first_base_class_line; n++) {
                for (const string_to_erase of strings_to_erase) {
                    if (lines[n].includes(string_to_erase)) {
                        lines[n] = lines[n].replace(string_to_erase, '');
                        return;
                    }
                }
            }
        };

        const eraseStrAfterBaseClassName = (str: string) => {
            for (let n = main_base_class_name_range.start.line; n <= last_class_line; n++) {
                const pos_from =
                    n === main_base_class_name_range.start.line ? main_base_class_name_range.end.character : 0;
                for (const string_to_erase of [`${str} `, `${str}`]) {
                    const pos = lines[n].indexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseStrBeforeBaseClassName = (str: string) => {
            for (let n = main_base_class_name_range.start.line; n >= first_base_class_line; n--) {
                const pos_from =
                    n === main_base_class_name_range.start.line ? main_base_class_name_range.start.character : 0;
                for (const string_to_erase of [`${str} `, `${str}`]) {
                    const pos = lines[n].lastIndexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseBaseClassName = (without_space: boolean = false) => {
            const n = main_base_class_name_range.start.line;
            const pos = main_base_class_name_range.start.character;
            const length = main_base_class_name_range.end.character - main_base_class_name_range.start.character;

            if (!without_space) {
                if (lines[n].substr(pos, length + 1) === `${orig_base_class_name} `) {
                    lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + length + 1);
                    return;
                }
                if (lines[n].substr(pos - 1, length + 1) === ` ${orig_base_class_name}`) {
                    lines[n] = lines[n].substr(0, pos - 1) + lines[n].substr(pos + length);
                    return;
                }
            }
            if (lines[n].substr(pos, length) === `${orig_base_class_name}`) {
                lines[n] = lines[n].substr(0, pos) + lines[n].substr(pos + length);
            }
        };

        if (base_class_name && !orig_base_class_name) {
            if (has_other_base_class) {
                if (!base_class_names.includes(base_class_name)) {
                    eraseInheritsBefore();
                    replace(class_name_range.end, '', `${inherits_kw.before}${base_class_name},`);
                }
            } else {
                replace(class_name_range.end, '', `${inherits_kw.before}${base_class_name}${inherits_kw.after}`);
            }
        } else if (!base_class_name && orig_base_class_name) {
            if (has_other_base_class) {
                if (main_base_class_ord > 0) {
                    eraseBaseClassName(true);
                    eraseStrBeforeBaseClassName(',');
                } else {
                    eraseStrAfterBaseClassName(',');
                    eraseBaseClassName(true);
                }
            } else {
                if (inherits_kw.after) {
                    eraseStrAfterBaseClassName(inherits_kw.after);
                }
                eraseBaseClassName();
                eraseInheritsBefore();
            }
        } else if (base_class_name !== orig_base_class_name) {
            replace(main_base_class_name_range.start, orig_base_class_name, base_class_name);
        }

        if (class_name !== orig_class_name) {
            replace(class_name_range.start, orig_class_name, class_name);
        }
        return lines;
    }

    protected updateImports = (code_lines: string[], imports: string[]): string[] => {
        const isImportLine = (line:string): boolean => {
            switch (this.lang) {
                case 'java': return !!line.match(/^import /);
                case 'python': return !!line.match(/^from\s+\S+\s+import /);
                default: return false;
            }
        };

        // remove existing import lines
        let num_import_lines: number = 0;
        for (const line of code_lines) {
            if (!isImportLine(line) && line.match(/\S/)) {
                break;
            }
            num_import_lines++;
        }
        code_lines = code_lines.splice(num_import_lines);

        // add import lines
        if (imports.length) {
            code_lines = [...imports, '', ...code_lines];
        }

        return code_lines;
    }

    private static indentYamlDump = (value, indent_level, is_on_new_line) => {
        let lines = jsyaml.safeDump(value, { indent: 4 }).split(/\r?\n/);
        if (/^\s*$/.test(lines.slice(-1)[0])) {
            lines.pop();
        }
        let result = '';
        if (is_on_new_line) {
            result += indent.repeat(indent_level);
        }
        result += `${lines.shift()}\n`;
        if (lines.length) {
            result += lines.map((str) => `${indent.repeat(indent_level)}${str}`).join('\n') + '\n';
        }
        return result;
    }

    protected static createConfigItemHeaders = (items: any[]): string => {
        let result: string = 'config-items:\n';

        for (const item of [...items]) {
            result += `${list_indent}name: ${item.name}\n`;

            if (item['global-value']) {
                globals.set(item);
            }
            if (item['remove-global-value']) {
                globals.remove(item.name);
            }

            for (const tag of ['value', 'local-value', 'default_value']) {
                if (item[tag] !== undefined && (!item.parent_data || item.parent_data[tag] != item[tag])) {
                    result += `${indent}${tag === 'local-value' ? 'value' : tag}:\n`;

                    let type = item.type;
                    if (type === 'any') {
                        if (tag === 'default_value') {
                            type = item.default_value_true_type || type;
                        } else {
                            type = item.value_true_type || type;
                        }
                    } else {
                        delete item.default_value_true_type;
                        delete item.value_true_type;
                    }

                    const non_star_type = type?.substring(type.indexOf('*') + 1);
                    if (['list', 'hash'].includes(non_star_type)) {
                        let lines = jsyaml.safeDump(item[tag], { indent: 4 }).split(/\r?\n/);
                        if (/^\s*$/.test(lines.slice(-1)[0])) {
                            lines.pop();
                        }
                        if (non_star_type === 'list') {
                            result += lines.map((str) => `${indent}  ${str}`).join('\n') + '\n';
                        } else {
                            result += lines.map((str) => `${indent}${indent}${str}`).join('\n') + '\n';
                        }
                    } else {
                        result += `${indent}${indent}${JSON.stringify(item[tag])}\n`;
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
                if (item[tag] === undefined) {
                    continue;
                }

                if (
                    [
                        'name',
                        'parent',
                        'parent_data',
                        'parent_class',
                        'value',
                        'level',
                        'is_set',
                        'yamlData',
                        'orig_name',
                        'local-value',
                        'global-value',
                        'is_global_value_templated_string',
                        'default_value',
                        'remove-global-value',
                        'workflow-value',
                    ].includes(tag)
                ) {
                    continue;
                }

                const has_parent_data: boolean = (item.parent_data || false) && item.parent_data[tag] !== undefined;

                if (
                    (!has_parent_data && item[tag] !== defaultValue(tag)) ||
                    (has_parent_data && item[tag] !== item.parent_data[tag])
                ) {
                    if (Array.isArray(item[tag])) {
                        result += `${indent}${tag}:\n`;
                        for (let entry of item[tag]) {
                            result += `${indent}${list_indent}${JSON.stringify(entry)}\n`;
                        }
                    } else {
                        switch (tag) {
                            case 'type':
                                result +=
                                    `${indent}type: ` + (item.type[0] === '*' ? `"${item.type}"` : item.type) + '\n';
                                break;
                            case 'description':
                                result += `${indent}${tag}: ` + InterfaceCreator.indentYamlDump(item[tag], 1, false);
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

    protected createHeaders = (headers: any): string => {
        let result: string = '';

        const classes_or_requires = headers.type === 'class' ? 'requires' : 'classes';
        headers[classes_or_requires] = this.code_info.interface_info.addClassNames(headers[classes_or_requires]);

        const base_class_name = headers['base-class-name'];
        if (base_class_name && !QorusProjectCodeInfo.isRootBaseClass(base_class_name)) {
            headers[classes_or_requires] = headers[classes_or_requires] || [];
            if (
                !headers[classes_or_requires].some(
                    (class_data) => class_data['class-name'] === base_class_name && !class_data.prefix
                )
            ) {
                headers[classes_or_requires].unshift({ name: base_class_name });
            }
        }

        let classes = {};
        let exists_prefix = false;
        (headers[classes_or_requires] || []).forEach((class_data) => {
            if (!classes[class_data.name]) {
                classes[class_data.name] = {
                    exists_prefix: false,
                    prefixes: [],
                };
            }
            classes[class_data.name].prefixes.push(class_data.prefix);
            if (class_data.prefix) {
                classes[class_data.name].exists_prefix = true;
                exists_prefix = true;
            }
        });

        if (headers.fields) {
            const types = headers.output_field_option_types || [];

            Object.keys(headers.fields).forEach((field_name) => {
                let field = headers.fields[field_name];
                if (field.code) {
                    const [name, method, ...other] = field.code.split('.');
                    if (name && method && !other.length) {
                        const mapper_code = this.code_info.yaml_info.yamlDataByName('mapper-code', name);
                        const { 'class-name': class_name, lang = 'qore' } = mapper_code;
                        field.code = `${class_name}${lang === 'qore' ? '::' : '.'}${method}`;
                    }
                }

                Object.keys(field).forEach((key) => {
                    const type_info = types.find((type) => type.outputField === field_name && type.field === key);
                    if (['list', 'hash'].some((type) => type_info?.type.startsWith(type))) {
                        field[key] = jsyaml.safeLoad(field[key]);
                    }
                });
            });
        }

        let ordered_tags = [];
        const at_the_beginning = ['type', 'name', 'desc'];
        const at_the_end = ['class-connections'];
        at_the_beginning.forEach((tag) => {
            if (headers[tag] !== undefined) {
                ordered_tags.push(tag);
            }
        });
        Object.keys(headers).forEach((tag) => {
            if (![...at_the_beginning, ...at_the_end].includes(tag)) {
                ordered_tags.push(tag);
            }
        });
        at_the_end.forEach((tag) => {
            if (headers[tag] !== undefined) {
                ordered_tags.push(tag);
            }
        });

        for (const tag of ordered_tags) {
            if (
                [
                    'target_dir',
                    'target_file',
                    'methods',
                    'mapper-methods',
                    'orig_name',
                    'method_index',
                    'output_field_option_types',
                    'active_method',
                    'yaml_file',
                    'config-item-values',
                    'class-class-name',
                ].includes(tag)
            ) {
                continue;
            }

            const value = headers[tag];
            if (value === undefined) {
                continue;
            }

            if (Array.isArray(value)) {
                switch (tag) {
                    case 'workflow_options':
                        result += 'options:\n';
                        break;
                    case 'codes':
                        result += 'mapper-code:\n';
                        break;
                    default:
                        result += `${tag}:\n`;
                }

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
                    case 'codes':
                        for (let item of value) {
                            result += `${list_indent}${item.name}\n`;
                        }
                        break;
                    case 'classes':
                    case 'requires':
                        let class_prefixes = exists_prefix ? 'class-prefixes:\n' : '';
                        for (let name in classes) {
                            const class_data = classes[name];
                            result += `${list_indent}${name}\n`;
                            if (class_data.exists_prefix) {
                                for (const prefix of class_data.prefixes) {
                                    class_prefixes += `${list_indent}class: ${name}\n`;
                                    class_prefixes += `${indent}prefix: ${prefix || null}\n`;
                                }
                            }
                        }
                        result += class_prefixes;
                        break;
                    case 'class-connectors':
                        for (const connector of value) {
                            result += `${list_indent}name: ${connector.name}\n`;
                            for (const key in connector) {
                                if (['provider', 'input-provider', 'output-provider'].includes(key) && connector[key]) {
                                    result += `${indent}${key}:\n`;
                                    for (const subkey in connector[key]) {
                                        if (connector[key][subkey] === '') {
                                            result += `${indent}${indent}${subkey}: ""\n`;
                                        } else {
                                            result += `${indent}${indent}${subkey}: ${connector[key][subkey]}\n`;
                                        }
                                    }
                                } else if (
                                    !['name', 'id', 'provider', 'input-provider', 'output-provider'].includes(key)
                                ) {
                                    result += `${indent}${key}: ${connector[key]}\n`;
                                }
                            }
                        }
                        break;
                    case 'resource':
                    case 'text-resource':
                    case 'bin-resource':
                    case 'template':
                        value.forEach(({ name }) => {
                            result += `${list_indent}${path.relative(headers.target_dir, name)}\n`;
                        });
                        break;
                    case 'steps':
                    case 'fsm':
                    case 'triggers':
                        const lines = JSON.stringify(value, null, 4).split('\n');
                        for (let line of lines) {
                            result += `${indent}${line}\n`;
                        }
                        break;
                }
            } else {
                switch (tag) {
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
                    case 'version':
                        result += `${tag}: ${quotesIfNum(value)}\n`;
                        break;
                    case 'type':
                        result += `${tag}: ${value.toLowerCase()}\n`;
                        break;
                    case 'fields':
                    case 'mapper_options':
                    case 'fsm_options':
                    case 'typeinfo':
                    case 'staticdata-type':
                    case 'states':
                    case 'context':
                        result +=
                            `${tag === 'mapper_options' || tag === 'fsm_options' ? 'options' : tag}:\n` +
                            InterfaceCreator.indentYamlDump(value, 1, true);
                        break;
                    case 'desc':
                    case 'description':
                        result += `${tag}: ` + InterfaceCreator.indentYamlDump(value, 0, false);
                        break;
                    case 'processor':
                        result += `${tag}:\n` + InterfaceCreator.indentYamlDump(value, 1, true);
                        break;
                    case 'class-connections':
                        if (!value || !Object.keys(value).length) {
                            break;
                        }
                        result += `${tag}:\n`;
                        for (const connection_name in value) {
                            result += `${indent}${connection_name}:\n`;
                            for (const connector of value[connection_name]) {
                                result += `${indent}${list_indent}class: ${connector.class}\n`;
                                for (const key in connector) {
                                    if (['connector', 'trigger', 'mapper', 'prefix'].includes(key)) {
                                        result += `${indent}${indent}${key}: ${connector[key]}\n`;
                                    }
                                }
                            }
                        }
                        break;
                    case 'class-name':
                        if (headers.type !== 'class') {
                            result += `${tag}: ${value}\n`;
                        }
                        break;
                    default:
                        result += `${tag}: ${value}\n`;
                }
            }
        }

        return result;
    }

    protected static fixClassConnections = (data) => {
        for (const connection in data['class-connections']) {
            for (const connector of data['class-connections'][connection]) {
                const class_name_parts = connector.class.split(':');
                if (class_name_parts[1]) {
                    connector.prefix = class_name_parts[0];
                    connector.class = class_name_parts[1];
                }
                if (connector.mapper) {
                    data.mappers = data.mappers || [];
                    if (!data.mappers.some((mapper) => mapper.name === connector.mapper)) {
                        data.mappers.push({ name: connector.mapper });
                    }
                }
            }
        }
    }

    protected deleteOrigFilesIfDifferent() {
        let files_to_delete: string[] = [];
        if (this.orig_file_path && this.orig_file_path !== this.file_path) {
            files_to_delete.push(this.orig_file_path);
        }
        if (this.orig_yaml_file_path && this.orig_yaml_file_path !== this.yaml_file_path) {
            files_to_delete.push(this.orig_yaml_file_path);
        }

        files_to_delete.forEach((file) => {
            fs.unlink(file, (err) => {
                if (err) {
                    msg.error(t`RemoveFileError ${file} ${err.toString()}`);
                    return;
                }
                msg.info(t`OrigFileRemoved ${file}`);
            });
        });
    }

    static addClassMethods(lines: string[], methods: string[], class_def_range, template, lang): string[] {
        const end: Position = class_def_range.end;

        const lines_before = lines.splice(0, end.line);
        const line = lines.splice(0, 1)[0];
        const line_before = line.substr(0, end.character - 1);
        const line_after = line.substr(end.character - 1);
        const lines_after = lines;

        let new_code = line_before;
        for (let name of methods) {
            new_code += '\n' + InterfaceCreator.fillTemplate(template, lang, undefined, { name }, false);
        }
        const new_code_lines = new_code.split(/\r?\n/);
        if (new_code_lines[new_code_lines.length - 1] === '') {
            new_code_lines.pop();
        }

        return [...lines_before, ...new_code_lines, line_after, ...lines_after];
    }

    static removeClassMethods(lines: string[], methods: string[], method_decl_ranges): string[] {
        const removeRange = (lines, range) => {
            let rows = [];
            for (let i = 0; i < range.start.line; i++) {
                rows.push(lines[i]);
            }
            rows.push(lines[range.start.line].substr(0, range.start.character));
            for (let i = range.end.line + 1; i < lines.length; i++) {
                rows.push(lines[i]);
            }
            return rows;
        };

        const rangesToRemove = [];
        methods.forEach((name) => {
            if (method_decl_ranges?.[name]) {
                rangesToRemove.push(method_decl_ranges[name]);
            }
        });
        sortRanges(rangesToRemove)
            .reverse()
            .forEach((range) => {
                if (range) {
                    lines = removeRange(lines, range);
                }
            });

        return lines;
    }

    static mandatoryStepMethodsCode = (code_info: QorusProjectCodeInfo, base_class_name, lang, skip: string[] = []) => {
        const mandatory_step_methods = mandatoryStepMethods(code_info, base_class_name, lang);

        let method_strings = [];
        const indent = '    ';

        Object.keys(mandatory_step_methods).forEach((method_name) => {
            if (skip.includes(method_name)) {
                return;
            }
            const method_data = mandatory_step_methods[method_name];
            let method_string =
                lang === 'python'
                    ? `${indent}def ${method_data.signature}:\n`
                    : `${indent}${method_data.signature} {\n`;
            if (method_data.body) {
                method_string += `${indent}${indent}${method_data.body}\n`;
            }
            if (lang !== 'python') {
                method_string += `${indent}}\n`;
            }
            method_strings.push(method_string);
        });

        return method_strings.join('\n');
    }

    static fillTemplate = (
        template: string,
        lang: string = 'qore',
        imports: string[] = [],
        vars: any,
        add_default_parse_options: boolean = true
    ): string => {
        let result = add_default_parse_options ? default_parse_options[lang] || '' : '';
        result += removeDuplicates(imports).join('\n');
        if (imports.length) {
            result += '\n\n';
        }
        result += new Function('return `' + template + '`;').call(vars);
        return result;
    }
}
