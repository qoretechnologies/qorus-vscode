import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    clickElement,
    fillTextField,
    getSelectedFields,
    resetAndFillTextField,
    selectNthFolder,
} from '../utils/webview';

export const openPage = async (webview: WebView, type: string) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, type);

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(3);
};

export const createInterface = async (webview: WebView, type: string) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', `${type}-test`);
    await fillTextField(webview, 'field-desc', `${type} test`);
    await clickElement(webview, `interface-creator-submit-${type}`);
    await sleep(4000);
};

export const editInterface = async (webview: WebView, type: string) => {
    await sleep(2000);
    await openInterfaceFromTreeView(`${type}-test`, webview);
    await sleep(1000);

    await resetAndFillTextField(webview, 'field-name', `${type}-test-edited`);
    await resetAndFillTextField(webview, 'field-target_file', `${type}-test-edited`);
    await sleep(500);
    await clickElement(webview, `interface-creator-submit-${type}`);
    await sleep(3000);
};

export const checkFile = async (type: string, is_editing: boolean) => {
    const file = is_editing ? `${type}-test-edited.q${type}.yaml` : `${type}-test.q${type}.yaml`;
    await compareWithGoldFiles([file], is_editing);
};
