import * as vscode from 'vscode';

import { QorusProjectCodeInfo } from './QorusProjectCodeInfo';
import { projects } from './QorusProject';
import { makeFileUri, getFilePathFromUri } from './qorus_utils';
import { getJavaDocumentSymbols } from './vscode_java';

export class QorusJavaHoverProvider implements vscode.HoverProvider {
    private code_info: QorusProjectCodeInfo = undefined;

    provideHover(document: vscode.TextDocument, position: vscode.Position) {
        this.code_info = projects.currentProjectCodeInfo();
        return this.code_info.waitForPending(['yaml']).then(() => this.provideHoverImpl(document, position));
    }

    async provideHoverImpl(document: vscode.TextDocument, position: vscode.Position) {
        let symbols;
        if (typeof document.uri === 'string') {
            symbols = await getJavaDocumentSymbols(document.uri);
        } else {
            symbols = await getJavaDocumentSymbols(makeFileUri(document.uri.fsPath));
        }

        const filePath = getFilePathFromUri(document.uri);
        const yaml_info = this.code_info.yamlDataBySrcFile(filePath);
        if (!yaml_info) {
            return Promise.resolve([]);
        }

        const isSearchedMethod = (symbol) =>
            symbol.kind === 6 &&
            symbol.selectionRange.start.line === position.line &&
            symbol.selectionRange.start.character <= position.character &&
            symbol.selectionRange.end.character > position.character;
        const createHover = (symbol, yaml_info) => {
            const methodName = symbol.name.replace(/\(.*\)/, '');
            let method;
            for (const m of yaml_info.methods || []) {
                if (m.name === methodName) {
                    method = m;
                    break;
                }
            }
            if (method) {
                const markdown = new vscode.MarkdownString(method.desc);
                markdown.isTrusted = true;
                return new vscode.Hover(markdown);
            }
            return new vscode.Hover("(No description found)");
        };

        const searchSymbol = (symbol) => {
            if (isSearchedMethod(symbol)) {
                return createHover(symbol, yaml_info);
            }
            for (const child of symbol.children) {
                let result = searchSymbol(child);
                if (result) {
                    return result;
                }
            }
            return undefined;
        };
        for (const symbol of symbols) {
            let result = searchSymbol(symbol);
            if (result) {
                return result;
            }
        }

        return Promise.resolve([]);
    }
}
