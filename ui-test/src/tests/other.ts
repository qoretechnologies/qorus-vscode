import { expect } from 'chai';
import * as path from 'path';
import { WebView } from 'vscode-extension-tester';
import { projectFolder, sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    clickElement,
    fillTextField,
    getSelectedFields,
    resetAndFillTextField,
    selectField,
    selectNthFolder,
} from '../utils/webview';

export const opensOtherPage = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Other');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(3);
};

export const fillsOtherFields = async (webview: WebView, type: string) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', `${type}Test`);
    await selectField(webview, 'desc');
    await sleep(500);
    await fillTextField(webview, 'field-desc', `${type} test`);
    await clickElement(webview, `field-type-radio-${type}`);
    await sleep(500);
    await clickElement(webview, 'interface-creator-submit-other');
    await sleep(4000);
};

export const createsNewOtherInterface = async (webview: WebView, type: string) => {
    await clickElement(webview, 'button-create-new', 1, 'id');
    await sleep(3000);

    await fillsOtherFields(webview, type);
};

export const checksOtherFiles = async () => {
    await compareWithGoldFiles(path.join(projectFolder, '_tests'), [
        'GroupTest.qgroup.yaml',
        'EventTest.qevent.yaml',
        'QueueTest.qqueue.yaml',
    ]);
};

export const editsOtherInterface = async (webview: WebView, type: string) => {
    await openInterfaceFromTreeView(`${type}Test`, webview);
    await sleep(1000);

    await resetAndFillTextField(webview, 'field-name', `${type}TestEdited`);
    await resetAndFillTextField(webview, 'field-target_file', `${type}TestEdited`);
    await sleep(500);
    await clickElement(webview, 'interface-creator-submit-other');
    await sleep(3000);
};

export const checksOtherEditedFiles = async () => {
    await compareWithGoldFiles(
        path.join(projectFolder, '_tests'),
        ['GroupTestEdited.qgroup.yaml', 'EventTestEdited.qevent.yaml', 'QueueTestEdited.qqueue.yaml'],
        'changed_interfaces'
    );
};
