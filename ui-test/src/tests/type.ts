import { expect } from 'chai';
import * as path from 'path';
import { WebView } from 'vscode-extension-tester';
import { projectFolder, sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { createNewTypeField } from '../utils/type';
import {
    clickElement,
    confirmDialog,
    fillTextField,
    getElementsCount,
    getNthElement,
    getSelectedFields,
    selectNthFolder,
} from '../utils/webview';

export const opensTypePage = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Type');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(3);
};

export const fillsTypeFields = async (webview: WebView) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-target-dir', 'TypeTest');
    await fillTextField(webview, 'field-path', '/');
    await clickElement(webview, 'bp3-fixed-top', 1, 'className');

    await sleep(1000);
};

export const addsTypeFields = async (webview: WebView) => {
    await clickElement(webview, 'type-add-field');
    await sleep(2000);
    await createNewTypeField(webview, 'Field5', 'Field 1', 'hash<auto>');
    await sleep(1000);
    await clickElement(webview, 'add-new-diagram-field');
    await sleep(2000);
    await createNewTypeField(webview, 'Child1', 'Child 1', 'hash<auto>');
    await sleep(1000);
    await clickElement(webview, 'type-add-field');
    await sleep(2000);
    await createNewTypeField(webview, 'Field2', 'Field 2', 'string');
    await sleep(1000);
    expect(await getElementsCount(webview, 'diagram-field')).to.eq(3);
};

export const renamesTypeField = async (webview: WebView) => {
    await clickElement(webview, 'edit-diagram-field', 1);
    await sleep(2000);
    await clickElement(webview, 'reset-field-name');
    await fillTextField(webview, 'field-name', 'Field1');
    await clickElement(webview, 'type-custom-field-submit');
    await sleep(1500);

    expect(await (await getNthElement(webview, 'diagram-field', 1)).getText()).to.eq('Field1\nhash<auto>');
};

export const deletesTypeField = async (webview: WebView) => {
    await clickElement(webview, 'type-add-field');
    await sleep(2000);
    await createNewTypeField(webview, 'Field3', 'Field 3', 'hash<auto>');
    await sleep(1000);
    await clickElement(webview, 'add-new-diagram-field', 3);
    await sleep(2000);
    await createNewTypeField(webview, 'Child2', 'Child 2', 'hash<auto>');
    await sleep(1000);
    expect(await getElementsCount(webview, 'diagram-field')).to.eq(5);
    await clickElement(webview, 'delete-diagram-field', 4);
    await sleep(300);
    await confirmDialog(webview);
    await sleep(500);
    expect(await getElementsCount(webview, 'diagram-field')).to.eq(3);
};

export const submitsTypeAndChecksFiles = async (webview: WebView) => {
    await clickElement(webview, 'type-submit');
    await sleep(4000);

    await compareWithGoldFiles(path.join(projectFolder, '_tests'), ['TypeTest.qtype.yaml']);
};
