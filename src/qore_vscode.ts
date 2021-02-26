import { extensions } from 'vscode';
export const qore_vscode = extensions.getExtension('qoretechnologies.qore-vscode');

let is_availability_known = false;
let is_lang_client_available = false;
export async function isLangClientAvailable(): Promise<boolean> {
    if (!is_availability_known) {
        is_lang_client_available = await qore_vscode.exports.isLangClientAvailable();
        is_availability_known = true;
    }
    return Promise.resolve(is_lang_client_available);
}
