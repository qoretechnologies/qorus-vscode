import { workspace, window } from 'vscode';
import * as jsyaml from 'js-yaml';

import { qorus_webview } from '../QorusWebview';
import { InterfaceCreator } from './InterfaceCreator';
import { simple_method_template, classTemplate } from './common_constants';
import { job_imports } from './job_constants';
import { workflow_imports } from './workflow_constants';
import { step_imports } from './step_constants';
import { stepTypeHeaders } from './step_constants';
import { ClassConnections } from './ClassConnections';
import { classConnectionsCodeChanges } from './ClassConnectionsCodeChanges';
import { hasConfigItems, toValidIdentifier, capitalize } from '../qorus_utils';
import { t } from 'ttag';
import * as msg from '../qorus_message';


class ClassCreator extends InterfaceCreator {
    editImpl = params => {
        const {data, orig_data, edit_type, iface_id, iface_kind, open_file_on_success, request_id} = params;
        this.lang = data.lang || 'qore';

        let imports: string[] = [];
        let suffix: string;
        this.has_code = false;
        switch (iface_kind) {
            case 'job':
                imports = job_imports[this.lang];
                this.has_code = true;
                suffix = '.qjob';
                break;
            case 'step':
                imports = step_imports[this.lang];
                this.has_code = true;
                suffix = '.qstep';
                break;
            case 'workflow':
                if (data['class-name']) {
                    imports = workflow_imports[this.lang];
                    this.has_code = true;
                }
                suffix = '.qwf';
                break;
            case 'class':
                data.name = data['class-name'] = toValidIdentifier(data['class-class-name'], true);
                this.has_code = true;
                suffix = '.qclass';
                break;
            case 'mapper':
            case 'type':
                suffix = `.q${iface_kind}`;
                break;
            case 'other':
                suffix = `.q${data.type.toLowerCase()}`;
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'ClassCreator'}`);
                return;
        }

        this.had_code = iface_kind === 'workflow' ? !!orig_data?.['class-name'] : this.has_code;

        this.setPaths(data, orig_data, suffix, iface_kind, edit_type);

        const {ok, message} = this.checkData(params);
        if (!ok) {
            qorus_webview.postMessage({
                action: `creator-${params.edit_type}-interface-complete`,
                request_id,
                ok,
                message
            });
            return;
        }

        let triggers: string[] = [];
        let connections_within_class: string = '';
        let connections_extra_class: string = '';
        let more_imports: string[] = [];
        if (Object.keys(data['class-connections'] || {}).length) {
            ClassCreator.fixClassConnections(data);
            ({connections_within_class, connections_extra_class, triggers, imports: more_imports = []}
                  = new ClassConnections({...data, iface_kind}, this.code_info, this.lang).code());
        }

        let methods = '';
        let template: string;
        let contents: string;
        let info: string;
        let code_lines: string[];
        switch (edit_type) {
            case 'create':
                if (!this.has_code) {
                    info = t`FileCreatedInDir ${this.yaml_file_name} ${this.target_dir}`;
                    break;
                }

                if (iface_kind === 'job' && !triggers.includes('run')) {
                    methods = InterfaceCreator.fillTemplate(
                        simple_method_template[this.lang],
                        this.lang,
                        undefined,
                        { name: 'run' },
                        false
                    );
                }

                else if (iface_kind === 'step') {
                    const mandatory_step_methods =
                        this.code_info.mandatoryStepMethods(data['base-class-name'], this.lang);
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

                    methods = ClassCreator.mandatoryStepMethodsCode(
                        this.code_info,
                        data['base-class-name'],
                        this.lang,
                        triggers
                    );
                }

                if (methods && data['class-connections']) {
                    methods += '\n';
                }

                template = classTemplate(this.lang, !!data['base-class-name'], !methods && !connections_within_class);
                contents = InterfaceCreator.fillTemplate(template, this.lang, [...imports, ...more_imports], {
                    class_name: data['class-name'],
                    base_class_name: data['base-class-name'],
                    methods,
                    connections_within_class,
                    connections_extra_class
                });

                info = t`2FilesCreatedInDir ${this.rel_file_path} ${this.yaml_file_name} ${this.target_dir}`;
                break;
            case 'edit':
                if (!this.has_code) {
                    break;
                }

                if (this.had_code) {
                    code_lines = this.file_edit_info.text_lines;
                    code_lines = this.renameClassAndBaseClass(code_lines, orig_data, data);
                    contents = code_lines.join('\n');
                } else {
                    // has code now, but didn't have before this edit
                    template = classTemplate(this.lang, !!data['base-class-name'], !methods && !connections_within_class);
                    contents = InterfaceCreator.fillTemplate(template, this.lang, [...imports, ...more_imports], {
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
            ... data,
            ... iface_kind === 'step' && data['base-class-name']
                ? stepTypeHeaders(this.code_info.stepType(data['base-class-name']))
                : {},
            code: this.rel_file_path
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

        if (this.has_code) {
            if (this.writeFiles(contents, headers)) {
                classConnectionsCodeChanges(this.file_path, this.code_info, data, orig_data, iface_kind, imports);
                if (open_file_on_success) {
                    workspace.openTextDocument(this.file_path).then(doc => window.showTextDocument(doc));
                }
            }
        } else {
            this.writeYamlFile(headers);
        }

        if (['create', 'edit'].includes(edit_type)) {
            const name = iface_kind === 'type' ? data.path : data.name;
            qorus_webview.postMessage({
                action: `creator-${edit_type}-interface-complete`,
                request_id,
                ok: true,
                message: t`IfaceSavedSuccessfully ${capitalize(iface_kind)} ${name}`
            });
        }

        if (info) {
            msg.info(info);
        }

        delete data.yaml_file;
        qorus_webview.opening_data = {
            tab: 'CreateInterface',
            subtab: iface_kind,
            [iface_kind]: data
        };

        this.deleteOrigFilesIfDifferent();
        if (hasConfigItems(iface_kind)) {
            this.code_info.interface_info.setOrigConfigItems(iface_id, edit_type === 'edit');
        }
    }
}

export const class_creator = new ClassCreator();
