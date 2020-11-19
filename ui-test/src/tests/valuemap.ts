import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    fillTextField,
    getSelectedFields,
    removeField,
    resetAndFillTextField,
    selectAndFillField,
    selectField,
    selectMultiselectItemsByNumbers,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const opensValuemapPage = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Valuemap');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(2);
};

export const fillsValuemapFields = async (webview: WebView) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', `ValueMapTest`);
    await selectAndFillField(webview, 'desc', 'Value map test');

    await selectField(webview, 'author');
    await selectMultiselectItemsByNumbers(webview, [1]);

    await selectField(webview, 'exception');

    await selectField(webview, 'valuetype');
    await clickElement(webview, 'field-valuetype-radio-date');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(7);

    await clickElement(webview, 'field-valuetype-radio-string');

    await sleep(2000);

    expect(await getSelectedFields(webview)).to.have.length(6);

    await clickElement(webview, 'field-valuetype-radio-date');

    expect(await getSelectedFields(webview)).to.have.length(7);

    await removeField(webview, 'valuetype');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    await selectField(webview, 'valuetype');
    await clickElement(webview, 'field-valuetype-radio-string');
};

export const submitsValuemapAndChecksFiles = async (webview: WebView) => {
    await submitInterface(webview, 'value-map');

    await sleep(4000);

    await compareWithGoldFiles(['ValueMapTest.qvmap.yaml']);
};

export const editsValuemapAndChecksFiles = async (webview: WebView) => {
    await resetAndFillTextField(webview, 'field-name', `ValueMapTestEdited`);
    await resetAndFillTextField(webview, 'field-target_file', `ValueMapTestEdited`);

    await clickElement(webview, 'field-valuetype-radio-date');

    await submitInterface(webview, 'value-map');

    await sleep(4000);

    await compareWithGoldFiles(['ValueMapTestEdited.qvmap.yaml'], true);
};
