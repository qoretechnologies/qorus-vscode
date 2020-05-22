import { By, WebView } from 'vscode-extension-tester';

type TSelector = 'id' | 'name' | 'className';


export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};

export const getNthElement = async (webview: WebView, name: string, position: number = 1, selector: TSelector = 'name') => {
    return (await webview.findWebElements(By[selector](name)))[position - 1];
};

export const getElements = async (webview: WebView, name: string, selector: TSelector = 'name') => {
    return await webview.findWebElements(By[selector](name));
};

export const clickElement = async (webview: WebView, name: string, position: number = 1, selector: TSelector = 'name') => {
    await (await getNthElement(webview, name, position, selector)).click();
};

export const fillTextField = async (webview: WebView, name: string, value: string | number, position: number = 1) => {
    await (await webview.findWebElements(By.name(name)))[position - 1].sendKeys(value);
};

export const getElementText = async (webview: WebView, name: string, position: number = 1, selector: TSelector = 'name') => {
    return await (await getNthElement(webview, name, position, selector)).getText();
};

export const selectNthFolder = async (webview: WebView, name: string, position: number) => {
    await clickElement(webview, `folder-expander-${name}`);
    await clickElement(webview, 'bp3-tree-node-content', position, 'className');
};

export const selectField = async (webview: WebView, name: string) => {
    await clickElement(webview, `field-selector-${name}`);
};

export const selectNthDropdownItem = async (webview: WebView, name: string, position: number) => {
    await clickElement(webview, `field-${name}`);
    await sleep(500);
    await clickElement(webview, `field-${name}-item`, position);
};

export const submitInterface = async (webview: WebView, iface: string) => {
    await clickElement(webview, `interface-creator-submit-${iface}`);
};

export const confirmDeletion = async (webview: WebView) => {
    await sleep(500);
    await clickElement(webview, 'remove-confirm', 1, 'id');
    await sleep(1000);
};

export const getSelectedFields = async (webview: WebView) => {
    return await getElements(webview, 'selected-field');
};

export const getElementAttribute = async (
    webview: WebView,
    elementName: string,
    attribute: string,
    position: number = 1,
    selector: TSelector = 'name'
) => {
    return await (await getNthElement(webview, elementName, position, selector)).getAttribute(attribute);
};
