import * as vscode from 'vscode';
import { qore_vscode } from './qore_vscode';
import { projects } from './QorusProject';
import { methodName } from './qorus_utils';
import * as msg from './qorus_message';

export class QorusCodeLensProvider implements vscode.CodeLensProvider {

    public async provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        let methodLenses = await this.createMethodLenses(document);
        let serviceLenses = await this.createServiceLenses(document);
        let lenses = [...methodLenses, ...serviceLenses];

        return Promise.resolve(lenses);
    }

    public async createServiceLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];

        const addCmd: vscode.Command = {
            title: 'Add method',
            command: 'qorus.manageMethods',
        };
        const editCmd: vscode.Command = {
            title: 'Edit service',
            command: 'qorus.createInterface',
        };

        let symbols = await qore_vscode.exports.getDocumentSymbols(document);
        symbols.forEach(symbol => {
            if (symbol.kind === 5) { // && name == servicename
                lenses.push(new vscode.CodeLens(symbol.location.range, addCmd));
                lenses.push(new vscode.CodeLens(symbol.location.range, editCmd));
            }
        });

        return Promise.resolve(lenses);
    }

    public async createMethodLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        const lenses: vscode.CodeLens[] = [];

        const editCmd: vscode.Command = {
            title: 'Edit method',
            command: 'qorus.manageMethods',
        };

        const deleteCmd: vscode.Command = {
            title: 'Delete method',
            command: 'qorus.manageMethods',
        };

        const yaml_info = projects.getProject().code_info.yaml_info;
//        msg.log('yaml info: ' + JSON.stringify(yaml_info, null, 4));

        let symbols = await qore_vscode.exports.getDocumentSymbols(document);
//        msg.log('symbols: ' + JSON.stringify(symbols, null, 4));
        symbols.forEach(symbol => {
            if (symbol.kind === 6) { // && name == methodname
                const method_name = methodName(symbol.name);
                msg.log('method name: ' + method_name);
                const yaml_data = yaml_info[symbol.location.uri.substr(5)];
                msg.log('yaml data: ' + JSON.stringify(yaml_data, null, 4));

                lenses.push(new vscode.CodeLens(symbol.location.range, editCmd));
                lenses.push(new vscode.CodeLens(symbol.location.range, deleteCmd));
            }
        });

        return Promise.resolve(lenses);
    }
}
