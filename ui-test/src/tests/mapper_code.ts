import { expect } from 'chai';
import * as path from 'path';
import { EditorView, WebView, Workbench } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    clickElement,
    fillTextField,
    getElementAttribute,
    getSelectedFields,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

const target_dir = 'arpm';
const target_file = 'TestMapperCode-v3.1.2.qmc.yaml';

export const createMapperCode = async (webview: WebView) => {
    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Mapper Code');

    await sleep(1000);

    expect(await getSelectedFields(webview)).to.have.length(3);

    expect(await getElementAttribute(webview, 'interface-creator-submit-mapper-code', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);

    await sleep(1000);
    await fillTextField(webview, 'field-class-class-name', 'TestMapperCode');
    await sleep(1000);
    await fillTextField(webview, 'field-version', 'v3.1.2');
    await sleep(1000);
    await submitInterface(webview, 'mapper-code');
    await sleep(2000);

    // methods page
    await fillTextField(webview, 'field-name', 'someMapperCodeMethod');
    await sleep(1000);
    await fillTextField(webview, 'field-desc', 'some mapper code method');
    await sleep(1000);
    await submitInterface(webview, 'mapper-methods');
    await sleep(2000);
};

export const checkFiles = async (project_folder: string, gold_files_subfolder?: string) => {
    await compareWithGoldFiles(
        path.join(project_folder, target_dir),
        [ target_file, 'TestMapperCode-v3.1.2.qmc' ],
        gold_files_subfolder
    );
};
