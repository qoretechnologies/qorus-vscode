import { CodeLens, TextDocument } from 'vscode';
import { TextDocument as lsTextDocument } from 'vscode-languageserver-types';

import { QorusCodeLensProviderBase } from './QorusCodeLensProvider';
import { makeFileUri } from './qorus_utils';
import { parseJavaInheritance } from './qorus_java_utils';
import { getJavaDocumentSymbolsWithWait } from './vscode_java';

export class QorusJavaCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        return getJavaDocumentSymbolsWithWait(makeFileUri(file_path)).then(symbols => {
            if (!symbols || !symbols.length) {
                return this.previous_lenses;
            }
            let lenses: CodeLens[] = [];
            data = this.code_info.fixData(data);

            symbols.forEach(symbol => {
                if (!this.code_info.isJavaSymbolExpectedClass(symbol, data['class-name'])) {
                    return;
                }

                const lsdoc = lsTextDocument.create(makeFileUri(file_path), 'java', 1, document.getText());
                parseJavaInheritance(lsdoc, symbol);
                this.code_info.addJavaClassCodeInfo(file_path, symbol, data['base-class-name'], false);
                this.addClassLenses(iface_kind, lenses, symbol, data);

                if (!['service', 'mapper-code'].includes(iface_kind)) {
                    return;
                }

                for (const child of symbol.children || []) {
                    if (!this.code_info.addJavaClassDeclCodeInfo(file_path, child)) {
                        continue;
                    }
                    this.addMethodLenses(
                        iface_kind, lenses, child.selectionRange, data,
                        child.name.replace(/\(.*\)/, ''), symbol.name
                    );
                }
            });

            this.previous_lenses = lenses;
            return lenses;
        });
    }
}
