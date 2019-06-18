import * as vscode from 'vscode';
import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { QorusProject } from './QorusProject';
import { filesInDir, canBeParsed } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';
import { dummy_base_classes } from './dummy_code_info';


const object_parser_command = 'qop.q -i';
const object_chunk_length = 100;

export class QorusProjectCodeInfo {
    private project: QorusProject;
    private pending: boolean = true;
    private code_info: any = {};
    private file_tree: any = {};

    constructor(project: QorusProject) {
        this.project = project;
    }

    getObjects(object_type: string, webview: vscode.Webview) {
        let return_type: string;
        let interval_id: any;

        const getObjectsCheckPending = () => {
            if (this.pending) {
                return;
            }

            clearInterval(interval_id);

            let objects: any[] = [];
            switch (object_type) {
                case 'base-class':
                    return_type = 'objects';
                    objects = dummy_base_classes;
                    break;
                case 'author':
                case 'function':
                case 'class':
                case 'constant':
                case 'mapper':
                case 'value-map':
                    return_type = 'objects';
                    objects = this.code_info[object_type] || [];
                    break;
                case 'resource':
                case 'text-resource':
                case 'bin-resource':
                case 'template':
                    return_type = 'resources';
                    objects = this.file_tree;
                    break;
                default:
                    objects = [];
            }

            webview.postMessage({
                action: 'creator-return-' + return_type,
                object_type,
                [return_type]: objects,
            });
        };

        interval_id = setInterval(getObjectsCheckPending, 200);
    }

    update() {
        this.updateResources();

        this.project.validateConfigFileAndDo(file_data => {
            if (file_data.source_directories.length === 0) {
                this.pending = false;
                return;
            }

            setTimeout(() => {
                this.updateObjects(file_data.source_directories);
            }, 100);

            msg.log(t`CodeInfoUpdateStarted ${this.project.folder}` + ' ' + new Date().toString());
            this.pending = true;
        });
    }

    updateResources() {
        const dirItem = (abs_path: string, is_root: boolean = false) => ({
            abs_path,
            rel_path: is_root ? '.' : vscode.workspace.asRelativePath(abs_path, false),
            files: [],
            dirs: []
        });

        let file_tree: any = dirItem(this.project.folder, true);

        const subDirRecursion = tree_item => {
            const dir_entries: string[] = fs.readdirSync(tree_item.abs_path);
            for (let entry of dir_entries) {
                const entry_path: string = path.join(tree_item.abs_path, entry);
                if (fs.lstatSync(entry_path).isDirectory()) {
                    let dir_item = dirItem(entry_path);
                    tree_item.dirs.push(dir_item);
                    subDirRecursion(dir_item);
                } else {
                    tree_item.files.push({
                        abs_path: tree_item.abs_path,
                        rel_path: vscode.workspace.asRelativePath(tree_item.abs_path, false),
                        name: entry
                    });
                }
            }
        };

        this.project.validateConfigFileAndDo(config_file_data => {
            for (let dir of config_file_data.source_directories) {
                if (!fs.existsSync(dir)) {
                    continue;
                }

                let dir_item = dirItem(path.join(this.project.folder, dir));
                file_tree.dirs.push(dir_item);
                subDirRecursion(dir_item);
            }

            this.file_tree = file_tree;
        });
    }

    private updateObjects(source_directories: string[]) {
        const spaceToDash = str => str.replace(/ /g, '-');

        const types = ['class', 'function', 'constant', 'mapper', 'value map'];

        let code_info: any = {};
        for (let type of types) {
            code_info[spaceToDash(type)] = {};
        }
        code_info.author = {};

        let num_pending = 0;
        let child_process_failed: boolean = false;

        for (let dir of source_directories) {
            if (child_process_failed) {
                break;
            }

            const full_dir = path.join(this.project.folder, dir);
            if (!fs.existsSync(full_dir)) {
                continue;
            }

            let files = filesInDir(full_dir, canBeParsed);

            while (files.length) {
                if (child_process_failed) {
                    break;
                }

                this.pending = true;
                num_pending++;

                let command_parts = files.splice(0, object_chunk_length);
                command_parts.unshift(object_parser_command);
                const command: string = command_parts.join(' ');

                child_process.exec(command, {maxBuffer: 99999999}, (error, stdout, stderr) => {

                    if (error) {
                        msg.error(t`QopError ${error}`);
                        if (stderr) {
                            msg.error(stderr);
                        }
                        this.pending = false;
                        child_process_failed = true;
                        return;
                    }

                    const objects: any[] = JSON.parse(stdout.toString());

                    for (let obj of objects) {
                        const author = obj.tags.author || obj.tags.serviceauthor;
                        if (author) {
                            code_info.author[author] = { name: author };
                        }

                        if (!types.includes(obj.type)) {
                            continue;
                        }
                        if (obj.type === 'function' && obj.tags.type !== 'GENERIC') {
                            continue;
                        }

                        code_info[spaceToDash(obj.type)][obj.tags.name] = {
                            name: obj.tags.name,
                            desc: obj.tags.desc,
                        };
                    }
                    if (--num_pending == 0) {
                        this.code_info = {};
                        for (let obj_type in code_info) {
                            this.code_info[obj_type] = Object.keys(code_info[obj_type]).map(key => code_info[obj_type][key]);
                        }

                        this.pending = false;
                        msg.log(t`CodeInfoUpdateFinished ${this.project.folder}` + ' ' + new Date().toString());
                    }
                });
            }
        }
    }
}
