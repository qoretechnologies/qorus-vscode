import { t } from 'ttag';
import * as msg from './qorus_message';


export class QorusProjectCodeInfo {
    private project_folder: string;
    private pending: boolean = false;

    constructor(project_folder: string) {
        this.project_folder = project_folder;
//        this.update();
    }

    update() {
        setTimeout(this.doAsyncUpdate, 0);

        msg.log(t`CodeInfoUpdateStarted ${this.project_folder}`);
        this.pending = true;
    }

    private doAsyncUpdate() {
        let s = 0, p = -1;
        for (let i = 1; i < 3000000000; i++, p = -p) {
            s += p * i;
        }
        this.pending = false;
        msg.log(t`CodeInfoUpdateFinished ${this.project_folder}`);
        return s;
    }

    get update_pending(): boolean {
        return this.pending;
    }
}
