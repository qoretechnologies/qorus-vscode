import { EditorView, WebView } from 'vscode-extension-tester';
import {
    editsValuemapAndChecksFiles,
    fillsValuemapFields,
    opensValuemapPage,
    submitsValuemapAndChecksFiles,
} from './tests/valuemap';
import { cleanup, setupTest } from './utils/common';

describe('Value map tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Value map create page', () => opensValuemapPage(webview));
    it('Fills Value map fields and checks date format behaviour', () => fillsValuemapFields(webview));
    it('Submits Value map and checks files', () => submitsValuemapAndChecksFiles(webview));
    it('Edits Value map and checks files', () => editsValuemapAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
