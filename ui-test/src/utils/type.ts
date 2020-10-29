import { WebView } from 'vscode-extension-tester';
import { sleep } from './common';
import { clickElement, fillTextField, selectNthFilteredDropdownItem } from './webview';

export const createNewTypeField = async (webview: WebView, name: string, desc: string, type: string) => {
    await sleep(1000);
    await fillTextField(webview, 'field-name', name);
    await fillTextField(webview, 'field-desc', desc);
    await selectNthFilteredDropdownItem(webview, 'type.name', type);
    await sleep(500);
    await clickElement(webview, 'type-custom-field-submit');
    await sleep(1000);
};
