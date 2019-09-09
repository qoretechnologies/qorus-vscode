import { InterfaceCreator } from './InterfaceCreator';
import { subclass_template } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class WorkflowCreator extends InterfaceCreator {
    constructor() {
        super('.qclass');
    }

    edit(data: any, edit_type: string) {
        msg.debug({data});
        const header_data = this.init(data);

        let contents: string;
        let message: string;
        switch (edit_type) {
            case 'create':
                contents = this.fillTemplate(subclass_template, {
                    class_name: data.class_name,
                    base_class_name: data.base_class_name,
                });
                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const headers = WorkflowCreator.createHeaders({
            type: 'workflow',
            ...header_data,
            code: this.file_name
        });

        this.writeFiles(contents, headers);

        if (message) {
            msg.info(message);
        }
    }
}

export const workflow_creator = new WorkflowCreator();
