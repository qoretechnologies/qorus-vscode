import { CodeLens, TextDocument } from 'vscode';

import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusPythonParser }  from './QorusPythonParser';
import { findPythonClassNameRange, findPythonDefNameRange } from './QoreTextDocument';

export class QorusPythonCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(_document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        await this.code_info.edit_info.setFileInfo(file_path, data);
        let lenses: CodeLens[] = [];
        data = this.code_info.fixData(data);

        const parsed_data: any = QorusPythonParser.parseFileNoExcept(file_path);
        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isPythonSymbolExpectedClass(parsed_class, data['class-name'])) {
                return;
            }

            const class_name_range = findPythonClassNameRange(_document, parsed_class.loc);
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

                const meth_name_range = findPythonDefNameRange(_document, method.loc);
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
