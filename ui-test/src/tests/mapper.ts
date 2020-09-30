import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import {
    sleep,
    compareWithGoldFiles,
    clickElement,
    getSelectedFields,
    getElementAttribute,
    fillTextField,
    selectNthFolder,
    selectField,
    getNthElement,
    submitInterface,
    selectNthDropdownItem,
    selectNthFilteredDropdownItem,
    confirmDialog,
} from '../common/utils';

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
    await sleep(4000);
};
