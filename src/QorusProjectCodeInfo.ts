import * as child_process from 'child_process';
import { t } from 'ttag';
import * as msg from './qorus_message';


const object_parser_command = 'qop.q';

export class QorusProjectCodeInfo {
    private project_folder: string;
    private pending: boolean = false;
//    private code_info: any = {};

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
        let command_parts: string[] = this.allProjectSourceFiles();
        command_parts.unshift(object_parser_command);
        const command: string = command_parts.join(' ');

        const result: Buffer = child_process.execSync(command);
        const objects: any[] = JSON.parse(result.toString());
        msg.log('objects: ' + JSON.stringify(objects, null, 4));







        this.pending = false;
        msg.log(t`CodeInfoUpdateFinished ${this.project_folder}`);
    }

    get update_pending(): boolean {
        return this.pending;
    }

    private allProjectSourceFiles(): string[] {
        return ['/home/martin/src/drei/erp-quk/src/010-RECODE_ADJUSTMENT-ANOVO-IN/uk-010-recode_adjustment-anovo-in.qsd'];
    }
}
