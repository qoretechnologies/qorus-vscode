import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { job_template } from './job_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class JobCreator extends InterfaceCreator {
    constructor() {
        super('.qjob');
    }

    edit(data: any, edit_type: string) {
        const header_data = this.init(data);

        const initial_data = qorus_webview.opening_data;
        const job_info = this.code_info.codeInfo('job', JobCreator.origPath(initial_data.job) || this.file_path);

        let contents: string;
        let message: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'create':
                contents = this.fillTemplate(job_template, {
                    class_name: data.class_name,
                    base_class_name: data.base_class_name,
                });
                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                if (!initial_data.job) {
                    msg.error(t`MissingEditData`);
                    return;
                }
                code_lines = job_info.text_lines;
                code_lines = JobCreator.renameClassAndBaseClass(code_lines, job_info, initial_data.job, header_data);
                contents = code_lines.join('\n') + '\n';
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const headers = JobCreator.createHeaders({
            type: 'job',
            ...header_data,
            code: this.file_name
        });

        this.writeFiles(contents, headers);

        if (message) {
            msg.info(message);
        }

        delete data.yaml_file;
        qorus_webview.opening_data = {
            tab: 'CreateInterface',
            subtab: 'job',
            job: data
        };

        this.deleteOrigFilesIfDifferent(initial_data.job);
    }
}

export const job_creator = new JobCreator();
