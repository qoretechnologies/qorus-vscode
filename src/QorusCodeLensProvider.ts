import * as vscode from 'vscode';
import { qore_vscode } from './qore_vscode';
import { projects } from './QorusProject';
import { methodName } from './qorus_utils';
import { t } from 'ttag';
import * as msg from './qorus_message';

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

        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`EditService`,
            command: 'qorus.editService',
            arguments: [yaml_data],
        }));
        lenses.push(new vscode.CodeLens(symbol.location.range, {
            title: t`AddMethod`,
            command: 'qorus.addServiceMethod',
            arguments: [yaml_data],
        }));
    }

    private addMethodLens(lenses: vscode.CodeLens[], symbol: any, yaml_data: any) {
        const findMethod = (yaml_data: any, name: string): any => {
            if (!yaml_data.methods) {
                return undefined;
            }
            for (const method_data of yaml_data.methods) {
                if (method_data.name === name) {
                    return method_data;
                }
            }
            return undefined;
        };

        const method_name = methodName(symbol.name);
        const method_data = findMethod(yaml_data, method_name);
        if (method_data) {
            lenses.push(new vscode.CodeLens(symbol.location.range, {
                title: t`EditMethod`,
                command: 'qorus.editServiceMethod',
                arguments: [method_data],
            }));
            lenses.push(new vscode.CodeLens(symbol.location.range, {
                title: t`DeleteMethod`,
                command: 'qorus.deleteServiceMethod',
                arguments: [method_data],
            }));
        }
    }
}
