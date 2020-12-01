import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    fillTextField,
    getSelectedFields,
    resetAndFillTextField,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const opensErrorsPage = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Errors');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(3);
};

export const fillsErrorsFields = async (webview: WebView) => {
    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'ErrorsTest');
    await fillTextField(webview, 'field-desc', 'Errors test');
    await submitInterface(webview, 'errors');
    await sleep(2000);
};

export const addsError = async (webview: WebView) => {
    // methods page
    await fillTextField(webview, 'field-name', 'Error 1');
    await fillTextField(webview, 'field-desc', 'error 1');
    await clickElement(webview, 'add-all-fields');
    await sleep(1500);
    await clickElement(webview, 'field-status-radio-RETRY');
    await sleep(1000);
    await fillTextField(webview, 'field-retry-delay', 30);
};

export const submitsErrorsAndChecksFiles = async (webview: WebView) => {
    await submitInterface(webview, 'error');
    await sleep(3000);

    await compareWithGoldFiles(['ErrorsTest.qerrors.yaml']);
};

export const editsErrorsAndChecksFiles = async (webview: WebView) => {
    await resetAndFillTextField(webview, 'field-name', 'ErrorsTestEdited');
    await resetAndFillTextField(webview, 'field-target_file', 'ErrorsTestEdited');
    await submitInterface(webview, 'errors');
    await sleep(2000);
    await clickElement(webview, 'add-error-button');
    await fillTextField(webview, 'field-name', 'Error 2');
    await fillTextField(webview, 'field-desc', 'Error 2');

    await submitInterface(webview, 'error');
    await sleep(3000);

    await compareWithGoldFiles(['ErrorsTestEdited.qerrors.yaml'], true);
};
