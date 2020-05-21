import { expect } from 'chai';
import { WebView, EditorView } from 'vscode-extension-tester';
import {
    sleep,
    clickElement,
    getSelectedFields,
    getElementAttribute,
    fillTextField,
    selectNthFolder,
    getNthElement,
} from './lib_tests';


export const createClassWithConfigItems = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Class');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(5);

    // submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-class', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-class-class-name', 'ClassWithConfigItems');
    await fillTextField(webview, 'field-desc', 'Test class with config items');
    await fillTextField(webview, 'field-version', '1.0');

    await sleep(2000);
    const manageConfig = await getNthElement(webview, 'interface-creator-manage-config-items');
    expect(await manageConfig.getAttribute('disabled')).to.equal(null);
    await manageConfig.click();

    // config items page
    await sleep(2000);
    const addConfigItem = await getNthElement(webview, 'add-config-item');
    expect(await addConfigItem.getAttribute('disabled')).to.equal(null);
    await addConfigItem.click();

    // edit config item page
    await sleep(2000);
    await (() => {
        fillTextField(webview, 'field-name', 'test-config-item-1');
        fillTextField(webview, 'field-description', 'test config item');
        fillTextField(webview, 'field-config_group', 'test');
    });
    await sleep(2000);
};
