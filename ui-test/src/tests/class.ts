import { expect } from 'chai';
import * as path from 'path';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    addNewMultiSelectItemAndSelectIt,
    clickElement,
    confirmDialog,
    fillTextField,
    getNthElement,
    selectField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const editClass = async (webview: WebView) => {
    await openInterfaceFromTreeView('ClassToEdit', webview);
    await selectNthFolder(webview, 'target_dir', 1);
    await selectField(webview, 'base-class-name');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'JavaBaseClass');
    await addNewMultiSelectItemAndSelectIt(webview, 'additional author');
    await clickElement(webview, 'remove-field-requires');
    await confirmDialog(webview);
    await selectField(webview, 'tags');
    await fillTextField(webview, 'field-key', 'first-tag');
    await fillTextField(webview, 'field-value', 'first tag value');
    await clickElement(webview, 'field-tags-add-new');
    await sleep(300);
    await fillTextField(webview, 'field-key', 'second-tag', 2);
    await fillTextField(webview, 'field-value', 'second tag value', 2);
    await submitInterface(webview, 'class');
    await sleep(500);
};

export const createsClassFromClass = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Class');

    await sleep(3000);

    await selectField(webview, 'base-class-name');
    await sleep(2000);
    await clickElement(webview, 'field-base-class-name-reference-add-new');
    await sleep(5000);

    await selectNthFolder(webview, 'target_dir', 1, 2);
    await fillTextField(webview, 'field-class-class-name', 'ClassFromClassTest', 2);
    await fillTextField(webview, 'field-desc', 'Class from class test', 2);
    await fillTextField(webview, 'field-version', '2.0', 2);

    await clickElement(webview, 'interface-creator-submit-class', 2);

    await sleep(10000);

    await compareWithGoldFiles(['ClassFromClassTest-2.0.qclass.yaml']);

    expect(await (await getNthElement(webview, 'field-base-class-name')).getText()).to.eq('ClassFromClassTest');
};

export const checkFiles = async () => {
    await compareWithGoldFiles(
        [path.join('ClassToEdit-7.8-class', 'ClassToEdit.java'), 'ClassToEdit-7.8.qclass.yaml'],
        true
    );
};
