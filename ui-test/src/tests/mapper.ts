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
    selectNthFolder,
    selectProviderData,
    submitInterface,
} from '../utils/webview';

const target_dir = '_tests';
const target_file = ['test-mapper-3.45.qmapper.yaml', 'test-mapper-3.4.5.qmapper.yaml'];

export const opensMapperCreatePage = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Mapper');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    // submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-mapper', 'disabled')).to.equal('true');
};

export const fillsMapperFields = async (webview: WebView) => {
    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'test-mapper');
    await fillTextField(webview, 'field-desc', 'Test mapper');
    await fillTextField(webview, 'field-version', '3.45');
    await sleep(500);
    await submitInterface(webview, 'mapper');
    await sleep(500);
};

export const addsInputOutputProviders = async (webview: WebView) => {
    await selectProviderData(webview, ['factory', 'db'], 'inputs');
    await selectProviderData(webview, ['type', 'qoretechnologies', 'qorus-api', 'jobs', 'context'], 'outputs');
    await clickElement(webview, 'provider-outputs-submit');
    await sleep(1000);
};

export const addMapperMapping = async (webview: WebView) => {
    await clickElement(webview, 'mapper-output-code-button-name');
    await sleep(1000);
    await selectField(webview, 'constant');
    await sleep(1000);
    await fillTextField(webview, 'field-constant', 'mapped-constant-name');
    await sleep(1000);
    await clickElement(webview, 'submit-mapping-modal');
    await sleep(1000);
};

export const submitsMapperAndchecksFile = async (webview: WebView) => {
    await submitInterface(webview, 'mapper');
    await sleep(3000);
    compareWithGoldFiles([target_file[0]]);
};

export const editsMapperAndChecksFile = async (workbench: Workbench, editorView: EditorView) => {
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

    compareWithGoldFiles([target_file[1]]);
    return webview;
};
