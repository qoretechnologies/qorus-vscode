import * as child_process from 'child_process';
import { filesInDir, canBeParsed } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';


const object_parser_command = 'qop.q';
const object_chunk_length = 10;

export class QorusProjectCodeInfo {
    private project_folder: string;
    private pending: boolean = false;

    constructor(project_folder: string) {
        this.project_folder = project_folder;
//        this.update();
    }

    update() {
        setTimeout(() => this.doAsyncUpdate(), 0);

        msg.log(t`CodeInfoUpdateStarted ${this.project_folder}`);
        this.pending = true;
    }

    private doAsyncUpdate() {
        let files = filesInDir(this.project_folder, canBeParsed);
        while (files.length) {
            let command_parts = files.splice(0, object_chunk_length);
            command_parts.unshift(object_parser_command);
            const command: string = command_parts.join(' ');
            msg.log('command: ' + command);

            const result: Buffer = child_process.execSync(command);
            const objects: any[] = JSON.parse(result.toString());
            msg.log('objects: ' + JSON.stringify(objects, null, 4));




        }

        this.pending = false;
        msg.log(t`CodeInfoUpdateFinished ${this.project_folder}`);
    }

    get update_pending(): boolean {
        return this.pending;
    }
}
