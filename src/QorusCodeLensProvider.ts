import * as vscode from 'vscode';
import { qore_vscode } from './qore_vscode';
import { projects } from './QorusProject';
import { methodName } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';
import { authorsToArray, dashToUnderscoreInKeys } from './qorus_creator/creator_common';

export interface QoreTextDocument {
    uri: string,
    text: string,
    languageId: string,
    version: number
};

export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    public provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const yaml_info = projects.getProject().code_info.yaml_info;

        const doc: QoreTextDocument = {
            uri: 'file:' + document.uri.path,
            text: document.getText(),
            languageId: document.languageId,
            version: document.version
        };

        return qore_vscode.exports.getDocumentSymbols(doc).then(symbols => {
            let lenses: vscode.CodeLens[] = [];

            symbols.forEach(symbol => {
                const yaml_data = yaml_info[symbol.location.uri.substr(5)];
                switch (symbol.kind) {
                    case 5:
                        this.addServiceLens(lenses, symbol, yaml_data);
                        break;
                    case 6:
                        this.addMethodLens(lenses, symbol, yaml_data);
                        break;
                }
            });

            return lenses;
        });
    }

    private addServiceLens(lenses: vscode.CodeLens[], symbol: any, yaml_data: any) {
        const class_name = yaml_data['class-name'];
        if (class_name) {
            if(class_name !== symbol.name) {
                msg.error(t`SrcAndYamlMismatch ${'class-name'} ${yaml_data.code} ${symbol.name} ${class_name}`);
            }
        }
        else {
            yaml_data['class-name'] = symbol.name;
        }

        let data = dashToUnderscoreInKeys(yaml_data);
        delete data.code;
        authorsToArray(data);

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`EditService`,
            command: 'qorus.editService',
            arguments: [data],
        }));

        let methods = data.methods;
        methods = [...methods, {name: '', desc: ''}];
        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`AddMethod`,
            command: 'qorus.editService',
            arguments: [{ ...data, active_method: methods.length }],
        }));
    }

    private addMethodLens(lenses: vscode.CodeLens[], symbol: any, yaml_data: any) {
        const checkMethodName = (yaml_data: any, name: string): boolean => {
            for (const method_data of yaml_data.methods || []) {
                if (method_data.name === name) {
                    return true;
                }
            }
            return false;
        };

        let data = dashToUnderscoreInKeys(yaml_data);
        delete data.code;
        authorsToArray(data);

        const method_name = methodName(symbol.name);
        if (!checkMethodName(data, method_name)) {
            msg.error(t`SrcMethodNotInYaml ${method_name} ${yaml_data.code}`);
            return;
        }

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`EditMethod`,
            command: 'qorus.editService',
            arguments: [{ ...data, active_method: method_name }],
        }));

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`DeleteMethod`,
            command: 'qorus.deleteServiceMethod',
            arguments: [{service: data.name, method: method_name}],
        }));
    }
}
