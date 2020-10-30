import { EditorView, WebView } from 'vscode-extension-tester';
import { checksOtherFiles, createsNewOtherInterface, fillsOtherFields, opensOtherPage } from './tests/other';
import { cleanup, setupTest } from './utils/common';

describe('Other interface tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Other create page', () => opensOtherPage(webview));
    it('Creates and submits Group', () => fillsOtherFields(webview, 'Group'));
    it('Creates and submits Event', () => createsNewOtherInterface(webview, 'Event'));
    it('Creates and submits Queue', () => createsNewOtherInterface(webview, 'Queue'));
    it('Checks all Other files', () => checksOtherFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
