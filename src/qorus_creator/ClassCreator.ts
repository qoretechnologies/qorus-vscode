import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { class_template, subclass_template } from './common_constants';
import { job_template } from './job_constants';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassCreator extends InterfaceCreator {
    edit(data: any, edit_type: string, iface_kind: string) {
        let template: any;
        let suffix: string;
        switch (iface_kind) {
            case 'job':
                template = job_template;
                suffix = '.qjob';
                break;
            case 'step':
                template = subclass_template;
                suffix = '.qstep';
                break;
            case 'class':
                template = data['base-class-name'] ? subclass_template : class_template;
                suffix = '.qclass';
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'ClassCreator'}`);
        }

        const header_data = this.init(data, suffix);

        const initial_data = qorus_webview.opening_data;
        const iface_info = this.code_info.codeInfo(iface_kind,
                                                   ClassCreator.origPath(initial_data[iface_kind]) || this.file_path);

        let contents: string;
        let message: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'create':
                contents = data['base-class-name']
                    ?   this.fillTemplate(template, {
                            class_name: data['class-name'],
                            base_class_name: data['base-class-name']
                        })
                    :   this.fillTemplate(template, { class_name: data['class-name'] });
                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                if (!initial_data[iface_kind]) {
                    msg.error(t`MissingEditData`);
                    return;
                }
                code_lines = iface_info.text_lines;
                code_lines = ClassCreator.renameClassAndBaseClass(code_lines,
                                                                  iface_info,
                                                                  initial_data[iface_kind],
                                                                  header_data);
                contents = code_lines.join('\n') + '\n';
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

        delete data.yaml_file;
        qorus_webview.opening_data = {
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: data
        };

        this.deleteOrigFilesIfDifferent(initial_data[iface_kind]);
    }
}

export const class_creator = new ClassCreator();
