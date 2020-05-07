import { Hover, Position, TextDocument } from 'vscode';

import { QorusHoverProviderBase } from './QorusHoverProvider';
import { makeFileUri, getFilePathFromUri } from './qorus_utils';
import { getJavaDocumentSymbols } from './vscode_java';

export class QorusJavaHoverProvider extends QorusHoverProviderBase {
    isSearchedSymbol = (symbol, position) =>
        symbol.selectionRange.start.line === position.line &&
        symbol.selectionRange.start.character <= position.character &&
        symbol.selectionRange.end.character > position.character

    async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined> {
        let symbols;
        if (typeof document.uri === 'string') {
            symbols = await getJavaDocumentSymbols(document.uri);
        } else {
            symbols = await getJavaDocumentSymbols(makeFileUri(document.uri.fsPath));
        }

        // sanity check
        if (!symbols || (Array.isArray(symbols) && symbols.length == 0)) {
            return undefined;
        }

        const filePath = getFilePathFromUri(document.uri);
        const yaml_info = this.code_info.yaml_info.yamlDataBySrcFile(filePath);
        if (!yaml_info) {
            return undefined;
        }

        const searchSymbol = (symbol, position) => {
            if (this.isSearchedSymbol(symbol, position)) {
                if (this.isFileClass(symbol, yaml_info)) {
                    return this.createClassHover(symbol, yaml_info);
                }
                if (this.isMethod(symbol)) {
                    return this.createMethodHover(symbol, yaml_info);
                }
            }
            for (const child of symbol.children) {
                const result = searchSymbol(child, position);
                if (result) {
                    return result;
                }
            }
            return undefined;
        };
        for (const symbol of symbols) {
            const result = searchSymbol(symbol, position);
            if (result) {
                return result;
            }
        }

        return undefined;
    }
}
