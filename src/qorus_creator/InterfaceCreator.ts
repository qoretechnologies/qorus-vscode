import { workspace, window, Position } from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { projects } from '../QorusProject';
import { QorusProjectCodeInfo } from '../QorusProjectCodeInfo';
import { lang_suffix, default_parse_options } from './common_constants';
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
            ? path.basename(target_file, this.suffix)
            : `${data.name}-${data.version}`;

        return other_data;
    }

    edit(params: any) {
        this.code_info = projects.currentProjectCodeInfo();
        if (params.orig_data) {
            this.code_info.setPending('edit_info', true);
            const orig_file = path.join(params.orig_data.target_dir, params.orig_data.target_file);
            this.code_info.addFileCodeInfo(orig_file).then(() => {
                this.editImpl(params);
                this.code_info.setPending('edit_info', false);
            });
        }
        else {
            this.editImpl(params);
        }
    }

    protected abstract editImpl(params: any);

    protected get file_name() {
        return `${this.file_base}${this.suffix}${lang_suffix[this.lang]}`;
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

    protected writeFiles(contents: string, headers: string, open_file_on_success: boolean = true) {
        fs.writeFile(this.file_path, contents, err => {
            if (err) {
                msg.error(t`WriteFileError ${this.file_path} ${err.toString()}`);
                return;
            }

            const generated_file_info = '# This is a generated file, don\'t edit!\n';

            fs.writeFile(this.yaml_file_path, generated_file_info + headers, err => {
                if (err) {
                    msg.error(t`WriteFileError ${this.yaml_file_path} ${err.toString()}`);
                    return;
                }

                if (open_file_on_success) {
                    workspace.openTextDocument(this.file_path).then(doc => window.showTextDocument(doc));
                }
            });
        });
    }

    protected static renameClassAndBaseClass(
            lines: string[],
            code_info: any,
            orig_data: any,
            header_data): string[]
    {
        const orig_class_name = orig_data['class-name'];
        const orig_base_class_name = orig_data['base-class-name'];
        const class_name = header_data['class-name'];
        const base_class_name = header_data['base-class-name'];

        const replace = (position: Position, orig_name: string, name: string) => {
            let chars = lines[position.line].split('');
            chars.splice(position.character, orig_name.length, name);
            lines[position.line] = chars.join('');
        }

        if (base_class_name !== orig_base_class_name) {
            replace(code_info.base_class_name_range.start, orig_base_class_name, base_class_name);
        }
        if (class_name !== orig_class_name) {
            replace(code_info.class_name_range.start, orig_class_name, class_name);
        }
        return lines;
    }

    protected static createHeaders = (headers: any): string => {
        const list_indent = '  - ';
        const indent = '    ';
        let result: string = '';

        delete headers['base-class-name'];

        for (const tag in headers) {
            const value = headers[tag];
            if (typeof(value) === 'undefined') {
                continue;
            }

            if (Array.isArray(value)) {
                result += tag === 'steps' ? `${tag}: >-\n` : `${tag}:\n`;
                switch (tag) {
                    case 'groups':
                        for (let item of value) {
                            result += `${list_indent}${item.name}\n`;
                        }
                        break;
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
                    case 'classes':
                    case 'constants':
                    case 'functions':
                    case 'vmaps':
                    case 'mappers':
                        for (let item of value) {
                            result += `${list_indent}${item.name}\n`;
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

        const yaml_info = this.code_info.yaml_info_by_file[orig_file];
        const orig_yaml_file = yaml_info && yaml_info.yaml_file;

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
