import { expect } from 'chai';
import * as path from 'path';
import { By, EditorView, WebView, Workbench } from 'vscode-extension-tester';
import {
    clickElement,
    compareWithGoldFiles,
    confirmDialog,
    fillTextField,
    getElementAttribute,
    getNthElement,
    getSelectedFields,
    openInterface,
    selectField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    sleep,
    submitInterface,
} from '../common/utils';

const target_dir = 'arpm';

export const createServiceClass = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Class');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    // submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-class', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-class-class-name', 'ServiceClassWithConfigItems');
    await fillTextField(webview, 'field-desc', 'Test service class with config items');
    await fillTextField(webview, 'field-version', '1.2');
    await selectField(webview, 'base-class-name');
    await sleep(500);
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusService');

    await openConfigItemManager(webview);
    await openAddConfigItem(webview);

    // edit config item page
    await sleep(500);
    await fillTextField(webview, 'field-name', 'test-config-item-1');
    await fillTextField(webview, 'field-description', 'test config item of a base class');
    await fillTextField(webview, 'field-config_group', 'test');
    await clickElement(webview, 'field-type-radio-int');
    await selectField(webview, 'default_value');
    await sleep(500);
    await fillTextField(webview, 'field-default_value', 54);
    await sleep(500);
    await selectField(webview, 'allowed_values');
    await sleep(1000);
    await fillTextField(webview, 'field-allowed_values-1', 54);
    await sleep(500);
    await submitInterface(webview, 'config-item');

    // close config items page (by clicking [X]) and submit class
    await sleep(1000);
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();
    await sleep(1000);
    await submitInterface(webview, 'class');
    await sleep(2000);
};

export const createClass = async (webview: WebView, editorView: EditorView) => {
    await webview.switchBack();
    await editorView.openEditor('Qorus Webview');
    await webview.switchToFrame();
    await sleep(500);

    await clickElement(webview, 'button-create-new', 1, 'id');
    await sleep(500);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-class-class-name', 'ClassWithConfigItems');
    await fillTextField(webview, 'field-desc', 'Test class with config items');
    await fillTextField(webview, 'field-version', '1.3');

    await openConfigItemManager(webview);
    await openAddConfigItem(webview);

    // edit config item page
    await sleep(500);
    await fillTextField(webview, 'field-name', 'test-config-item-2');
    await fillTextField(webview, 'field-description', 'test config item of a base class');
    await selectField(webview, 'default_value');
    await sleep(500);
    await fillTextField(webview, 'field-default_value', 'default text');
    await sleep(500);
    await submitInterface(webview, 'config-item');

    // close config items page (by clicking [X]) and submit class
    await sleep(1000);
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();
    await sleep(1000);
    await submitInterface(webview, 'class');
    await sleep(2000);
};

// service that inherits the service class and uses the other class
export const createService = async (webview: WebView, editorView: EditorView) => {
    await webview.switchBack();
    await editorView.openEditor('Qorus Webview');
    await webview.switchToFrame();
    await sleep(500);

    await clickElement(webview, 'Service');
    await sleep(2000);
    confirmDialog(webview);

    await sleep(2000);
    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'service-inheriting-config-items');
    await fillTextField(webview, 'field-desc', 'Test service inheriting config items');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'ServiceClassWithConfigItems');
    await fillTextField(webview, 'field-version', '1.23');
    await selectField(webview, 'classes');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'name', 'ClassWithConfigItems', 1, 2); // '2' since the first 'name' is in the service
    await sleep(1000);

    await openConfigItemManager(webview);
    await openAddConfigItem(webview);

    // edit config item page
    await sleep(2000);
    await fillTextField(webview, 'field-name', 'test-config-item-3', 3); // '3' since there are another two 'name's
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
    await sleep(1000);
};

export const checkFiles = async (project_folder: string) => {
    await compareWithGoldFiles(path.join(project_folder, target_dir), [
        'ServiceClassWithConfigItems-1.2.qclass',
        'ServiceClassWithConfigItems-1.2.qclass.yaml',
        'ClassWithConfigItems-1.3.qclass',
        'ClassWithConfigItems-1.3.qclass.yaml',
        'service-inheriting-config-items-1.23.qsd',
        'service-inheriting-config-items-1.23.qsd.yaml',
    ]);
};

export const editInterface = async (webview: WebView, workbench: Workbench, project_folder: string) => {
    await sleep(1000);
    await openInterface(webview, workbench, path.join(project_folder, target_dir, 'ClassWithConfigItems-1.3.qclass.yaml'));
    await sleep(4000);
    // more to do
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
