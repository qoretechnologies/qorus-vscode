import * as path from 'path';
import * as jsyaml from 'js-yaml';
import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { class_template, subclass_template, simple_method_template } from './common_constants';
import { jobTemplates } from './job_constants';
import { workflowTemplates } from './workflow_constants';
import { stepTemplates } from './step_constants';
import { stepTypeHeaders } from './step_constants';
import { classConnectionsCode } from './class_connections';
import { hasConfigItems } from '../qorus_utils';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassCreator extends InterfaceCreator {
    editImpl({data, orig_data, edit_type, iface_id, iface_kind, open_file_on_success}) {
        let template: string;
        let imports: string[];
        let suffix: string;
        switch (iface_kind) {
            case 'job':
                ({template, imports} = jobTemplates(data.lang));
                suffix = '.qjob';
                break;
            case 'step':
                ({template, imports} = stepTemplates(data.lang));
                suffix = '.qstep';
                break;
            case 'workflow':
                if (data['class-name']) {
                    ({template, imports} = workflowTemplates(data.lang));
                    suffix = '.qwf';
                }
                break;
            case 'class':
                template = (data['base-class-name'] ? subclass_template : class_template)[data.lang];
                suffix = '.qclass';
                break;
            case 'mapper':
                suffix = '.qmapper';
                break;
            case 'other':
                suffix = `.q${data.type.toLowerCase()}`;
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'ClassCreator'}`);
                return;
        }

        this.has_code = !!template;

        imports = imports || [];

        data = this.init(data, suffix);

        if (iface_kind === 'step' && data['base-class-name']) {
            data = {
                ...data,
                ...stepTypeHeaders(this.code_info.stepType(data['base-class-name']))
            };
        }

        let triggers: string[] = [];
        let connections_within_class: string = '';
        let connections_extra_class: string = '';
        let more_imports: string[] = [];
        if (data['class-connections']) {
            ClassCreator.fixClassConnections(data);
            ({connections_within_class, connections_extra_class, triggers, imports: more_imports = []}
                            = classConnectionsCode({...data, iface_kind}, this.code_info, this.lang));
        }

        let methods = '';
        let contents: string;
        let message: string;
        let code_lines: string[];
        let orig_file_path: string;
        switch (edit_type) {
            case 'create':
                if (!this.has_code) {
                    message = t`FileCreatedInDir ${this.yaml_file_name} ${this.target_dir}`;
                    break;
                }

                if (iface_kind === 'job' && !triggers.includes('run')) {
                    methods = this.fillTemplate(simple_method_template[this.lang], undefined, { name: 'run' }, false);
                }

                else if (iface_kind === 'step') {
                    const mandatory_step_methods =
                        this.code_info.mandatoryStepMethods(data['base-class-name'], this.lang);
                    msg.debug({mandatory_step_methods});
                    let method_strings = [];
                    const indent = '    ';
                    Object.keys(mandatory_step_methods).forEach(method_name => {
                        if (triggers.includes(method_name)) {
                            return;
                        }
                        const method_data = mandatory_step_methods[method_name];
                        let method_string = `${indent}${method_data.signature} {\n`;
                        if (method_data.body) {
                            method_string += `${indent}${indent}${method_data.body}\n`;
                        }
                        method_string += `${indent}}\n`;
                        method_strings.push(method_string);
                    });
                    methods = method_strings.join('\n');
                }

                if (methods && data['class-connections']) {
                    methods += '\n';
                }

                contents = this.fillTemplate(template, [...imports, ...more_imports], {
                    class_name: data['class-name'],
                    base_class_name: data['base-class-name'],
                    methods,
                    connections_within_class,
                    connections_extra_class
                });

                message = t`2FilesCreatedInDir ${this.file_name} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                const {
                    target_dir: orig_target_dir,
                    target_file: orig_target_file,
                    ...other_orig_data
                } = orig_data;

                orig_file_path = path.join(orig_target_dir, orig_target_file);

                if (!this.has_code) {
                    break;
                }

                this.edit_info = this.code_info.editInfo(orig_file_path);

                if (this.edit_info) {
                    code_lines = this.edit_info.text_lines;
                    code_lines = this.renameClassAndBaseClass(code_lines,
                                                              other_orig_data,
                                                              data);
                    contents = code_lines.join('\n');
                } else {
                    // this case happens when on create it was a codeless interfaces (this.has_code = false)
                    // but on edit a class_name or base_class_name was added, so now there is a new code file
                    // (this.edit_info is undefined since orig_file_path is undefined)
                    contents = this.fillTemplate(template, [...imports, ...more_imports], {
                        class_name: data['class-name'],
                        base_class_name: data['base-class-name'],
                        methods,
                        connections_within_class,
                        connections_extra_class
                    });
                }
                break;
            default:
                msg.error(t`UnknownEditType`);
                return;
        }

        let headers = this.createHeaders({
            type: iface_kind,
            ...data,
            code: this.has_code ? this.file_name : undefined
        });

        const iface_data = this.code_info.interface_info.getInfo(iface_id);
        const hasArrayTag = tag => iface_data && iface_data[tag] && iface_data[tag].length;
        if (hasArrayTag('config-items')) {
            headers += ClassCreator.createConfigItemHeaders(iface_data['config-items']);
        }

        if (iface_kind === 'workflow' && hasArrayTag('config-item-values')) {
            headers += jsyaml.safeDump({'config-item-values': iface_data['config-item-values']},
                                       {indent: 2, skipInvalid: true})
                             .replace(/\r?\n  -\r?\n/g, '\n  - ');
        }

        this.has_code
            ? this.writeFiles(contents, headers, open_file_on_success)
            : this.writeYamlFile(headers);

        if (message) {
            msg.info(message);
        }

        delete data.yaml_file;
        qorus_webview.opening_data = {
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: data
        };

        this.deleteOrigFilesIfDifferent(orig_file_path);
        if (hasConfigItems(iface_kind)) {
            this.code_info.interface_info.setOrigConfigItems(iface_id, edit_type === 'edit');
        }
    }
}

export const class_creator = new ClassCreator();
