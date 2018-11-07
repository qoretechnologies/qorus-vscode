import { ExtensionContext } from 'vscode';

class QorusExtension {
    context: ExtensionContext | undefined = undefined;
}

export const extension = new QorusExtension();
