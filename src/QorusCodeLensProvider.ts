import * as vscode from 'vscode';
import * as path from 'path';
import { qore_vscode } from './qore_vscode';
import { QoreTextDocument, QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { projects } from './QorusProject';
import { t } from 'ttag';
import * as msg from './qorus_message';


const loc2range = (loc: any, offset_string: string = ''): vscode.Range => new vscode.Range(
    loc.start_line - 1,
    loc.start_column - 1 + offset_string.length,
    loc.end_line - 1,
    loc.end_column - 1,
);

export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    private code_info: QorusProjectCodeInfo = undefined;

    public provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const file_path = document.uri.fsPath;
        const dir_path = path.dirname(file_path);
        const file_name = path.basename(file_path);

        this.code_info = projects.currentProjectCodeInfo();
        const yaml_info = this.code_info.yaml_info_by_file[file_path];

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

        this.code_info.addServiceText(document);

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            let lenses: vscode.CodeLens[] = [];

            symbols.forEach(symbol => {
                if (symbol.nodetype !== 1 || symbol.kind !== 1 || ! symbol.inherits) { // declaration && class
                    return;
                }

                data['class-name'] = this.addServiceLens(lenses, symbol, data);
                if (!data['class-name']) {
                    return;
                }

                this.code_info.addServiceInfo(
                    file_path,
                    loc2range(symbol.name.loc, 'class '),
                    loc2range(symbol.inherits[0].name.loc)
                );

                for (let decl of symbol.declarations || []) {
                    if (decl.nodetype !== 1 || decl.kind !== 4) { // declaration && function
                        continue;
                    }

                    if (decl.modifiers.indexOf('private') > -1) {
                        continue;
                    }

                    const method_name = decl.name.name;
                    const decl_range = loc2range(decl.loc);
                    const name_range = loc2range(decl.name.loc);

                    this.code_info.addServiceMethodInfo(
                        file_path,
                        method_name,
                        decl_range,
                        name_range
                    );
                    this.addMethodLens(lenses, name_range, data, method_name);
                }
            });

            return lenses;
        });
    }

    private addServiceLens(lenses: vscode.CodeLens[], symbol: any, data: any): string | undefined {
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

        data = this.fixData(data);
        const range = loc2range(symbol.name.loc);

        lenses.push(new vscode.CodeLens(range, {
            title: t`EditService`,
            command: 'qorus.editService',
            arguments: [data],
        }));

        let cloned_data = JSON.parse(JSON.stringify(data));
        cloned_data.methods = [...cloned_data.methods || [], {name: '', desc: ''}];
        lenses.push(new vscode.CodeLens(range, {
            title: t`AddMethod`,
            command: 'qorus.editService',
            arguments: [{ ...cloned_data, active_method: cloned_data.methods.length }],
        }));

        return class_name;
    }

    private addMethodLens(lenses: vscode.CodeLens[], loc: any, data: any, method_name: string) {
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

        data = this.fixData(data);

        lenses.push(new vscode.CodeLens(loc, {
            title: t`EditMethod`,
            command: 'qorus.editService',
            arguments: [{ ...data, active_method: method_index + 1 }],
        }));

        lenses.push(new vscode.CodeLens(loc, {
            title: t`DeleteMethod`,
            command: 'qorus.deleteServiceMethod',
            arguments: [{ ...data, method_index }],
        }));
    }

    private fixData(data_to_fix: any): any {
        const clone = JSON.parse(JSON.stringify(data_to_fix));
        const fields_to_complexify = ['classes', 'functions', 'constants', 'mappers', 'value_maps', 'author'];

        let data: any = {};
        for (const key in clone) {
            const fixed_key = key.replace(/-/g, '_');
            data[fixed_key] = clone[key];
            if (fields_to_complexify.includes(fixed_key)) {
                data[fixed_key] = data[fixed_key].map(value => ({ name: value }));
            }
        }
        for (const method of data.methods || []) {
            if (method.author) {
                method.author = method.author.map(value => ({ name: value }));
            }
        }

        if (!data.base_class_name) {
            data.base_class_name = this.code_info.baseClassName(data.class_name);
        }
        delete data.code;

        return data;
    }
}
