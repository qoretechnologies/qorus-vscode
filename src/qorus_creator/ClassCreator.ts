import { InterfaceCreator } from './InterfaceCreator';
import { class_template } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassCreator extends InterfaceCreator {
    constructor() {
        super('.qclass');
    }

    edit(data: any, edit_type: string) {
        const header_data = this.init(data);

        let contents: string;
        let message: string;
        switch (edit_type) {
            case 'create':
                contents = this.fillTemplate(class_template, { class_name: data.name });
                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const headers = ClassCreator.createHeaders({
            type: 'class',
            ...header_data,
            code: this.file_name
        });

        this.writeFiles(contents, headers);

        if (message) {
            msg.info(message);
        }
    }
}

export const class_creator = new ClassCreator();
