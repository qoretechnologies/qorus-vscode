import { EditorView, WebView } from 'vscode-extension-tester';
import { editsStepAndChecksFiles, fillsStepFields, opensStepPage, submitsStepAndChecksFiles } from './tests/step';
import { cleanup, setupTest } from './utils/common';

describe('Other interface tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Step create page', () => opensStepPage(webview));
    it('Fills Step fields', () => fillsStepFields(webview));
    it('Submits Step and checks files', () => submitsStepAndChecksFiles(webview));
    it('Edits Step and checks files', () => editsStepAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
