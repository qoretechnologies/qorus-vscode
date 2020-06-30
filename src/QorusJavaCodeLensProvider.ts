import { CodeLens, TextDocument } from 'vscode';

import { QorusProjectEditInfo } from './QorusProjectEditInfo';
import { QorusCodeLensProviderBase } from './QorusCodeLensProviderBase';
import { QorusJavaParser }  from './QorusJavaParser';
import { javaLoc2Range } from './QoreTextDocument';

export class QorusJavaCodeLensProvider extends QorusCodeLensProviderBase {
    protected async provideLanguageSpecificImpl(_document: TextDocument, file_path: string, iface_kind: string, data: any): Promise<CodeLens[]> {

        await this.code_info.edit_info.setFileInfo(file_path, data);
        let lenses: CodeLens[] = [];
        data = this.code_info.fixData(data);

        const parsed_data: any = QorusJavaParser.parseFileNoExcept(file_path);
        parsed_data.classes.forEach(parsed_class => {
            if (!QorusProjectEditInfo.isJavaSymbolExpectedClass(parsed_class, data['class-name'])) {
                return;
            }

            this.addClassLenses(iface_kind, lenses, javaLoc2Range(parsed_class.name.loc), data);

            if (!['service', 'mapper-code'].includes(iface_kind)) {
                return;
            }

            for (const method of parsed_class.body.methods || []) {
                if (!QorusProjectEditInfo.isJavaDeclPublicMethod(method)) {
                    continue;
                }

                this.addMethodLenses(
                    iface_kind, lenses, javaLoc2Range(method.name.loc), data,
                    method.name.identifier, parsed_class.name.identifier
                );
            }

            this.previous_lenses = lenses;
        });
        return lenses;
    }
}
