import * as fs from 'fs';
import * as path from 'path';
import { expect } from 'chai';
import { By, WebView, EditorView } from 'vscode-extension-tester';
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
} from '../common/utils';


export const createServiceClassWithConfigItems = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Class');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    // submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-class', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-class-class-name', 'ServiceClassWithConfigItems');
    await fillTextField(webview, 'field-desc', 'Test class with config items');
    await fillTextField(webview, 'field-version', '1.2');
    await selectField(webview, 'base-class-name');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusService');

    await openConfigItemManager(webview);
    await openAddConfigItem(webview);

    // edit config item page
    await sleep(1000);
    await fillTextField(webview, 'field-name', 'test-config-item-1');
    await fillTextField(webview, 'field-description', 'test config item of a base class');
    await fillTextField(webview, 'field-config_group', 'test');
    await clickElement(webview, 'field-type-radio-int');
    await selectField(webview, 'default_value');
    await sleep(1000);
    await fillTextField(webview, 'field-default_value', 54);
    await sleep(1000);
    await submitInterface(webview, 'config-item');

    // close config items page (by clicking [X]) and submit class
    await sleep(1000);
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();
    await sleep(1000);
    await submitInterface(webview, 'class');
    await sleep(3000);
};

// service that inherits the previous class
export const createServiceWithConfigItems = async (webview: WebView, editorView: EditorView, folder: string) => {
    await webview.switchBack();
    await editorView.openEditor('Qorus Webview');
    await webview.switchToFrame();
    await sleep(500);

    await clickElement(webview, 'Service');
    await sleep(500);
    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'service-inheriting-config-items');
    await fillTextField(webview, 'field-desc', 'Test service inheriting class with config items');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'ServiceClassWithConfigItems');
    await fillTextField(webview, 'field-version', '1.23');

    await openConfigItemManager(webview);
    await openAddConfigItem(webview);

    // edit config item page
    await sleep(2000);
    await fillTextField(webview, 'field-name', 'test-config-item-2', 2); // first 'name' is in the service
    await fillTextField(webview, 'field-description', 'test config item');
    await clickElement(webview, 'field-type-radio-list');
    await submitInterface(webview, 'config-item');

    // close config item manager
    await sleep(1000);
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();

    // move to methods step with the Next button
    await sleep(1000);
    const nextButton = await getNthElement(webview, 'interface-creator-submit-service');
    expect(await nextButton.getAttribute('disabled')).to.equal(null);
    await nextButton.click();

    // open the edit method name dialog
    await sleep(1000);
    const editMethodNameButton = await getNthElement(webview, 'edit-method-name-button');
    await editMethodNameButton.click();

    // edit method name dialog
    await sleep(1000);
    await fillTextField(webview, 'field-methodName', `${'\b'.repeat('init'.length)}someMethod`);
    const saveMethodNameButton = await getNthElement(webview, 'save-method-name-button');
    await saveMethodNameButton.click();

    // fill description and submit
    await sleep(1000);
    await fillTextField(webview, 'field-desc', 'some method');
    await sleep(1000);
    await submitInterface(webview, 'service-methods');
};

export const checkFiles = async (project_folder: string) => {
    compareWithGoldFiles(path.join(project_folder, 'arpm'), [
        'ServiceClassWithConfigItems-1.2.qclass',
        'ServiceClassWithConfigItems-1.2.qclass.yaml',
        'service-inheriting-config-items-1.23.qsd',
        'service-inheriting-config-items-1.23.qsd.yaml'
    ]);
};

const openConfigItemManager = async (webview: WebView) => {
    await sleep(1000);
    const manageConfig = await getNthElement(webview, 'interface-creator-manage-config-items');
    expect(await manageConfig.getAttribute('disabled')).to.equal(null);
    await manageConfig.click();
};

const openAddConfigItem = async (webview: WebView) => {
    await sleep(1000);
    const addConfigItem = await getNthElement(webview, 'add-config-item');
    expect(await addConfigItem.getAttribute('disabled')).to.equal(null);
    await addConfigItem.click();
};
