import { CodeLens, TextDocument } from 'vscode';

import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusPythonParser }  from './QorusPythonParser';
import { pythonNameRange, pythonLoc2range } from './QoreTextDocument';

export class QorusPythonCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        await this.code_info.edit_info.setFileInfo(file_path, data);
        let lenses: CodeLens[] = [];
        data = this.code_info.fixData(data);

        const parsed_data: any = QorusPythonParser.parseFileNoExcept(file_path);
        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isPythonSymbolExpectedClass(parsed_class, data['class-name'])) {
                return;
            }

            const class_range = pythonLoc2range(parsed_class.loc);
            const class_name_range = pythonNameRange(
                document.lineAt(class_range.start.line).text,
                class_range,
                data['class-name'],
                'class'
            );
            if (!class_name_range) {
                return;
            }
            this.addClassLenses(iface_kind, lenses, class_name_range, data);

            if (!['service', 'mapper-code'].includes(iface_kind)) {
                return;
            }

            for (const method of parsed_class.body.methods || []) {
                if (!QorusProjectEditInfo.isPythonDeclPublicMethod(method)) {
                    continue;
                }

                const method_range = pythonLoc2range(method.loc);
                const meth_name_range = pythonNameRange(
                    document.lineAt(method_range.start.line).text,
                    method_range,
                    method.name,
                    'def'
                );
                if (!meth_name_range) {
                    continue;
                }
                this.addMethodLenses(
                    iface_kind, lenses, meth_name_range, data,
                    method.name, parsed_class.name
                );
            }

            this.previous_lenses = lenses;
        });
        return lenses;
    }
}
