import { By, WebView } from 'vscode-extension-tester';
import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';

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
    await (await webview.findWebElements(By.name(name)))[position - 1].sendKeys('\b'.repeat(1000) + value);
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

export const selectNthDropdownItem = async (
    webview: WebView,
    name: string,
    item_position: number,
    element_position: number = 1) =>
{
    await clickElement(webview, `field-${name}`, element_position);
    await sleep(500);
    await clickElement(webview, `field-${name}-item`, item_position);
};

export const selectNthFilteredDropdownItem = async (
    webview: WebView,
    name: string,
    filter: string,
    item_position: number = 1,
    element_position: number = 1) =>
{
    await clickElement(webview, `field-${name}`, element_position);
    await sleep(500);
    await fillTextField(webview, 'select-filter', filter);
    await sleep(500);
    await clickElement(webview, `field-${name}-item`, item_position);
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

export const compareWithGoldFiles = async (folder: string, files: string[]) => {
    await sleep(500);

    const gold_files_folder: string = process.env.TEST_GOLD_FILES || '/builds/mirror/qorus-vscode/ui-test/gold_files';

    const compare = (file_name: string) => {
        const file_path = path.join(folder, file_name);
        const file_exists = fs.existsSync(file_path);
        expect(file_exists).to.be.true;
        if (!file_exists) {
            return;
        }
        const expected_file_contents = fs.readFileSync(path.join(gold_files_folder, file_name));
        const true_file_contents = fs.readFileSync(file_path);
        expect(true_file_contents).to.eql(expected_file_contents);
    };

    files.forEach(file => compare(file));
};
