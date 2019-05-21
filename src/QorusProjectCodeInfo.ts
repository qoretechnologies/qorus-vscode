import * as msg from './qorus_message';


export class QorusProjectCodeInfo {
    private project_folder: string;
    private pending: boolean = false;

    constructor(project_folder: string) {
        this.project_folder = project_folder;
//        this.update();
    }

    update() {
        new Promise(resolve => setTimeout(() => resolve(this.doAsyncUpdate()), 0)).then(
            s => {
                msg.log(this.project_folder + ' - code info update finished succesfully: ' + s);
                this.pending = false;
            },
            e => {
                msg.log(this.project_folder + ' - code info update failed: ' + JSON.stringify(e, null, 4));
                this.pending = false;
            }
        );

        msg.log(this.project_folder + ' - code info update started');
        this.pending = true;
    }

    private doAsyncUpdate() {
        let s = 0, p = -1;
        for (let i = 1; i < 3000000000; i++, p = -p) {
            s += p * i;
        }
        return s;
    }

    get update_pending(): boolean {
        return this.pending;
    }
}
