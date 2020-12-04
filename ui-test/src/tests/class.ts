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
    getNthElement,
    getWebview,
    selectField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const createsClassFromClass = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Class');

    await sleep(1000);

    await selectField(webview, 'requires');

    await sleep(1000);

    await clickElement(webview, 'field-name-reference-add-new');

    await sleep(3000);

    await fillTextField(webview, 'field-class-class-name', 'ClassFromClass');
    await fillTextField(webview, 'field-desc', 'Class created from class', 2);
    await fillTextField(webview, 'field-version', '1.0', 2);

    await submitInterface(webview, 'class', 2);

    await sleep(3000);

    expect(await (await getNthElement(webview, 'field-name')).getText()).to.eq('ClassFromClass');
};

export const editClass = async (editorView: EditorView) => {
    await openInterfaceFromTreeView('ClassToEdit');
    const webview = await getWebview(editorView);

    await selectNthFolder(webview, 'target_dir', 1);
    await selectField(webview, 'base-class-name');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'JavaBaseClass');
    await addNewMultiSelectItemAndSelectIt(webview, 'additional author');
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
    await compareWithGoldFiles(
        [path.join('ClassToEdit-7.8-class', 'ClassToEdit.java'), 'ClassToEdit-7.8.qclass.yaml'],
        true
    );
};
