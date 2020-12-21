import { EditorView, WebView, Workbench } from 'vscode-extension-tester';
import {
    addMapperMapping,
    addsInputOutputProviders,
    editsMapperAndChecksFile,
    fillsMapperFields,
    opensMapperCreatePage,
    submitsMapperAndchecksFile,
} from './tests/mapper';
import { cleanup, setupTest } from './utils/common';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ workbench, editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens Mapper page', () => opensMapperCreatePage(webview));
    it('Fills Mapper fields', () => fillsMapperFields(webview));
    it('Adds Mapper input and output providers', () => addsInputOutputProviders(webview));
    it('Adds Mapper mappings', () => addMapperMapping(webview));
    it('Submits Mapper and checks file', () => submitsMapperAndchecksFile(webview));
    it('Edits Mapper and checks file', async () => {
        await cleanup(editorView, webview);
        webview = await editsMapperAndChecksFile(workbench, editorView);
    });

    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
