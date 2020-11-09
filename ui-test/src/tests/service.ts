import { expect } from 'chai';
import * as path from 'path';
import { EditorView, WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    clickElement,
    fillTextField,
    getWebview,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const editService = async (editorView: EditorView) => {
    await openInterfaceFromTreeView('service-with-user-code');
    const webview = await getWebview(editorView);

    await selectNthFolder(webview, 'target_dir', 1);

    await sleep(500);
    await submitInterface(webview, 'service');

    // add the newMethod() method
    await sleep(500);
    await clickElement(webview, 'add-method-button');
    await sleep(500);
    await clickElement(webview, 'edit-method-name-button');
    await sleep(500);
    await fillTextField(webview, 'field-methodName', 'newMethod');
    await sleep(500);
    await clickElement(webview, 'save-method-name-button');
    await sleep(500);
    await fillTextField(webview, 'field-desc', 'new method');
    await sleep(500);

    // rename the prefix() method to addPrefix()
    await clickElement(webview, 'select-method-prefix');
    await sleep(500);
    await clickElement(webview, 'edit-method-name-button');
    await sleep(500);
    await fillTextField(webview, 'field-methodName', `${'\b'.repeat('prefix'.length)}addPrefix`);
    await sleep(500);
    await clickElement(webview, 'save-method-name-button');
    await sleep(500);

    // remove the uselessMethod() method
    await clickElement(webview, 'remove-method-uselessMethod');

    await sleep(500);
    await submitInterface(webview, 'service-methods');

    await sleep(2000);
    return webview;
};

export const checkFiles = async () => {
    await compareWithGoldFiles([
        'service-with-user-code-1.0.qsd',
        'service-with-user-code-1.0.qsd.yaml'
    ], true);
};
