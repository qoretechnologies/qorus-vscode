import { expect } from 'chai';
import * as path from 'path';
import { EditorView, WebView, Workbench } from 'vscode-extension-tester';
import { projectFolder, sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    fillTextField,
    getElementAttribute,
    getSelectedFields,
    openInterface,
    resetAndFillTextField,
    selectField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

const target_dir = '_tests';
const target_file = ['test-mapper-3.45.qmapper.yaml', 'test-mapper-3.4.5.qmapper.yaml'];

export const createMapper = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Mapper');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    // submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-mapper', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'test-mapper');
    await fillTextField(webview, 'field-desc', 'Test mapper');
    await fillTextField(webview, 'field-version', '3.45');
    await sleep(500);
    await submitInterface(webview, 'mapper');
    await sleep(500);

    // next page
    await selectNthFilteredDropdownItem(webview, 'provider-inputs', 'null');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'provider-outputs', 'type');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'provider-outputs-0', 'qoretechnologies');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'provider-outputs-1', 'qorus-api');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'provider-outputs-2', 'jobs');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'provider-outputs-3', 'context');
    await sleep(1000);
    await clickElement(webview, 'provider-outputs-submit');
    await sleep(1000);

    await clickElement(webview, 'mapper-output-code-button-name');
    await sleep(1000);
    await selectField(webview, 'constant');
    await sleep(1000);
    await fillTextField(webview, 'field-constant', 'mapped-constant-name');
    await sleep(1000);
    await clickElement(webview, 'submit-mapping-modal');
    await sleep(1000);
    await submitInterface(webview, 'mapper');
    await sleep(1000);
};

export const checkFile = async (file_index: number) => {
    compareWithGoldFiles([target_file[file_index]]);
};

export const editMapper = async (workbench: Workbench, editorView: EditorView) => {
    await sleep(1000);
    const webview: WebView = await openInterface(
        workbench,
        editorView,
        path.join(projectFolder, target_dir, target_file[0])
    );

    await sleep(1000);
    await resetAndFillTextField(webview, 'field-version', '3.4.5');
    await sleep(1000);
    await resetAndFillTextField(webview, 'field-target_file', target_file[1]);
    await sleep(1000);
    await submitInterface(webview, 'mapper');
    await sleep(2000);
    await submitInterface(webview, 'mapper');
    await sleep(2000);
    return webview;
};
