import { expect } from 'chai';
import { By, WebView } from 'vscode-extension-tester';
import { sleep, confirmDialog } from '../common/utils';

export const openEnvironmentPage = async (webview: WebView) => {
    await sleep(3000);
    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(4);
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
    expect(environmentPanels).to.have.length(5);
};

export const deleteEnvironment = async (webview: WebView) => {
    let environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(5);
    const environmentDeleteButtons = await webview.findWebElements(By.name('delete-environment'));
    expect(environmentDeleteButtons).to.have.length(5);
    await environmentDeleteButtons[4].click();
    await confirmDialog(webview);
    environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(4);
};

export const renameEnvironment = async (webview: WebView) => {
    const environmentEditButtons = await webview.findWebElements(By.name('edit-environment'));
    await environmentEditButtons[0].click();
    const environmentEditInput = await webview.findWebElements(By.name('environment-edit-input'));
    expect(environmentEditInput).to.have.length(1);
    await environmentEditInput[0].sendKeys('Edited');
    const environmentEditSubmit = await webview.findWebElements(By.name('edit-environment-submit'));
    await environmentEditSubmit[0].click();
    const environmentNames = await webview.findWebElements(By.name('environment-name'));
    const newText = await environmentNames[0].getText();
    expect(newText).to.equal('David - GreybeardEdited');
};

export const addInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-add')))[0].click();
    await (await webview.findWebElement(By.name('instance'))).sendKeys('test');
    await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://google.com');
    await (await webview.findWebElement(By.name('instance-submit'))).click();

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(9);
    expect(links).to.have.length(9);
    expect(await links[4].getText()).to.equal('test');
    expect(await links[4].getAttribute('href')).to.equal('https://google.com/');
};

export const editInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-edit')))[5].click();
    await (await webview.findWebElement(By.name('instance'))).clear();
    await (await webview.findWebElement(By.name('instance'))).sendKeys('new instance');
    await (await webview.findWebElement(By.name('instance-url'))).clear();
    await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://synthax.io');
    await (await webview.findWebElement(By.name('instance-submit'))).click();

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(9);
    expect(links).to.have.length(9);
    expect(await links[5].getText()).to.equal('new instance');
    expect(await links[5].getAttribute('href')).to.equal('https://synthax.io/');
};

export const deleteInstance = async (webview: WebView) => {
    await (await webview.findWebElements(By.name('instance-delete')))[5].click();
    await confirmDialog(webview);

    const instances = await webview.findWebElements(By.name('instance-item'));
    const links = await webview.findWebElements(By.name('instance-link'));

    expect(instances).to.have.length(8);
    expect(links).to.have.length(8);
    expect(await links[0].getText()).to.equal('greybeard-1');
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
    await (await webview.findWebElement(By.name('manage-source-dirs'))).click();

    await sleep(500);

    await (await webview.findWebElement(By.name('folder-expander-source-dirs'))).click();
    await (await webview.findWebElements(By.className('bp3-tree-node-caret')))[0].click();

    await sleep(500);

    await (await webview.findWebElements(By.className('bp3-tree-node-content')))[13].click();

    await sleep(500);

    await (await webview.findWebElements(By.name('source-dir-remove')))[0].click();
    await confirmDialog(webview);

    //expect(await webview.findWebElements(By.name('source-dir'))).to.have.length(19);

    await (await webview.findWebElement(By.className('bp3-overlay'))).click();
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();

    await sleep(2000);
};
