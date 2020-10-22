import { expect } from 'chai';
import { By, WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import {
    clickElement,
    closeLastDialog,
    confirmDialog,
    fillTextField,
    getElements,
    getElementsCount,
} from '../utils/webview';

export const openEnvironmentPage = async (webview: WebView) => {
    await sleep(3000);
    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(1);
};

export const addEnvironment = async (webview: WebView) => {
    const environmentButton = await webview.findWebElement(By.name('new-environment-add'));
    await environmentButton.click();

    const environmentInput = await webview.findWebElement(By.name('new-environment'));
    expect(environmentInput).to.exist;
    await environmentInput.sendKeys('test environment');

    const environmentSubmit = await webview.findWebElement(By.name('new-environment-submit'));
    await environmentSubmit.click();

    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(2);
};

export const deleteEnvironment = async (webview: WebView) => {
    let environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(2);
    const environmentDeleteButtons = await webview.findWebElements(By.name('delete-environment'));
    expect(environmentDeleteButtons).to.have.length(2);
    await environmentDeleteButtons[1].click();
    await confirmDialog(webview);
    environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(1);
};

export const renameEnvironment = async (webview: WebView) => {
    const environmentEditButtons = await webview.findWebElements(By.name('edit-environment'));
    await environmentEditButtons[1].click();
    const environmentEditInput = await webview.findWebElements(By.name('environment-edit-input'));
    expect(environmentEditInput).to.have.length(1);
    await environmentEditInput[0].sendKeys(' Edited');
    const environmentEditSubmit = await webview.findWebElements(By.name('edit-environment-submit'));
    await environmentEditSubmit[0].click();
    const environmentNames = await webview.findWebElements(By.name('environment-name'));
    const newText = await environmentNames[1].getText();
    expect(newText).to.equal('test environment Edited');
};

export const addInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-add')))[0].click();
    await (await webview.findWebElement(By.name('instance'))).sendKeys('test');
    await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://google.com');
    await (await webview.findWebElement(By.name('instance-submit'))).click();

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(2);
    expect(links).to.have.length(2);
    expect(await links[1].getText()).to.equal('test');
    expect(await links[1].getAttribute('href')).to.equal('https://google.com/');
};

export const editInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-edit')))[1].click();
    await (await webview.findWebElement(By.name('instance'))).clear();
    await (await webview.findWebElement(By.name('instance'))).sendKeys('new instance');
    await (await webview.findWebElement(By.name('instance-url'))).clear();
    await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://synthax.io');
    await (await webview.findWebElement(By.name('instance-submit'))).click();

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(2);
    expect(links).to.have.length(2);
    expect(await links[1].getText()).to.equal('new instance');
    expect(await links[1].getAttribute('href')).to.equal('https://synthax.io/');
};

export const deleteInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-delete')))[1].click();
    await confirmDialog(webview);

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(1);
    expect(links).to.have.length(1);
    expect(await links[0].getText()).to.equal('rippy IP');
};

export const addUrl = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-expand')))[0].click();
    await (await webview.findWebElement(By.name('other-url-add'))).click();
    await (await webview.findWebElement(By.name('other-url'))).sendKeys('second url');
    await (await webview.findWebElement(By.name('other-url-url'))).sendKeys('https://twitter.com');
    await (await webview.findWebElement(By.name('other-url-submit'))).click();

    const items = await webview.findWebElements(By.name('other-url-item'));
    const links = await webview.findWebElements(By.name('other-url-link'));

    expect(items).to.have.length(1);
    expect(links).to.have.length(1);
    expect(await items[0].getText()).to.equal('1. second url [https://twitter.com]');
    expect(await links[0].getAttribute('href')).to.equal('https://twitter.com/');
};

export const deleteUrl = async (webview: WebView) => {
    await (await webview.findWebElement(By.name('other-url-delete'))).click();
    await confirmDialog(webview);

    const items = await webview.findWebElements(By.name('other-url-item'));

    expect(items).to.have.length(0);
};

export const addAndRemoveSourceDirectory = async (webview: WebView) => {
    await sleep(3000);

    await clickElement(webview, 'manage-source-dirs');

    await sleep(1500);

    await clickElement(webview, 'folder-expander-source-dirs');
    await clickElement(webview, 'bp3-tree-node-caret', 1, 'className');

    await sleep(100);

    const sourceDirs = await getElementsCount(webview, 'source-dir');
    const els = await getElements(webview, 'bp3-tree-node-content-1', 'className');

    for await (const element of els) {
        const text = await element.getText();

        if (text === 'building-blocks') {
            await element.click();
            await sleep(200);
            expect(await getElementsCount(webview, 'source-dir')).to.eq(sourceDirs - 1);
            await element.click();
            await sleep(200);
            expect(await getElementsCount(webview, 'source-dir')).to.eq(sourceDirs);
            break;
        }
    }

    await clickElement(webview, 'source-dir-remove');
    await confirmDialog(webview);

    await sleep(300);

    expect(await getElementsCount(webview, 'source-dir')).to.eq(sourceDirs - 1);

    await closeLastDialog(webview);

    await sleep(2000);
};

export const createNewSourceDir = async (webview: WebView) => {
    await sleep(3000);

    await clickElement(webview, 'manage-source-dirs');

    await sleep(500);

    await clickElement(webview, 'folder-expander-source-dirs');

    await sleep(1000);

    await clickElement(webview, 'bp3-tree-node-caret', 1, 'className');

    const sourceDirs = await getElementsCount(webview, 'source-dir');
    const dirs = await getElementsCount(webview, 'bp3-tree-node-content-1', 'className');

    await clickElement(webview, 'create-new-dir-test_project');

    await sleep(500);

    await fillTextField(webview, 'field-new-directory', 'mydir');

    await sleep(200);

    await clickElement(webview, 'submit-new-folder-add-source');

    await sleep(8000);

    expect(await getElementsCount(webview, 'bp3-tree-node-content-1', 'className')).to.eq(dirs + 1);
    expect(await getElementsCount(webview, 'source-dir')).to.eq(sourceDirs + 1);

    await closeLastDialog(webview);

    await sleep(2000);
};
