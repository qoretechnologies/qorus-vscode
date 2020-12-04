import { CodeLens, TextDocument } from 'vscode';

import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QoreTextDocument, qoreLoc2Range } from './QoreTextDocument';
import { makeFileUri } from './qorus_utils';
import { qore_vscode } from './qore_vscode';
import * as msg from './qorus_message';

export class QorusQoreCodeLensProvider extends QorusCodeLensProviderBase {
    protected provideLanguageSpecificImpl(
        document: TextDocument,
        file_path: string,
        iface_kind: string,
        data: any): Promise<CodeLens[]>
    {
        return this.code_info.edit_info.setFileInfo(file_path, data).then(
            () => {
                const doc: QoreTextDocument = {
                    uri: makeFileUri(file_path),
                    text: document.getText(),
                    languageId: document.languageId,
                    version: document.version
                };

                return qore_vscode.exports.getDocumentSymbols(doc, 'node_info').then(symbols => {
                    if (!symbols.length) {
                        return [];
                    }

                    let lenses: CodeLens[] = [];
                    data = this.code_info.yaml2FrontEnd(data);

                    symbols.forEach(symbol => {
                        if (!QorusProjectEditInfo.isQoreSymbolExpectedClass(symbol, data['class-name'])) {
                            return;
                        }

                        this.addClassLenses(iface_kind, lenses, qoreLoc2Range(symbol.name.loc), data);

                        if (!['service', 'mapper-code'].includes(iface_kind)) {
                            return;
                        }

                        for (const decl of symbol.declarations || []) {
                            if (!QorusProjectEditInfo.isQoreDeclPublicMethod(decl)) {
                                continue;
                            }

                            const method_name = decl.name.name;
                            const name_range = qoreLoc2Range(decl.name.loc);
                            this.addMethodLenses(iface_kind, lenses, name_range, data, method_name);
                        }
                    });

                    return lenses;
                });
            },

            error => {
                msg.error(error);
                return [];
            }
        );
    }
}
