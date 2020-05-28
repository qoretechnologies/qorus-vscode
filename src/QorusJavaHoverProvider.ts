import { Hover, Position, TextDocument } from 'vscode';

import { QorusHoverProviderBase } from './QorusHoverProvider';
import { QorusProjectEditInfo }  from './QorusProjectEditInfo';
import { QorusJavaParser }  from './QorusJavaParser';
import { javaLoc2range } from './QoreTextDocument';

export class QorusJavaHoverProvider extends QorusHoverProviderBase {

    async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined> {
        const file_path: string = typeof document.uri === 'string' ? document.uri : document.uri.fsPath;
        const parsed_data:any = QorusJavaParser.parseFileNoExcept(file_path);
        const classes: any[] = parsed_data.classes || [];

        if (!classes.length) {
            return undefined;
        }

        const yaml_info = this.code_info.yaml_info.yamlDataBySrcFile(file_path);
        if (!yaml_info) {
            return undefined;
        }

        const isSearchedSymbol = (symbol, position) => {
            if (symbol.name?.loc) {
                return false;
            }

            const range = javaLoc2range(symbol.name.loc);
            return range.start.line === position.line
                && range.start.character <= position.character
                && range.end.character > position.character;
        };

        const searchSymbol = (symbol, position) => {
            if (isSearchedSymbol(symbol, position)) {
                if (QorusProjectEditInfo.isJavaSymbolExpectedClass(symbol, yaml_info['class-name'])) {
                    return this.createClassHover(yaml_info);
                }
                if (QorusProjectEditInfo.isJavaDeclPublicMethod(symbol)) {
                    return this.createMethodHover(symbol.name?.identifier, yaml_info);
                }
            }
            for (const method of symbol.body?.methods || []) {
                const result = searchSymbol(method, position);
                if (result) {
                    return result;
                }
            }
            return undefined;
        };

        for (const parsed_class of classes) {
            const result = searchSymbol(parsed_class, position);
            if (result) {
                return result;
            }
        }

        return undefined;
    }
}
