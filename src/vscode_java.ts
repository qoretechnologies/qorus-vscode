import { extensions } from 'vscode';
import {
    DocumentSymbol,
    SymbolInformation,
} from 'vscode-languageserver-types';

export type DocumentSymbolsResponse = DocumentSymbol[] | SymbolInformation[] | null;

export const vscode_java = extensions.getExtension('redhat.java');

export async function getJavaDocumentSymbols(textDocumentUri: string): Promise<DocumentSymbolsResponse> {
    if (!vscode_java || !vscode_java.isActive) {
        return null;
    }
    return vscode_java.exports.getDocumentSymbols({
        textDocument: {
            uri: textDocumentUri
        }
    });
}

export async function getJavaDocumentSymbolsWithWait(textDocumentUri: string): Promise<DocumentSymbolsResponse> {
    if (!vscode_java) {
        return null;
    }
    for (let n = 0; !vscode_java.isActive && n < 100; ++n) {
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    return getJavaDocumentSymbols(textDocumentUri);
}
