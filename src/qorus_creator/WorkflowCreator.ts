import * as path from 'path';
import { InterfaceCreator } from './InterfaceCreator';
import { subclass_template } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class WorkflowCreator extends InterfaceCreator {
    constructor() {
        super('.qclass');
    }

    private get wf_yaml_file_name() {
        return `${this.file_base}.yaml`;
    }

    private get wf_yaml_file_path() {
        return path.join(this.target_dir, this.wf_yaml_file_name);
    }

    edit(data: any, edit_type: string) {
        const wf_header_data = this.init(data);

        let contents: string;
        let message: string;
        switch (edit_type) {
            case 'create':
                contents = this.fillTemplate(subclass_template, {
                    class_name: data.class_name,
                    base_class_name: data.base_class_name,
                });
                message = t`3FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.wf_yaml_file_name} ${this.target_dir}`;
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const wf_headers = WorkflowCreator.createHeaders({
            type: 'workflow',
            ...wf_header_data,
            class: `${wf_header_data.name}:${wf_header_data.version}`
        });

        let header_data = (({name, version, desc, author, lang}) =>
                           ({name, version, desc, author, lang}))(wf_header_data);
        const headers = WorkflowCreator.createHeaders({
            type: 'class',
            ...header_data,
            code: this.file_name
        });

        this.writeFiles(contents, headers, wf_headers, this.wf_yaml_file_path);

        if (message) {
            msg.info(message);
        }
    }
}

export const workflow_creator = new WorkflowCreator();
