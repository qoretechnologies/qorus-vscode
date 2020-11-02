import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    fillTextField,
    getElementAttribute,
    getSelectedFields,
    selectField,
    selectMultiselectItemsByNumbers,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

const target_dir = '_tests';
const target_file = 'TestMapperCode-v3.1.2.qmc.yaml';

export const createMapperCode = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Mapper Code');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(3);

    expect(await getElementAttribute(webview, 'interface-creator-submit-mapper-code', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);

    await sleep(500);
    await fillTextField(webview, 'field-class-class-name', 'TestMapperCode');
    await fillTextField(webview, 'field-version', 'v3.1.2');
    await sleep(500);
    await selectField(webview, 'desc');
    await sleep(500);
    await fillTextField(webview, 'field-desc', 'test mapper code');
    await sleep(500);
    await selectField(webview, 'author');
    await sleep(500);
    await fillTextField(webview, 'bp3-input-ghost', 'Test User', 1, 'className');
    await sleep(500);
    await selectMultiselectItemsByNumbers(webview, [1]);
    await sleep(500);
    await selectField(webview, 'lang');
    await sleep(500);
    await submitInterface(webview, 'mapper-code');
    await sleep(2000);

    // methods page
    await fillTextField(webview, 'field-name', 'someMapperCodeMethod');
    await fillTextField(webview, 'field-desc', 'some mapper code method');
    await sleep(500);
    await submitInterface(webview, 'mapper-methods');
    await sleep(2000);
};

export const checkFiles = async (gold_files_subfolder?: string) => {
    await compareWithGoldFiles([target_file, 'TestMapperCode-v3.1.2.qmc'], true);
};
