import { CodeLens, TextDocument } from 'vscode';

import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QoreTextDocument, loc2range } from './QoreTextDocument';
import { makeFileUri } from './qorus_utils';
import { qore_vscode } from './qore_vscode';

export class QorusQoreCodeLensProvider extends QorusCodeLensProviderBase {
    protected provideLanguageSpecificImpl(document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        const doc: QoreTextDocument = {
            uri: makeFileUri(file_path),
            text: document.getText(),
            languageId: document.languageId,
            version: document.version
        };

        return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
            if (!symbols.length) {
                return this.previous_lenses;
            }
            let lenses: CodeLens[] = [];
            data = this.code_info.fixData(data);

            symbols.forEach(symbol => {
                if (!QorusProjectEditInfo.isQoreSymbolExpectedClass(symbol, data['class-name'])) {
                    return;
                }

                this.addClassLenses(iface_kind, lenses, loc2range(symbol.name.loc), data);

                if (!['service', 'mapper-code'].includes(iface_kind)) {
                    return;
                }

                for (const decl of symbol.declarations || []) {
                    if (!QorusProjectEditInfo.isQoreDeclPublicMethod(decl)) {
                        continue;
                    }

                    const method_name = decl.name.name;
                    const name_range = loc2range(decl.name.loc);
                    this.addMethodLenses(iface_kind, lenses, name_range, data, method_name);
                }
            });

            this.previous_lenses = lenses;
            return lenses;
        });
    }
}
