import * as vscode from 'vscode';

export class QorusCodeLensProvider implements vscode.CodeLensProvider {
    public provideCodeLenses(document: vscode.TextDocument): Promise<vscode.CodeLens[]> {
        let lenses = [...this.createMethodLenses(document), ...this.createServiceLenses(document)];

        return Promise.resolve(lenses);
    }

    public createServiceLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const fileContents: string = document.getText();
        const regEx = /I am a service/g;
        let match;
        const lenses = [];

        while ((match = regEx.exec(fileContents))) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range: vscode.Range = new vscode.Range(startPos, endPos);
            const addCmd: vscode.Command = {
                title: 'Add method',
                command: 'qorus.manageMethods',
            };
            const editCmd: vscode.Command = {
                title: 'Edit service',
                command: 'qorus.createInterface',
            };

            lenses.push(new vscode.CodeLens(range, addCmd));
            lenses.push(new vscode.CodeLens(range, editCmd));
        }

        return lenses;
    }

    public createMethodLenses(document: vscode.TextDocument): vscode.CodeLens[] {
        const fileContents: string = document.getText();
        const regEx = /I am a method/g;
        let match;
        const lenses = [];

        while ((match = regEx.exec(fileContents))) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range: vscode.Range = new vscode.Range(startPos, endPos);
            const editCmd: vscode.Command = {
                title: 'Edit method',
                command: 'qorus.manageMethods',
            };

            const deleteCmd: vscode.Command = {
                title: 'Delete method',
                command: 'qorus.manageMethods',
            };
            lenses.push(new vscode.CodeLens(range, editCmd));
            lenses.push(new vscode.CodeLens(range, deleteCmd));
        }

        return lenses;
    }
}
