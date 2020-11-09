import { expect } from 'chai';
import { EditorView, WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    clickElement,
    confirmDialog,
    eraseTextField,
    fillTextField,
    getElementAttribute,
    getSelectedFields,
    getWebview,
    selectField,
    selectMultiselectItemsByNumbers,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

const iface_name = 'TestMapperCode';

export const createMapperCode = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Mapper Code');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(3);

    expect(await getElementAttribute(webview, 'interface-creator-submit-mapper-code', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);

    await sleep(500);
    await fillTextField(webview, 'field-class-class-name', iface_name);
    await fillTextField(webview, 'field-version', 'v3.1.2');
    await sleep(500);
    await selectField(webview, 'desc');
    await sleep(500);
    await fillTextField(webview, 'field-desc', 'test mapper code');
    await sleep(500);
    await selectField(webview, 'author');
    await sleep(500);
    await selectMultiselectItemsByNumbers(webview, [2, 4]);
    await sleep(500);
    await selectField(webview, 'lang');
    await sleep(500);
    await submitInterface(webview, 'mapper-code');
    await sleep(2000);

    // methods page
    await fillTextField(webview, 'field-name', 'someMapperCodeMethod');
    await fillTextField(webview, 'field-desc', 'some mapper code method');
    await sleep(500);
    await submitInterface(webview, 'mapper-methods');
    await sleep(500);
};

export const editMapperCode = async (editorView: EditorView) => {
    await openInterfaceFromTreeView(iface_name);
    const webview = await getWebview(editorView);
    await sleep(500);
    await clickElement(webview, 'remove-field-desc');
    await sleep(500);
    await confirmDialog(webview);
    await sleep(500);
    await selectMultiselectItemsByNumbers(webview, [3]);
    await sleep(500);
    await submitInterface(webview, 'mapper-code');
    await sleep(500);
    await eraseTextField(webview, 'field-desc');
    await fillTextField(webview, 'field-desc', 'simple mapper code method');
    await submitInterface(webview, 'mapper-methods');
    await sleep(2000);

    return webview;
};

export const checkFiles = async (edited?: boolean) => {
    await compareWithGoldFiles(['TestMapperCode-v3.1.2.qmc.yaml', 'TestMapperCode-v3.1.2.qmc'], edited);
};
