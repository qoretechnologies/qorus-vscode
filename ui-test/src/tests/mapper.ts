import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { WebView, Workbench } from 'vscode-extension-tester';
import {
    sleep,
    openInterface,
    compareWithGoldFiles,
    clickElement,
    getSelectedFields,
    getElementAttribute,
    fillTextField,
    selectNthFolder,
    selectField,
    submitInterface,
    selectNthFilteredDropdownItem,
} from '../common/utils';

const target_dir = 'arpm';
const target_file = 'test-mapper-3.45.qmapper.yaml';

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

export const checkFile = async (project_folder: string) => {
    compareWithGoldFiles(path.join(project_folder, target_dir), [ target_file ]);
};

export const editMapper = async (webview: WebView, workbench: Workbench, project_folder: string) => {
    await sleep(1000);
    openInterface(webview, workbench, path.join(project_folder, target_dir, target_file));
    await sleep(4000);
    // more to do
};
