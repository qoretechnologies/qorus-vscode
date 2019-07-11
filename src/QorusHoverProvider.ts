import * as vscode from 'vscode';
import { qore_vscode } from './qore_vscode';

export class QorusHoverProvider implements vscode.HoverProvider {

    async provideHover(document: vscode.TextDocument, position: vscode.Position) {
        let symbols = await qore_vscode.exports.getDocumentSymbols(document);
        // console.log(symbols);

        if (symbols.find((symbol) => symbol.kind === 6 && symbol.location.range.start.line === position.line)) {
            const markdown = new vscode.MarkdownString(
                '| | | | \n' +
                    '|---|---|---|  \n' +
                    '|Name|some name|[Edit](command:qorus.createInterface)|  \n' +
                    '|Description|some description|[Edit](command:qorus.createInterface)|  \n  \n  \n' +
                    '---  \n' +
                    '[Edit method](command:qorus.createInterface) [Delete method](command:qorus.createInterface)'
            );
            markdown.isTrusted = true;
            return new vscode.Hover(markdown);
        }

        return null;
    }
}
