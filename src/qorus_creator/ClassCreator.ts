import { InterfaceCreator } from './InterfaceCreator';
import { class_template, subclass_template } from './common_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassCreator extends InterfaceCreator {
    edit(data: any, edit_type: string, iface_kind: string) {
        const header_data = this.init(data, '.q' + iface_kind);

        let contents: string;
        let message: string;
        switch (edit_type) {
            case 'create':
                contents = data['base-class-name']
                    ?   this.fillTemplate(subclass_template, {
                            class_name: data['class-name'],
                            base_class_name: data['base-class-name']
                        })
                    :   this.fillTemplate(class_template, { class_name: data['class-name'] });
                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        const headers = ClassCreator.createHeaders({
            type: iface_kind,
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
