import { InterfaceCreator } from './InterfaceCreator';
import { subclass_template } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class WorkflowCreator extends InterfaceCreator {
    edit({data, edit_type}) {
        const header_data = this.init(data, '.qwf');

        let contents: string;
        let message: string;
        switch (edit_type) {
            case 'create':
                contents = this.fillTemplate(subclass_template, {
                    class_name: data['class-name'],
                    base_class_name: data['base-class-name'],
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
