import { last, size } from 'lodash';
import {
    ActionSequence,
    Button,
    By,
    EditorView,
    InputBox,
    VSBrowser,
    WebElement,
    WebView,
    Workbench,
} from 'vscode-extension-tester';
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

export const setupWebview = async (
    workbench: Workbench,
    editorView: EditorView,
    loginInstance?: string
): Promise<any> => {
    if (loginInstance) {
        await loginFromTreeView(workbench, loginInstance);
    }

    await sleep(8000);
    await workbench.executeCommand('Qorus: Open Webview');

    const webview = await getWebview(editorView);

    return webview;
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

export const getElementsCount = async (webview: WebView, name: string, selector: TSelector = 'name') => {
    return await (
        await getElements(webview, name, selector)
    ).length;
};

export const clickElement = async (
    webview: WebView,
    name: string,
    position: number = 1,
    selector: TSelector = 'name'
) => {
    console.log('Clicking element', name);

    const element = await getNthElement(webview, name, position, selector);

    if (!element) {
        throw new Error(`Element to click ${name} ${position} not found!`);
    }

    try {
        await (await getNthElement(webview, name, position, selector)).click();
    } catch (e) {
        throw new Error(`Unable to click element ${name} ${position} because: ${e}`);
    }
};

export const clickSwitchElement = async (webview: WebView, name: string, position: number = 1) => {
    await clickElement(webview, `field-switch-${name}`, position, 'className');
};

export const fillTextField = async (
    webview: WebView,
    name: string,
    value: string | number,
    position: number = 1,
    selector: TSelector = 'name'
) => {
    await (await webview.findWebElements(By[selector](name)))[position - 1].sendKeys(value);
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

export const selectNthFolder = async (
    webview: WebView,
    name: string,
    position: number,
    elementPosition: number = 1
) => {
    await clickElement(webview, `folder-expander-${name}`, elementPosition);
    await sleep(500);
    await clickElement(webview, 'bp3-tree-node-content', position, 'className');
};

export const selectField = async (webview: WebView, name: string) => {
    await clickElement(webview, `field-selector-${name}`);
    await sleep(500);
};

export const selectAndFillField = async (webview: WebView, name: string, value: string | number) => {
    await selectField(webview, name);
    await fillTextField(webview, `field-${name}`, value);
};

export const addNewMultiSelectItemAndSelectIt = async (
    webview: WebView,
    value: string,
    elementPosition: number = 1
) => {
    await fillTextField(webview, 'bp3-input-ghost', value, elementPosition, 'className');
    await sleep(300);

    const multiSelectElements = await getElements(webview, 'multiselect-menu-item');
    const lastItem = last(multiSelectElements);

    await lastItem?.click();
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

export const selectMultiselectItemsByNumbers = async (
    webview: WebView,
    item_positions: number[],
    element_position: number = 1
) => {
    await clickElement(webview, 'bp3-input-ghost', element_position, 'className');

    for await (const item_position of item_positions) {
        await sleep(500);
        await clickElement(webview, 'multiselect-menu-item', item_position);
    }

    await clickElement(webview, 'bp3-fixed-top', 1, 'className');
};

export const submitInterface = async (webview: WebView, iface: string, position: number = 1) => {
    await clickElement(webview, `interface-creator-submit-${iface}`, position);
};

export const confirmDialog = async (webview: WebView) => {
    await sleep(500);

    const dialog = await getNthElement(webview, 'global-dialog-confirm', 1, 'id');

    if (dialog) {
        await clickElement(webview, 'global-dialog-confirm', 1, 'id');
        await sleep(1000);
    }
};

export const closeLastDialog = async (webview: WebView) => {
    const dialogs = await webview.findWebElements(By.className('bp3-dialog-close-button'));

    if (size(dialogs)) {
        // @ts-ignore
        await last(dialogs).click();
    }
};

export const getSelectedFields = async (webview: WebView) => {
    return await getElements(webview, 'selected-field');
};

export const removeField = async (webview: WebView, fieldName: string) => {
    await clickElement(webview, `remove-field-${fieldName}`);

    await sleep(1000);

    await confirmDialog(webview);
};

export const doubleClickElement = async (element: WebElement) => {
    const driver = VSBrowser.instance.driver;

    await new ActionSequence(driver).doubleClick(element).perform();
};

export const rightClickElement = async (element: WebElement) => {
    const driver = VSBrowser.instance.driver;

    if (!element) {
        throw new Error('righClickElement: Element not found!');
    }

    await new ActionSequence(driver).click(element, Button.RIGHT).perform();
    await sleep(500);
};

export const selectFromContextMenu = async (
    webview: WebView,
    element: string,
    itemPosition: number,
    elementPosition: number = 1,
    elementSelector: TSelector = 'name'
) => {
    const el = await getNthElement(webview, element, elementPosition, elementSelector);

    await rightClickElement(el);

    await sleep(500);

    await clickElement(webview, `context-menu-item-${itemPosition - 1}`);
};

export const selectFsmToolbarItem = async (webview: WebView, item: string) => {
    const element = await getNthElement(webview, `fsm-toolbar-${item}`);

    await doubleClickElement(element);
};

export const selectProviderData = async (webview: WebView, data: string[], fieldSuffix?: string) => {
    const suffix = fieldSuffix ? `-${fieldSuffix}` : '';

    for await (const [index, datum] of data.entries()) {
        await selectNthFilteredDropdownItem(webview, `provider${suffix}${index === 0 ? '' : `-${index - 1}`}`, datum);
        await sleep(1500);
    }

    await sleep(2000);
};

export const addAndFillTextOption = async (webview: WebView, optionName: string, optionValue: string | number) => {
    await selectNthFilteredDropdownItem(webview, 'options', optionName);
    await sleep(800);
    await fillTextField(webview, `field-${optionName}`, optionValue);
    await sleep(500);
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
