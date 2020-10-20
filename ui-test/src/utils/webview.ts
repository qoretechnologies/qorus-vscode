import { By, EditorView, InputBox, WebView, Workbench } from 'vscode-extension-tester';
import { sleep } from './common';
import { loginFromTreeView } from './treeView';

type TSelector = 'id' | 'name' | 'className';

export const getWebview = async (editorView: EditorView): Promise<WebView> => {
    let isWebviewOpen = false;
    while (!isWebviewOpen) {
        await sleep(1000);
        isWebviewOpen = (await editorView.getOpenEditorTitles()).includes('Qorus Webview');
    }

    await sleep(1000);

    const webview = await new WebView(editorView);
    await webview.wait();
    await webview.switchToFrame();
    await sleep(2000);

    return webview;
};

export const setupWebview = async (loginInstance?: string): Promise<any> => {
    const workbench = new Workbench();
    const editorView = new EditorView();

    if (loginInstance) {
        await loginFromTreeView(workbench, loginInstance);
    }

    await sleep(8000);
    await workbench.executeCommand('Qorus: Open Webview');

    const webview = await getWebview(editorView);

    return { workbench, editorView, webview };
};

export const closeWebview = async (editorView: EditorView, webview: WebView, logout?: boolean) => {
    await webview.switchBack();
    await sleep(500);
    await editorView.closeEditor('Qorus Webview');
    await sleep(300);
};

// file_path: absolute path of the interface's yaml file or source file
export const openInterface = async (
    workbench: Workbench,
    editorView: EditorView,
    file_path: string
): Promise<WebView> => {
    await workbench.executeCommand('Extest: Open File');

    await sleep(1000);

    const input: InputBox = await new InputBox();
    await input.wait();
    await input.setText(file_path);
    await input.confirm();

    await sleep(5000);
    await workbench.executeCommand('Qorus: Edit Current Interface');

    return await getWebview(editorView);
};

export const getNthElement = async (
    webview: WebView,
    name: string,
    position: number = 1,
    selector: TSelector = 'name'
) => {
    return (await webview.findWebElements(By[selector](name)))[position - 1];
};

export const getElements = async (webview: WebView, name: string, selector: TSelector = 'name') => {
    return await webview.findWebElements(By[selector](name));
};

export const clickElement = async (
    webview: WebView,
    name: string,
    position: number = 1,
    selector: TSelector = 'name'
) => {
    await (await getNthElement(webview, name, position, selector)).click();
};

export const fillTextField = async (webview: WebView, name: string, value: string | number, position: number = 1) => {
    await (await webview.findWebElements(By.name(name)))[position - 1].sendKeys(value);
};

export const eraseTextField = async (webview: WebView, name: string, position: number = 1, length: number = 50) => {
    await fillTextField(webview, name, '\b'.repeat(length), position);
};

export const resetTextField = async (webview: WebView, name: string, position: number = 1) => {
    await clickElement(webview, `reset-${name}`, position);
};

export const resetAndFillTextField = async (
    webview: WebView,
    name: string,
    value: string | number,
    position: number = 1
) => {
    await resetTextField(webview, name, position);
    await fillTextField(webview, name, value, position);
};

export const getElementText = async (
    webview: WebView,
    name: string,
    position: number = 1,
    selector: TSelector = 'name'
) => {
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
    element_position: number = 1
) => {
    await clickElement(webview, `field-${name}`, element_position);
    await sleep(500);
    await clickElement(webview, `field-${name}-item`, item_position);
};

export const selectNthFilteredDropdownItem = async (
    webview: WebView,
    name: string,
    filter: string,
    item_position: number = 1,
    element_position: number = 1
) => {
    await clickElement(webview, `field-${name}`, element_position);
    await sleep(500);
    await fillTextField(webview, 'field-select-filter', filter);
    await sleep(500);
    await clickElement(webview, `field-${name}-item`, item_position);
};

export const submitInterface = async (webview: WebView, iface: string) => {
    await clickElement(webview, `interface-creator-submit-${iface}`);
};

export const confirmDialog = async (webview: WebView) => {
    await sleep(500);
    await clickElement(webview, 'global-dialog-confirm', 1, 'id');
    await sleep(1000);
};

export const closeLastDialog = async (webview: WebView) => {
    await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();
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
