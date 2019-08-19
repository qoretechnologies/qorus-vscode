import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { fillTemplate } from './creator_common';
import { job_template } from './job_code';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class JobCreator extends InterfaceCreator {
    constructor() {
        super('.qjob');
    }

    edit(data: any, edit_type: string) {
        const header_data = this.init(data);

        const job_info = this.code_info.codeInfo('job', this.file_path);
        const initial_data = qorus_webview.opening_data;

        let contents: string;
        let message: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'create':
                contents = fillTemplate(job_template, this.lang, true, {
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
                code_lines = this.renameClassAndBaseClass(code_lines, job_info, initial_data.job, header_data);
                contents = code_lines.join('\n') + '\n';
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const headers_begin = { type: 'job' };
        const headers_end = { code: this.file_name };
        const headers = JobCreator.createHeaders(Object.assign(headers_begin, header_data, headers_end));

        this.writeFiles(contents, headers);

        if (message) {
            msg.info(message);
        }
    }
}

export const job_creator = new JobCreator();
