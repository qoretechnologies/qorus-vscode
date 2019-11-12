import * as vscode from 'vscode';
import * as path from 'path';
import { qore_vscode } from './qore_vscode';
import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { QoreTextDocument, loc2range } from './QoreTextDocument';
import { projects } from './QorusProject';
import { suffixToIfaceKind } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';


export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    private code_info: QorusProjectCodeInfo = undefined;

    public provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        this.code_info = projects.currentProjectCodeInfo();
        return this.code_info.waitForPending(['yaml', 'base_classes']).then(() => this.provideCodeLensesImpl(document));
    }

    private provideCodeLensesImpl(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const file_path = document.uri.fsPath;
        const dir_path = path.dirname(file_path);
        const file_name = path.basename(file_path);

        const iface_kind = suffixToIfaceKind(path.extname(file_path));
        if (!['service', 'job', 'step', 'workflow', 'class'].includes(iface_kind)) {
            return Promise.resolve([]);
        }

        const yaml_info = this.code_info.yaml_info_by_src_file[file_path];

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
            let lenses: vscode.CodeLens[] = [];

            symbols.forEach(symbol => {
                if (!this.code_info.addSymbolCodeInfo(file_path, symbol)) {
                    return;
                }

                data['class-name'] = this.addClassLenses(iface_kind, lenses, symbol, data);
                if (!data['class-name']) {
                    return;
                }

                if (iface_kind !== 'service') {
                    return;
                }

                for (let decl of symbol.declarations || []) {
                    if (!this.code_info.addSymbolDeclCodeInfo(file_path, decl)) {
                        continue;
                    }

                    const method_name = decl.name.name;
                    const name_range = loc2range(decl.name.loc);
                    this.addServiceMethodLenses(lenses, name_range, data, method_name);
                }
            });

            return lenses;
        });
    }

    private addClassLenses(iface_kind: string, lenses: vscode.CodeLens[], symbol: any, data: any): string | undefined {
        if (!symbol.name) {
            msg.error(t`ConnotDetermineClassNamePosition`);
            return undefined;
        }

        const class_name = data['class-name'];

        if (class_name) {
            if(class_name !== symbol.name.name) {
                msg.error(t`SrcAndYamlMismatch ${'class-name'} ${data.code} ${symbol.name.name} ${class_name}`);
            }
        }
        else {
            data['class-name'] = symbol.name.name;
        }

        if (symbol.inherits && symbol.inherits.length) {
            data['base-class-name'] = symbol.inherits[0].name.name;
        }

        data = this.fixData({ ...data });
        const range = loc2range(symbol.name.loc);

        switch (iface_kind) {
            case 'service':
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditService`,
                    command: 'qorus.editInterface',
                    arguments: [data, 'service'],
                }));

                let cloned_data = JSON.parse(JSON.stringify(data));
                cloned_data.methods = [...cloned_data.methods || [], {name: '', desc: ''}];
                lenses.push(new vscode.CodeLens(range, {
                    title: t`AddMethod`,
                    command: 'qorus.editInterface',
                    arguments: [{ ...cloned_data, active_method: cloned_data.methods.length }, 'service'],
                }));
                break;
            case 'job':
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditJob`,
                    command: 'qorus.editInterface',
                    arguments: [data, 'job'],
                }));
                break;
            case 'step':
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditStep`,
                    command: 'qorus.editInterface',
                    arguments: [data, 'step'],
                }));
                break;
            case 'class':
                lenses.push(new vscode.CodeLens(range, {
                    title: t`EditClass`,
                    command: 'qorus.editInterface',
                    arguments: [data, 'class'],
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

        return class_name;
    }

    private addServiceMethodLenses(lenses: vscode.CodeLens[], loc: any, data: any, method_name: string) {
        let method_index = -1;
        for (let i = 0; i < (data.methods || []).length; i++) {
            if (data.methods[i].name === method_name) {
                method_index = i;
                break;
            }
        }
        if (method_index === -1) {
            msg.error(t`SrcMethodNotInYaml ${method_name} ${data.code || ''}`);
            return;
        }

        data = this.fixData({ ...data });

        lenses.push(new vscode.CodeLens(loc, {
            title: t`EditMethod`,
            command: 'qorus.editInterface',
            arguments: [{ ...data, active_method: method_index + 1 }, 'service'],
        }));

        lenses.push(new vscode.CodeLens(loc, {
            title: t`DeleteMethod`,
            command: 'qorus.deleteServiceMethod',
            arguments: [{ ...data, method_index }],
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
