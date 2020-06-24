import { CodeLens, TextDocument } from 'vscode';
import { t } from 'ttag';

import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusPythonParser }  from './QorusPythonParser';
import { pythonNameRange, pythonLoc2Range } from './QoreTextDocument';
import * as msg from './qorus_message';

export class QorusPythonCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {
        await this.code_info.edit_info.setFileInfo(file_path, data);
        let lenses: CodeLens[] = [];
        data = this.code_info.fixData(data);

        let parsed_data: any;
        try {
            parsed_data = QorusPythonParser.parseFile(file_path);
        } catch (error) {
            msg.error(t`ErrorParsingFile ${file_path}`);
            msg.debug({error});
            return [];
        }

        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isPythonSymbolExpectedClass(parsed_class, data['class-name'])) {
                return;
            }

            const class_range = pythonLoc2Range(parsed_class.loc);
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

                const method_range = pythonLoc2Range(method.loc);
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
