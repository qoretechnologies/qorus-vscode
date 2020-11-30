import { EditorView, WebView } from 'vscode-extension-tester';
import {
    addsError,
    editsErrorsAndChecksFiles,
    fillsErrorsFields,
    opensErrorsPage,
    submitsErrorsAndChecksFiles,
} from './tests/errors';
import { cleanup, setupTest } from './utils/common';

describe('Errors test', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Errors page', () => opensErrorsPage(webview));
    it('Fills Errors fields', () => fillsErrorsFields(webview));
    it('Adds Error', () => addsError(webview));
    it('Submits Errors and checks files', () => submitsErrorsAndChecksFiles(webview));
    it('Edits Errors and checks files', () => editsErrorsAndChecksFiles(webview));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
