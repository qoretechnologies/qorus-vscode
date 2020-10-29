import { EditorView, WebView } from 'vscode-extension-tester';
import { fillsConnectionFields, opensConnectionPage, sumbitsConnectionAndChecksFiles } from './tests/connection';
import { cleanup, setupTest } from './utils/common';

describe('Connection tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens Connection create page', () => opensConnectionPage(webview));
    it('Fills Connection fields', () => fillsConnectionFields(webview));
    it('Submits Connection and checks files', () => sumbitsConnectionAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
