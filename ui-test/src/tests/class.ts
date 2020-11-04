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
    fillTextField,
    getWebview,
    selectField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const editClass = async (editorView: EditorView) => {
    await openInterfaceFromTreeView('ClassToEdit');
    const webview = await getWebview(editorView);

    await selectNthFolder(webview, 'target_dir', 1);
    await selectField(webview, 'base-class-name');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'JavaBaseClass');
    await addNewMultiSelectItemAndSelectIt(webview, 'additional author'); // doesn't work now, selects first instead
    await clickElement(webview, 'remove-field-requires');
    await confirmDialog(webview);
    await selectField(webview, 'tags');
    await fillTextField(webview, 'field-key', 'first-tag');
    await fillTextField(webview, 'field-value', 'first tag value');
    await clickElement(webview, 'bp3-icon-add', 2, 'className');
    await fillTextField(webview, 'field-key', 'second-tag', 2);
    await fillTextField(webview, 'field-value', 'second tag value', 2);
    await submitInterface(webview, 'class');
    await sleep(500);

    return webview;
};

export const checkFiles = async () => {
    await compareWithGoldFiles([
        path.join('ClassToEdit-7.8-class', 'ClassToEdit.java'),
        'ClassToEdit-7.8.qclass.yaml'
    ], true);
};
