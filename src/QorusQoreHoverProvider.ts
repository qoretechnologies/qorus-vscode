import { Hover, Position, TextDocument } from 'vscode';

import { QorusHoverProviderBase } from './QorusHoverProviderBase';
import { getFilePathFromUri } from './qorus_utils';
import { qore_vscode, isLangClientAvailable } from './qore_vscode';

export class QorusQoreHoverProvider extends QorusHoverProviderBase {
    isSearchedSymbol = (symbol, position) =>
        symbol.location.range.start.line === position.line &&
        symbol.location.range.start.character <= position.character &&
        symbol.location.range.end.character > position.character

    async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined> {
        const lang_client_available = await isLangClientAvailable();
        if (!lang_client_available) {
            return undefined;
        }

        let symbols = await qore_vscode.exports.getDocumentSymbols(document);

        const filePath = getFilePathFromUri(document.uri);
        const yaml_info = this.code_info.yaml_info.yamlDataBySrcFile(filePath);
        if (!yaml_info) {
            return undefined;
        }

        for (const symbol of symbols) {
            if (this.isSearchedSymbol(symbol, position)) {
                if (symbol.kind === 5 && symbol.name === yaml_info['class-name']) {
                    return this.createClassHover(yaml_info);
                }
                if (symbol.kind === 6) {
                    return this.createMethodHover(symbol.name, yaml_info);
                }
            }
        }

        return undefined;
    }
}
