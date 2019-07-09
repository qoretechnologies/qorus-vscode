import * as vscode from 'vscode';

export class QorusHoverProvider implements vscode.HoverProvider {
    provideHover(document: vscode.TextDocument, position: vscode.Position): vscode.ProviderResult<vscode.Hover> {
        const fileContents: string = document.getText();
        const regEx = /I am a method/g;
        let match;
        let lenses: vscode.Range[] = [];

        while ((match = regEx.exec(fileContents))) {
            const startPos = document.positionAt(match.index);
            const endPos = document.positionAt(match.index + match[0].length);
            const range: vscode.Range = new vscode.Range(startPos, endPos);
            lenses.push(range);
        }

        // lenses = Promise.resolve(lenses);

        if (lenses.find((lens: vscode.Range) => lens.start.line === position.line)) {
            const markdown = new vscode.MarkdownString(
                '| | | | \n' +
                    '|---|---|---|  \n' +
                    '|Name|some name|[Edit](command:qorus.createInterface)|  \n' +
                    '|Description|some description|[Edit](command:qorus.createInterface)|  \n  \n  \n' +
                    '[Edit method](command:qorus.createInterface) [Delete method](command:qorus.createInterface)</div>'
            );
            markdown.isTrusted = true;
            return new vscode.Hover(markdown);
        }

        return null;
    }
}
