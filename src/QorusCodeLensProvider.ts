import * as vscode from 'vscode';
import * as path from 'path';
import { qore_vscode } from './qore_vscode';
import { projects } from './QorusProject';
import { t } from 'ttag';
import * as msg from './qorus_message';

export interface QoreTextDocument {
    uri: string,
    text: string,
    languageId: string,
    version: number
};

export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    private code_info: any = undefined;

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

        return qore_vscode.exports.getDocumentSymbols(doc).then(symbols => {
            let lenses: vscode.CodeLens[] = [];

            symbols.forEach(symbol => {
                switch (symbol.kind) {
                    case 5:
                        this.addServiceLens(lenses, symbol, data);
                        break;
                    case 6:
                        this.addMethodLens(lenses, symbol, data);
                        break;
                }
            });

            return lenses;
        });
    }

    private addServiceLens(lenses: vscode.CodeLens[], symbol: any, data: any) {
        const class_name = data['class-name'];
        if (class_name) {
            if(class_name !== symbol.name) {
                msg.error(t`SrcAndYamlMismatch ${'class-name'} ${data.code} ${symbol.name} ${class_name}`);
            }
        }
        else {
            data['class-name'] = symbol.name;
        }

        data = this.fixData(data);

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`EditService`,
            command: 'qorus.editService',
            arguments: [data],
        }));

        let cloned_data = JSON.parse(JSON.stringify(data));
        cloned_data.methods = [...cloned_data.methods || [], {name: '', desc: ''}];
        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`AddMethod`,
            command: 'qorus.editService',
            arguments: [{ ...cloned_data, active_method: cloned_data.methods.length }],
        }));
    }

    private addMethodLens(lenses: vscode.CodeLens[], symbol: any, data: any) {
        const methodIndex = (data: any, method_name: string): number => {
            for (let i = 0; i < (data.methods || []).length; i++) {
                if (data.methods[i].name === method_name) {
                    return i;
                }
            }
            return -1;
        };

        if (symbol.name.split('::').length !== 2) {
            msg.error(t`UnrecognizedMethodName ${symbol.name}`);
            return;
        }
        const [class_name, method_name] = symbol.name.split('::');
        const method_index = methodIndex(data, method_name);
        if (method_index === -1) {
            msg.error(t`SrcMethodNotInYaml ${method_name} ${data.code || ''}`);
            return;
        }

        data['class-name'] = class_name;

        data = this.fixData(data);

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`EditMethod`,
            command: 'qorus.editService',
            arguments: [{ ...data, active_method: method_index + 1 }],
        }));

        lenses.push(new vscode.CodeLens(symbol.location.range, {
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
