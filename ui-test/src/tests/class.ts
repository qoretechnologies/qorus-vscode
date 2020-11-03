import { expect } from 'chai';
import * as path from 'path';
import { EditorView, WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    addNewMultiSelectItemAndSelectIt,
    clickElement,
    confirmDialog,
    getWebview,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const editClass = async (editorView: EditorView) => {
    await openInterfaceFromTreeView('ClassToEdit');
    const webview = await getWebview(editorView);
    await sleep(500);

    await selectNthFolder(webview, 'target_dir', 1);
    await addNewMultiSelectItemAndSelectIt(webview, 'additional author'); // doesn't work now, selects first instead
    await clickElement(webview, 'remove-field-requires');
    await sleep(500);
    await confirmDialog(webview);
    await sleep(500);
    await submitInterface(webview, 'class');
    await sleep(2000);

    return webview;
};

export const checkFiles = async () => {
    await compareWithGoldFiles([
        path.join('ClassToEdit-7.8-class', 'ClassToEdit.java'),
        'ClassToEdit-7.8.qclass.yaml'
    ], true);
};
