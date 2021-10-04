import * as fs from 'fs';
import * as jsyaml from 'js-yaml';
import * as path from 'path';
import { t } from 'ttag';
import { Position } from 'vscode';
import * as globals from '../global_config_item_values';
import { isLangClientAvailable } from '../qore_vscode';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { qorus_webview } from '../QorusWebview';
import { default_lang, default_version, types_with_version } from '../qorus_constants';
import * as msg from '../qorus_message';
import {
    capitalize,
    deepCopy,
    isValidIdentifier,
    removeDuplicates,
    sortRanges,
} from '../qorus_utils';
import { default_parse_options, field } from './common_constants';
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
    protected is_editable = false;

    protected setPaths(
        data: any,
        orig_data: any,
        suffix: string,
        iface_kind: string,
        recreate?: boolean,
        iface_id?: string,
        edit_type?: string
    ): any {
        this.file_edit_info = undefined;
        this.suffix = suffix || '';

        let { target_dir, target_file } = data;

        let orig_target_dir, orig_target_file;
        if (orig_data) {
            ({ target_dir: orig_target_dir, target_file: orig_target_file } = orig_data);
        } else if (recreate && iface_id) {
            const info_by_id = this.code_info.interface_info.getInfo(iface_id);

            ({ target_dir: orig_target_dir, target_file: orig_target_file } = info_by_id);
            this.code_info.interface_info.deleteInfo(iface_id);
        }

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
                this.yaml_file_base =
                    data.version !== undefined ? `${data.name}-${data.version}` : data.name;
                this.target_subdir = iface_kind
                    ? `${this.yaml_file_base
                          .replace(/\./g, '_')
                          .replace(/\-/g, '_')}_${iface_kind}`.toLowerCase()
                    : this.yaml_file_base.toLowerCase();
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
                        'qvmap',
                        'qmc',
                        'qevent',
                        'qgroup',
                        'qqueue',
                        'qfsm',
                        'qpipe',
                        'qconn',
                        'qerrors',
                    ].forEach((suffix) => {
                        this.file_base = path.basename(this.file_base, `.${suffix}`);
                    });
                } else {
                    this.file_base =
                        data.version !== undefined ? `${data.name}-${data.version}` : data.name;
                }
                this.yaml_file_base = this.file_base;
                this.target_subdir = '';
        }

        if (orig_target_dir && orig_target_file) {
            const orig_path = path.join(orig_target_dir, orig_target_file);
            if (this.had_code) {
                this.orig_file_path = orig_path;
                this.orig_yaml_file_path =
                    this.code_info.yaml_info.yamlDataBySrcFile(orig_path)?.yaml_file;
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

    async edit(params: any) {
        this.lang = params.data?.lang || default_lang;
        this.is_editable = this.lang !== 'qore' || (await isLangClientAvailable());
        this.code_info = projects.currentProjectCodeInfo();

        // https://github.com/qoretechnologies/qorus-vscode/issues/740
        // if there is no target_file name in the original data, treat as create
        if (params.recreate || !params.orig_data?.target_file) {
            params.edit_type = 'create';
            // https://github.com/qoretechnologies/qorus-vscode/issues/743
            // do not delete orig_data here, otherwise the original context is lost
            this.editImpl(params);
            return;
        }

        if (params.orig_data) {
            if (path.extname(params.orig_data.target_file) === '.yaml') {
                this.editImpl(params);
                return;
            }

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

    protected writeYamlFile(headers: string, file_path?: string): any {
        const generated_file_info = "# This is a generated file, don't edit!\n";
        file_path = file_path || this.yaml_file_path;

        try {
            fs.writeFileSync(file_path, generated_file_info + headers);
        } catch (err) {
            const message = t`WriteFileError ${file_path} ${err.toString()}`;
            msg.error(message);
            return { ok: false, message };
        }

        return { ok: true };
    }

    protected writeFiles(contents: string, headers: string): any {
        contents = contents.replace(/(\t| )+\n/g, '\n');
        while (contents.match(/\n\n\n/)) {
            contents = contents.replace(/\n\n\n/g, '\n\n');
        }
        contents.replace(/\n\n$/, '\n');
        if (contents[contents.length - 1] !== '\n') {
            contents += '\n';
        }

        let { ok, message } = this.writeYamlFile(headers);
        if (!ok) {
            return { ok: false, message };
        }

        try {
            const true_target_dir = path.join(this.target_dir, this.target_subdir);
            if (!fs.existsSync(true_target_dir)) {
                fs.mkdirSync(true_target_dir);
            }

            fs.writeFileSync(this.file_path, contents);
        } catch (err) {
            message = t`WriteFileError ${this.file_path} ${err.toString()}`;
            msg.error(message);
            return { ok: false, message };
        }

        return { ok: true };
    }

    protected returnData = (data: any, iface_id: string) => {
        const fixed_data = this.code_info.yaml2FrontEnd(data);

        let iface_kind = fixed_data.type;

        const initial_data = {
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: { ...fixed_data, iface_id },
        };

        if (this.file_path) {
            this.code_info.edit_info
                .setFileInfo(this.file_path, fixed_data)
                .then(() => qorus_webview.setInitialData(initial_data, true));
        } else {
            qorus_webview.setInitialData(initial_data, true);
        }
    };

    protected checkData = (params: any): any => {
        const items_to_check = ['checkExistingInterface', 'checkClassName'];
        for (const item_to_check of items_to_check) {
            const { ok, message } = this[item_to_check](params);
            if (!ok) {
                return { ok, message };
            }
        }
        return { ok: true };
    };

    protected checkClassName = (params: any): any => {
        const {
            data: { 'class-name': class_name },
        } = params;
        if (!class_name || isValidIdentifier(class_name)) {
            return { ok: true };
        }
        return { ok: false, message: t`InvalidClassName ${class_name}` };
    };

    protected checkExistingInterface = (params: any): any => {
        let {
            iface_kind,
            edit_type,
            data: { name, version, 'class-name': class_name },
            orig_data,
            recreate,
        } = params;

        if (recreate || !['create', 'edit'].includes(edit_type)) {
            return { ok: true };
        }

        const {
            name: orig_name,
            version: orig_version,
            'class-name': orig_class_name,
        } = orig_data || {};

        const with_version = types_with_version.includes(iface_kind);

        const iface_name = with_version ? `${name}:${version || default_version}` : name;
        const orig_iface_name = with_version
            ? `${orig_name}:${orig_version || default_version}`
            : orig_name;

        if (iface_name !== orig_iface_name) {
            const iface = this.code_info.yaml_info.yamlDataByName(iface_kind, iface_name);
            if (iface) {
                return {
                    ok: false,
                    message: t`IfaceAlreadyExists ${capitalize(iface_kind)} ${iface_name}`,
                };
            }
        }
        if (
            class_name &&
            class_name !== orig_class_name &&
            !['class', 'mapper-code'].includes(iface_kind)
        ) {
            const iface = this.code_info.yaml_info.yamlDataByClass(iface_kind, class_name);
            if (iface) {
                return {
                    ok: false,
                    message: t`ClassAlreadyExists ${capitalize(iface_kind)} ${class_name}`,
                };
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
    };

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
        const has_other_base_class =
            num_inherited > 1 || (num_inherited > 0 && main_base_class_ord === -1);

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
            const strings_to_erase = [
                ` ${inherits_before}`,
                `${inherits_before} `,
                `${inherits_before}`,
            ];

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
                    n === main_base_class_name_range.start.line
                        ? main_base_class_name_range.end.character
                        : 0;
                for (const string_to_erase of [`${str} `, `${str}`]) {
                    const pos = lines[n].indexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] =
                            lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseStrBeforeBaseClassName = (str: string) => {
            for (let n = main_base_class_name_range.start.line; n >= first_base_class_line; n--) {
                const pos_from =
                    n === main_base_class_name_range.start.line
                        ? main_base_class_name_range.start.character
                        : 0;
                for (const string_to_erase of [`${str} `, `${str}`]) {
                    const pos = lines[n].lastIndexOf(string_to_erase, pos_from);
                    if (pos > -1) {
                        lines[n] =
                            lines[n].substr(0, pos) + lines[n].substr(pos + string_to_erase.length);
                        return;
                    }
                }
            }
        };

        const eraseBaseClassName = (without_space: boolean = false) => {
            const n = main_base_class_name_range.start.line;
            const pos = main_base_class_name_range.start.character;
            const length =
                main_base_class_name_range.end.character -
                main_base_class_name_range.start.character;

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
                replace(
                    class_name_range.end,
                    '',
                    `${inherits_kw.before}${base_class_name}${inherits_kw.after}`
                );
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
        const isImportLine = (line: string): boolean => {
            switch (this.lang) {
                case 'java':
                    return !!line.match(/^import /);
                case 'python':
                    return !!line.match(/^from\s+\S+\s+import /);
                default:
                    return false;
            }
        };

        const existing_import_lines: string[] = code_lines.filter((line) => isImportLine(line));
        let import_lines_to_add: string[] = imports.filter(
            (line) => !existing_import_lines.includes(line)
        );

        if (!existing_import_lines.length && import_lines_to_add.length) {
            import_lines_to_add.push('');
        }
        return [...import_lines_to_add, ...code_lines];
    };

    private static indentYamlDump = (
        value: any,
        indent_level: number,
        is_on_new_line: boolean = false
    ) => {
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
    };

    public static checkParentConfigItem = (
        name: string,
        parent_type: string,
        parent_name: string,
        code_info: any
    ): boolean => {
        const parent_yaml_data = code_info.yaml_info.yamlDataByName(parent_type, parent_name);
        if (!parent_yaml_data) {
            return false;
        }

        const parent_item = parent_yaml_data['config-items'].find((item) => item.name === name);
        if (!parent_item) {
            return false;
        }
        if (!parent_item.parent) {
            return true;
        }

        return InterfaceCreator.checkParentConfigItem(
            name,
            parent_item.parent['interface-type'],
            parent_item.parent['interface-name'],
            code_info
        );
    };

    protected static createConfigItemHeaders = (
        items: any[],
        indent_level = 0,
        code_info: any
    ): string => {
        let result: string = `${indent.repeat(indent_level)}config-items:\n`;

        items = items.filter((item) =>
            InterfaceCreator.checkParentConfigItem(
                item.name,
                item.parent['interface-type'],
                item.parent['interface-name'],
                code_info
            )
        );

        for (const item of [...items]) {
            result += `${indent.repeat(indent_level)}${list_indent}name: ${item.name}\n`;

            if (item['global-value']) {
                globals.set(item);
            }
            if (item['remove-global-value']) {
                globals.remove(item.name);
            }

            for (const tag of ['value', 'local-value', 'default_value']) {
                if (
                    item[tag] !== undefined &&
                    (!item.parent_data || item.parent_data[tag] !== item[tag])
                ) {
                    result += `${indent.repeat(indent_level + 1)}${
                        tag === 'local-value' ? 'value' : tag
                    }:\n`;

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
                            result +=
                                lines
                                    .map((str) => `${indent.repeat(indent_level + 1)}  ${str}`)
                                    .join('\n') + '\n';
                        } else {
                            result +=
                                lines
                                    .map((str) => `${indent.repeat(indent_level + 2)}${str}`)
                                    .join('\n') + '\n';
                        }
                    } else {
                        result += `${indent.repeat(indent_level + 2)}${JSON.stringify(
                            item[tag]
                        )}\n`;
                    }
                }
            }

            if (item.parent) {
                result += `${indent.repeat(indent_level + 1)}parent:\n`;
                for (const tag in item.parent) {
                    result += `${indent.repeat(
                        indent_level + 2
                    )}${tag}: ${InterfaceCreator.indentYamlDump(item.parent[tag].toString(), 0)}`;
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

                const has_parent_data: boolean =
                    (item.parent_data || false) && item.parent_data[tag] !== undefined;

                if (
                    (!has_parent_data && item[tag] !== defaultValue(tag)) ||
                    (has_parent_data && item[tag] !== item.parent_data[tag])
                ) {
                    if (Array.isArray(item[tag])) {
                        result += `${indent.repeat(indent_level + 1)}${tag}:\n`;
                        for (let entry of item[tag]) {
                            result += `${indent.repeat(
                                indent_level + 1
                            )}${list_indent}${JSON.stringify(entry)}\n`;
                        }
                    } else {
                        switch (tag) {
                            case 'type':
                                result +=
                                    `${indent.repeat(indent_level + 1)}type: ` +
                                    (item.type[0] === '*' ? `"${item.type}"` : item.type) +
                                    '\n';
                                break;
                            case 'description':
                                result +=
                                    `${indent.repeat(indent_level + 1)}${tag}: ` +
                                    InterfaceCreator.indentYamlDump(item[tag], 1);
                                break;
                            default:
                                result += `${indent.repeat(indent_level + 1)}${tag}: ${
                                    item[tag]
                                }\n`;
                        }
                    }
                }
            }
        }

        return result;
    };

    protected createHeaders = (headers: any, iface_id: string, iface_kind?: string): string => {
        let result: string = '';

        const classes_or_requires = headers.type === 'class' ? 'requires' : 'classes';
        headers[classes_or_requires] = this.code_info.interface_info.addClassNames(
            headers[classes_or_requires]
        );

        const base_class_name = headers['base-class-name'];

        if (base_class_name && !QorusProjectCodeInfo.isRootBaseClass(base_class_name)) {
            headers[classes_or_requires] = headers[classes_or_requires] || [];
            if (
                !headers[classes_or_requires].some(
                    (class_data) =>
                        class_data['class-name'] === base_class_name && !class_data.prefix
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
                    const [name, method, ...other] = field.code.split('::');
                    if (name && method && !other.length) {
                        const mapper_code = this.code_info.yaml_info.yamlDataByName(
                            'mapper-code',
                            name
                        );
                        field.code = `${mapper_code.name}::${method}`;
                    }
                }

                Object.keys(field).forEach((key) => {
                    const type_info = types.find(
                        (type) => type.outputField === field_name && type.field === key
                    );
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

        const iface_data = this.code_info.interface_info.getInfo(iface_id);

        const fixOptions = (value: any): any => {
            Object.keys(value.options || {}).forEach((option_key) => {
                let option_value = value.options[option_key];
                const option_type = option_value.type || '';
                if (option_type.indexOf('list') > -1 || option_type.indexOf('hash') > -1) {
                    option_value.value = jsyaml.safeLoad(option_value.value);
                }
            });

            return value;
        };

        for (const tag of ordered_tags) {
            if (
                [
                    'iface_id',
                    'target_dir',
                    'target_file',
                    'methods',
                    'mapper-methods',
                    'orig_name',
                    'method_index',
                    'output_field_option_types',
                    'active_method',
                    'yaml_file',
                    'config-items',
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
                    case 'errors_errors':
                        result += 'errors:\n';
                        break;
                    case 'children':
                        break;
                    default:
                        result += `${tag}:\n`;
                }

                switch (tag) {
                    case 'tags':
                    case 'workflow_options':
                    case 'define-auth-label':
                    case 'statuses':
                        const [key_name, value_name] = field[tag].fields;
                        for (let item of value) {
                            if (tag === 'tags') {
                                item[value_name] = item[value_name].toString();
                            }
                            result += `${indent}${
                                item[key_name]
                            }: ${InterfaceCreator.indentYamlDump(item[value_name], 0)}`;
                        }
                        break;
                    case 'value-maps':
                        const [key_name_2, value_name_2] = field[tag].fields;
                        for (let item of value) {
                            result +=
                                `${indent}${item[key_name_2]}:\n` +
                                `${indent}${indent}value: ${item[value_name_2]}\n` +
                                `${indent}${indent}enabled: true\n`;
                        }
                        break;
                    case 'author':
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
                                if (
                                    ['provider', 'input-provider', 'output-provider'].includes(
                                        key
                                    ) &&
                                    connector[key]
                                ) {
                                    connector[key] = fixOptions(connector[key]);
                                    result +=
                                        `${indent}${key}:\n` +
                                        InterfaceCreator.indentYamlDump(connector[key], 2, true);
                                } else if (
                                    ![
                                        'name',
                                        'id',
                                        'provider',
                                        'input-provider',
                                        'output-provider',
                                    ].includes(key)
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
                            result += `${list_indent}${path
                                .relative(headers.target_dir, name)
                                .replace(/\\/g, '/')}\n`;
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
                    case 'errors_errors':
                        value.forEach((error) => {
                            result += `${list_indent}name: ${error.name}\n`;
                            Object.keys(error).forEach((key) => {
                                if (!['name', 'orig_name'].includes(key)) {
                                    result +=
                                        `${indent}${key}: ` +
                                        InterfaceCreator.indentYamlDump(error[key], 0);
                                }
                            });
                        });
                        break;
                    case 'children':
                        const dumpChildren = (
                            children: any[] | undefined,
                            indent_level: number
                        ) => {
                            if (!children?.length) {
                                return;
                            }

                            result += `${indent.repeat(indent_level)}children:\n`;
                            children.forEach((child) => {
                                dumpChild(child, indent_level);
                            });
                        };
                        const dumpChild = (child: any, indent_level: number) => {
                            result += `${indent.repeat(indent_level)}${list_indent}type: ${
                                child.type
                            }\n`;
                            if (child.name) {
                                result += `${indent.repeat(indent_level + 1)}name: ${child.name}\n`;
                            }
                            if (child.pid) {
                                result += `${indent.repeat(indent_level + 1)}pid: ${child.pid}\n`;
                                if (
                                    iface_data?.specific_data?.[child.pid]?.['config-items']?.length
                                ) {
                                    result += InterfaceCreator.createConfigItemHeaders(
                                        iface_data.specific_data[child.pid]['config-items'],
                                        indent_level + 1,
                                        this.code_info
                                    );
                                }
                            }
                            dumpChildren(child.children, indent_level + 1);
                        };

                        dumpChildren(value, 0);
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
                    case 'workflow_errors':
                        const file_name = this.code_info.yaml_info.yamlDataByName(
                            'errors',
                            value
                        )?.yaml_file;
                        const relative_file_name = path.relative(headers.target_dir, file_name);
                        result += `errors: ${relative_file_name}\n`;
                        break;
                    case 'version':
                    case 'scaling-memory':
                    case 'container-memory-request':
                    case 'container-memory-limit':
                        result += `${tag}: ${InterfaceCreator.indentYamlDump(value.toString(), 0)}`;
                        break;
                    case 'type':
                        result += `${tag}: ${value.toLowerCase()}\n`;
                        break;
                    case 'fields':
                    case 'mapper_options':
                    case 'input-provider-options':
                    case 'fsm_options':
                    case 'connection_options':
                    case 'system-options':
                    case 'typeinfo':
                    case 'staticdata-type':
                    case 'input-provider':
                    case 'context':
                        let fixed_value;
                        if (['staticdata-type', 'input-provider'].includes(tag)) {
                            fixed_value = fixOptions(value);
                        } else {
                            fixed_value = value;
                        }

                        if (tag === 'mapper_options') {
                            ['mapper-input', 'mapper-output'].forEach((key) => {
                                if (value[key]) {
                                    fixed_value[key] = fixOptions(value[key]);
                                }
                            });
                        }

                        result +=
                            `${
                                ['mapper_options', 'fsm_options', 'connection_options'].includes(
                                    tag
                                )
                                    ? 'options'
                                    : tag
                            }:\n` + InterfaceCreator.indentYamlDump(fixed_value, 1, true);
                        break;
                    case 'states':
                        const dumpStates = (states: any = {}, indent_level: number) => {
                            const ids = Object.keys(states);
                            if (!ids.length) {
                                return;
                            }

                            result += `${indent.repeat(indent_level)}states:\n`;
                            ids.forEach((id) => {
                                dumpState(id, states[id], indent_level);
                            });
                        };
                        const dumpState = (id: string, state: any, indent_level: number) => {
                            const cloned_state = deepCopy(state);
                            delete cloned_state['config-items'];
                            delete cloned_state['orig-config-items'];
                            delete cloned_state.class_name;
                            delete cloned_state.states;

                            ['input-type', 'output-type'].forEach((key) => {
                                if (cloned_state[key]) {
                                    cloned_state[key] = fixOptions(cloned_state[key]);
                                }
                            });

                            result +=
                                `${indent.repeat(indent_level + 1)}'${id}':\n` +
                                InterfaceCreator.indentYamlDump(
                                    cloned_state,
                                    indent_level + 2,
                                    true
                                );

                            if (
                                state.id &&
                                iface_data?.specific_data?.[state.id]?.['config-items']?.length
                            ) {
                                result += InterfaceCreator.createConfigItemHeaders(
                                    iface_data.specific_data[state.id]['config-items'],
                                    indent_level + 2,
                                    this.code_info
                                );
                            }

                            dumpStates(state.states, indent_level + 2);
                        };

                        dumpStates(value, 0);
                        break;
                    case 'desc':
                    case 'description':
                        result += `${tag}: ` + InterfaceCreator.indentYamlDump(value, 0);
                        break;
                    case 'processor':
                        let processor_value = {};
                        ['processor-input-type', 'processor-output-type'].forEach((key) => {
                            if (value[key]) {
                                processor_value[key] = fixOptions(value[key]);
                            }
                        });
                        result +=
                            `${tag}:\n` + InterfaceCreator.indentYamlDump(processor_value, 1, true);
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
                                    if (
                                        ['connector', 'trigger', 'mapper', 'prefix'].includes(key)
                                    ) {
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

        if (iface_data?.['config-items']?.length) {
            result += InterfaceCreator.createConfigItemHeaders(
                iface_data['config-items'],
                undefined,
                this.code_info
            );
        }

        if (iface_kind === 'workflow' && iface_data?.['config-item-values']?.length) {
            result += jsyaml
                .safeDump(
                    { 'config-item-values': iface_data['config-item-values'] },
                    { indent: 2, skipInvalid: true }
                )
                .replace(/\r?\n  -\r?\n/g, '\n  - ');
        }

        return result;
    };

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
    };

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

    static addClassMethods(
        lines: string[],
        methods: string[],
        class_def_range,
        template,
        lang
    ): string[] {
        const end: Position = class_def_range.end;

        const lines_before = lines.splice(0, end.line);
        const line = lines.splice(0, 1)[0];
        const line_before = line && line.substr(0, end.character - 1);
        const line_after = (line && line.substr(end.character - 1)) || '';
        const lines_after = lines;

        let new_code = line_before || '';
        for (let name of methods) {
            new_code +=
                '\n' + InterfaceCreator.fillTemplate(template, lang, undefined, { name }, false);
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
            const range_end_line_part = lines[range.end.line]?.substr(range.end.character);
            if (range_end_line_part) {
                rows.push(' '.repeat(range.end.character) + range_end_line_part);
            }
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

    static mandatoryStepMethodsCode = (
        code_info: QorusProjectCodeInfo,
        base_class_name,
        lang,
        skip: string[] = []
    ) => {
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
    };

    static fillTemplate = (
        template: string,
        lang: string = default_lang,
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
    };
}
