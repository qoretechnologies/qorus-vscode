import * as child_process from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { filesInDir, canBeParsed } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';


const object_parser_command = 'qop.q';
const object_chunk_length = 30;

export class QorusProjectCodeInfo {
    private project_folder: string;
    private pending: boolean = false;
    private code_info: any = {};

    constructor(project_folder: string) {
        this.project_folder = project_folder;
    }

    update() {
        new Promise<void>(resolve => {
            setTimeout(() => resolve(this.doAsyncUpdate()), 1000);
        }).then(
            () => {
                this.pending = false;
                msg.log(t`CodeInfoUpdateFinished ${this.project_folder}` + ' ' + new Date().toString());
            },
            error => {
                this.pending = false;
                msg.log(t`CodeInfoUpdateFailed ${this.project_folder}` + ' ' + new Date().toString()
                                            + ' ' + JSON.stringify(error, null, 4));
            }
        );

        msg.log(t`CodeInfoUpdateStarted ${this.project_folder}` + ' ' + new Date().toString());
        this.pending = true;
    }

    private doAsyncUpdate() {
        const spaceToDash = str => str.replace(/ /g, '-');

        const types = ['class', 'function', 'constant', 'mapper', 'value map'];

        let code_info: any = {};
        for (let type of types) {
            code_info[spaceToDash(type)] = {};
        }

        for (let dir of ['src']) {
            if (!fs.existsSync(dir)) {
                continue;
            }

            let files = filesInDir(path.join(this.project_folder, dir), canBeParsed);

            while (files.length) {
                let command_parts = files.splice(0, object_chunk_length);
                command_parts.unshift(object_parser_command);
                const command: string = command_parts.join(' ');

                const result: Buffer = child_process.execSync(command);
                const objects: any[] = JSON.parse(result.toString());
                for (let obj of objects) {
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
            }
        }

        this.code_info = {};
        for (let obj_type in code_info) {
            this.code_info[obj_type] = Object.keys(code_info[obj_type]).map(key => code_info[obj_type][key]);
        }
//        msg.log(JSON.stringify(this.code_info, null, 4));
    }

    get update_pending(): boolean {
        return this.pending;
    }
}
