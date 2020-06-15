import { Hover, Position, TextDocument } from 'vscode';

import { QorusHoverProviderBase } from './QorusHoverProviderBase';
import { QorusProjectEditInfo }  from './QorusProjectEditInfo';
import { QorusPythonParser }  from './QorusPythonParser';
import { pythonNameRange, pythonLoc2Range } from './QoreTextDocument';


export class QorusPythonHoverProvider extends QorusHoverProviderBase {
    async provideHoverImpl(document: TextDocument, position: Position): Promise<Hover|undefined> {
        const file_path: string = typeof document.uri === 'string' ? document.uri : document.uri.fsPath;
        const parsed_data:any = QorusPythonParser.parseFileNoExcept(file_path);
        const classes: any[] = parsed_data.classes || [];

        if (!classes.length) {
            return undefined;
        }

        const yaml_info = this.code_info.yaml_info.yamlDataBySrcFile(file_path);
        if (!yaml_info) {
            return undefined;
        }

        const isSearchedClass = (symbol, position) => {
            if (!symbol.loc) {
                return false;
            }

            const class_range = pythonLoc2Range(symbol.loc);
            const range = pythonNameRange(
                document.lineAt(class_range.start.line).text,
                class_range,
                yaml_info['class-name'],
                'class'
            );
            if (!range) {
                return false;
            }
            return range.start.line === position.line
                && range.start.character <= position.character
                && range.end.character > position.character;
        };

        const isSearchedMethod = (symbol, position) => {
            if (!symbol.loc) {
                return false;
            }

            const method_range = pythonLoc2Range(symbol.loc);
            const range = pythonNameRange(
                document.lineAt(method_range.start.line).text,
                method_range,
                symbol.name,
                'def'
            );
            if (!range) {
                return false;
            }
            return range.start.line === position.line
                && range.start.character <= position.character
                && range.end.character > position.character;
        };

        const searchSymbol = (symbol, position) => {
            if (isSearchedClass(symbol, position)) {
                if (QorusProjectEditInfo.isPythonSymbolExpectedClass(symbol, yaml_info['class-name'])) {
                    return this.createClassHover(yaml_info);
                }
            }
            if (isSearchedMethod(symbol, position)) {
                if (QorusProjectEditInfo.isPythonDeclPublicMethod(symbol)) {
                    return this.createMethodHover(symbol.name, yaml_info);
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
