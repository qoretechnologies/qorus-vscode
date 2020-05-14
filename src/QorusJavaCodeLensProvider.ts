import { CodeLens, TextDocument } from 'vscode';
import { TextDocument as LsTextDocument } from 'vscode-languageserver-types';

import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusCodeLensProviderBase } from './QorusCodeLensProvider';
import { makeFileUri } from './qorus_utils';
import { parseJavaInheritance } from './qorus_java_utils';
import { getJavaDocumentSymbolsWithWait } from './vscode_java';

export class QorusJavaCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        await this.code_info.edit_info.setFileInfo(file_path, data);
        return getJavaDocumentSymbolsWithWait(makeFileUri(file_path)).then(symbols => {
            if (!symbols || !symbols.length) {
                return this.previous_lenses;
            }
            let lenses: CodeLens[] = [];
            data = this.code_info.fixData(data);

            symbols.forEach(symbol => {
                if (!QorusProjectEditInfo.isJavaSymbolExpectedClass(symbol, data['class-name'])) {
                    return;
                }

                const lsdoc = LsTextDocument.create(makeFileUri(file_path), 'java', 1, document.getText());
                parseJavaInheritance(lsdoc, symbol);

                this.addClassLenses(iface_kind, lenses, symbol, data);

                if (!['service', 'mapper-code'].includes(iface_kind)) {
                    return;
                }

                for (const child of symbol.children || []) {
                    if (!this.code_info.edit_info.isJavaDeclPublicMethod(child, file_path)) {
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
