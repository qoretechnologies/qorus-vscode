import { expect } from 'chai';
import * as fs from 'fs';
import * as path from 'path';
import * as jsyaml from 'js-yaml';
import { By, EditorView, InputBox, WebView, Workbench } from 'vscode-extension-tester';

type TSelector = 'id' | 'name' | 'className';

export const setupWebview = async () => {
    const workbench = new Workbench();
    const editorView = new EditorView();

    await sleep(3000);

    await workbench.executeCommand('Qorus: Open Webview');

    let isWebviewOpen = false;

    while (!isWebviewOpen) {
        isWebviewOpen = (await editorView.getOpenEditorTitles()).includes('Qorus Webview');
    }

    await sleep(1000);

    const webview = await new WebView(editorView, 'Qorus Webview');
    const notificationsCenter = await workbench.openNotificationsCenter();
    await notificationsCenter.clearAllNotifications();

    await webview.wait();
    await webview.switchToFrame();

    await sleep(3000);

    return {
        workbench,
        editorView,
        webview,
    };
};

// file_path: absolute path of the interface's yaml file or source file
export const openInterface = async (webview: WebView, workbench: Workbench, file_path: string) => {
    await webview.switchBack();

    await workbench.executeCommand('Extest: Open File');
    await sleep(1000);
    const input: InputBox = await new InputBox();
    await input.wait();
    await input.setText(file_path);
    await input.confirm();

    await sleep(2000);
    await workbench.executeCommand('Qorus: Edit Current Interface');
    await sleep(2000);
    await webview.switchToFrame();
    await sleep(2000);
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
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

export const resetTextField = async (webview: WebView, name: string, position: number = 1) => {
    await clickElement(webview, `reset-${name}`, position);
};

export const resetAndFillTextField = async (webview: WebView, name: string, value: string | number, position: number = 1) => {
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

const isObject = (obj: any): boolean => obj && typeof obj === 'object' && !Array.isArray(obj);

const deepEqual = (obj1: any, obj2: any): boolean => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = obj1[key];
        const val2 = obj2[key];

        if (isObject(val1)) {
            if (!isObject(val2) || !deepEqual(val1, val2)) {
                return false;
            }
        } else if (Array.isArray(val1)) {
            if (!Array.isArray(val2) || val2.length !== val1.length) {
                return false;
            }
            for (let i = 0; i < val1.length; i++) {
                if (!deepEqual(val1[i], val2[i])) {
                    return false;
                }
            }
        } else {
            if (val1 !== val2) {
                return false;
            }
        }
    }

    return true;
};

export const compareWithGoldFiles = async (folder: string, files: string[], gold_files_subfolder = '') => {

    await sleep(500);

    const gold_files_folder: string = process.env.TEST_GOLD_FILES || '/builds/mirror/qorus-vscode/ui-test/gold_files';

    const compare = (file_name: string) => {
        const file_path = path.join(folder, file_name);
        const file_exists = fs.existsSync(file_path);
        expect(file_exists).to.be.true;
        if (!file_exists) {
            return;
        }

        const gold_file_path = path.join(gold_files_folder, gold_files_subfolder, file_name);
        const expected_file_contents = fs.readFileSync(gold_file_path);
        const true_file_contents = fs.readFileSync(file_path);

        if (path.extname(file_name) === '.yaml') {
            const expected_file_data = jsyaml.safeLoad(expected_file_contents.toString());
            const true_file_data = jsyaml.safeLoad(true_file_contents.toString());
            expect(deepEqual(expected_file_data, true_file_data)).to.be.true;
        } else {
            expect(true_file_contents).to.eql(expected_file_contents);
        }
    };

    files.forEach((file) => compare(file));
};
