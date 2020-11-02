import { expect } from 'chai';
import * as path from 'path';
import { EditorView, WebView, Workbench } from 'vscode-extension-tester';
import { projectFolder, sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    eraseTextField,
    fillTextField,
    getElementAttribute,
    getSelectedFields,
    openInterface,
    resetAndFillTextField,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

const target_dir = '_tests';
const target_file = 'test-job-3.14.qjob.py';

export const createJob = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Job');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(8);

    expect(await getElementAttribute(webview, 'interface-creator-submit-job', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'test-job');
    await fillTextField(webview, 'field-desc', 'Test job');
    await sleep(1000);
    await clickElement(webview, 'field-lang-radio-python');
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusJob');
    await sleep(1000);
    await fillTextField(webview, 'field-cron-minute', '2');
    await sleep(500);
    await fillTextField(webview, 'field-cron-hour', '2');
    await sleep(500);
    await fillTextField(webview, 'field-cron-day', '2');
    await sleep(500);
    await fillTextField(webview, 'field-cron-month', '2');
    await sleep(500);
    await fillTextField(webview, 'field-cron-weekday', '2');
    await sleep(1000);
    await fillTextField(webview, 'field-version', '3.14');
    await sleep(1000);
    await submitInterface(webview, 'job');
    await sleep(2000);
};

export const editJob = async (workbench: Workbench, editorView: EditorView) => {
    await sleep(1000);
    const webview = await openInterface(workbench, editorView, path.join(projectFolder, target_dir, target_file));

    await sleep(8000);
    await resetAndFillTextField(webview, 'field-class-name', 'ModifiedTestJob');
    await sleep(2000);
    await eraseTextField(webview, 'field-desc');
    await fillTextField(webview, 'field-desc', 'Edit job test');
    await sleep(2000);
    await submitInterface(webview, 'job');
    await sleep(2000);
    return webview;
};

export const checkFiles = async (gold_files_subfolder?: string) => {
    await compareWithGoldFiles(['test-job-3.14.qjob.yaml', target_file], true);
};
