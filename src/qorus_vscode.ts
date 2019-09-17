import { ExtensionContext } from 'vscode';

export class QorusExtension {
    private static extension_context: ExtensionContext;

    static get context(): ExtensionContext {
        return QorusExtension.extension_context;
    }

    static set context(context: ExtensionContext) {
        QorusExtension.extension_context = context;
    }
}
