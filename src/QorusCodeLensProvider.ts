import * as vscode from 'vscode';
import * as path from 'path';
import { qore_vscode } from './qore_vscode';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { QoreTextDocument, loc2range } from './QoreTextDocument';
import { projects } from './QorusProject';
import { field } from './qorus_creator/common_constants';
import { suffixToIfaceKind,dash2Pascal } from './qorus_utils';
import { t, gettext } from 'ttag';
import * as msg from './qorus_message';


export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    private code_info: QorusProjectCodeInfo = undefined;
    private previous_lenses: vscode.CodeLens[] = [];

    public provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        this.code_info = projects.currentProjectCodeInfo();
        return this.code_info.waitForPending(['yaml']).then(() => this.provideCodeLensesImpl(document));
    }

    private provideCodeLensesImpl(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const file_path = document.uri.fsPath;
        const dir_path = path.dirname(file_path);
        const file_name = path.basename(file_path);

        const iface_kind = suffixToIfaceKind(path.extname(file_path));
        if (!['service', 'job', 'step', 'workflow', 'class', 'mapper-code'].includes(iface_kind)) {
            return Promise.resolve([]);
        }

        const yaml_info = this.code_info.yamlDataBySrcFile(file_path);
        if (!yaml_info) {
            msg.error(t`UnableFindYamlForSrc ${file_name}`);
            return Promise.resolve([]);
        }

        const doc: QoreTextDocument = {
            uri: 'file:' + file_path,
            text: document.getText(),
            languageId: document.languageId,
            version: document.version
        };

        const data = {
            target_dir: dir_path,
            target_file: file_name,
            ...yaml_info
        };

        this.code_info.addText(document);

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            if (!symbols.length) {
                return this.previous_lenses;
            }
            let lenses: vscode.CodeLens[] = [];

            symbols.forEach(symbol => {
                if (!this.code_info.isSymbolExpectedClass(symbol, data['class-name'])) {
                    return;
                }

                this.code_info.addClassCodeInfo(file_path, symbol, data['base-class-name'], false);

                this.addClassLenses(iface_kind, lenses, symbol, data);

                if (!['service', 'mapper-code'].includes(iface_kind)) {
                    return;
                }

                for (let decl of symbol.declarations || []) {
                    if (!this.code_info.addClassDeclCodeInfo(file_path, decl)) {
                        continue;
                    }

                    const method_name = decl.name.name;
                    const name_range = loc2range(decl.name.loc);
                    this.addMethodLenses(iface_kind, lenses, name_range, data, method_name);
                }
            });

            this.previous_lenses = lenses;
            return lenses;
        });
    }

    private addClassLenses(iface_kind: string, lenses: vscode.CodeLens[], symbol: any, data: any) {
        if (!symbol.name) {
            msg.error(t`ConnotDetermineClassNamePosition`);
            return;
        }

        data = this.fixData({ ...data });
        const range = loc2range(symbol.name.loc);

        switch (iface_kind) {
            case 'mapper-code':
            case 'service':
                let methods_key = 'methods';

                if (iface_kind === 'mapper-code') {
                    data['mapper-methods'] = data.methods;
                    delete data.methods;
                    methods_key = 'mapper-methods';
                }

                let cloned_data = JSON.parse(JSON.stringify(data));
                cloned_data[methods_key] = [...cloned_data[methods_key] || [], { name: '', desc: '' }];

                lenses.push(new vscode.CodeLens(range, {
                    title: gettext('Edit' + dash2Pascal(iface_kind)),
                    command: 'qorus.editInterface',
                    arguments: [data, iface_kind],
                }));

                lenses.push(new vscode.CodeLens(range, {
                    title: t`AddMethod`,
                    command: 'qorus.editInterface',
                    arguments: [{ ...cloned_data, active_method: cloned_data[methods_key].length }, iface_kind],
                }));

                break;
            case 'job':
            case 'step':
            case 'class':
                lenses.push(new vscode.CodeLens(range, {
                    title: gettext('Edit' + dash2Pascal(iface_kind)),
                    command: 'qorus.editInterface',
                    arguments: [data, iface_kind],
                }));
                break;
            case 'workflow':
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditWorkflow`,
                    command: 'qorus.editInterface',
                    arguments: [data, 'workflow'],
                }));
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditSteps`,
                    command: 'qorus.editInterface',
                    arguments: [{ ...data, show_steps: true }, 'workflow'],
                }));
                break;
            default:
                msg.log(t`InvalidIfaceKind ${iface_kind} ${'addClassLenses'}`);
        }
    }

    private addMethodLenses(
        iface_kind: string,
        lenses: vscode.CodeLens[],
        loc: any,
        data: any,
        method_name: string)
    {
        const method_index = (data.methods || []).findIndex(method => method.name === method_name);

        if (method_index === -1 && method_name !== 'constructor') {
            msg.error(t`SrcMethodNotInYaml ${method_name} ${data.code || ''}`);
            return;
        }

        data = this.fixData({ ...data });

        if (iface_kind === 'mapper-code') {
            data['mapper-methods'] = data.methods;
            delete data.methods;
        }

        lenses.push(new vscode.CodeLens(loc, {
            title: t`EditMethod`,
            command: 'qorus.editInterface',
            arguments: [{ ...data, active_method: method_index + 1 }, iface_kind],
        }));

        lenses.push(new vscode.CodeLens(loc, {
            title: t`DeleteMethod`,
            command: 'qorus.deleteMethod',
            arguments: [{ ...data, method_index }, iface_kind],
        }));
    }

    private fixData(data: any): any {
        if (data.autostart) {
            data[data.type + '-autostart'] = data.autostart;
            delete data.autostart;
        }

        let fields_to_complexify = ['functions', 'constants', 'mappers', 'value_maps', 'author'];

        if (data['class-prefixes']) {
            data.classes = data['class-prefixes'].map(class_prefix_data => ({
                name: class_prefix_data.class,
                prefix: class_prefix_data.prefix
            }));
        } else {
            fields_to_complexify.push('classes');
        }

        fields_to_complexify.forEach(tag => {
            if (data[tag]) {
                data[tag] = data[tag].map(value => ({ name: value }));
            }
        });

        const array_of_pairs_fields = ['tags', 'define-auth-label', 'options', 'statuses'];
        array_of_pairs_fields.forEach(tag => {
            if (!data[tag]) {
                return;
            }

            const [key_name, value_name] = field[tag.replace(/-/g, '_')].fields;
            let transformed_data = [];

            for (const key in data[tag]) {
                transformed_data.push({
                    [key_name]: key,
                    [value_name]: data[tag][key]
                });
            }

            data[tag] = transformed_data;
        });

        for (const method of data.methods || []) {
            if (method.author) {
                method.author = method.author.map(value => ({ name: value }));
            }
        }

        if (data.schedule) {
            const ordered_values = ['minutes', 'hours', 'days', 'months', 'dow'].map(key => data.schedule[key]);
            data.schedule = ordered_values.join(' ');
        }

        if (data.steps) {
            data['steps-info'] = this.code_info.stepData(data.steps);
        }

        delete data.code;
        delete data.yaml_file;

        return data;
    }
}
