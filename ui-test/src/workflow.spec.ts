import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createWorkflow, openCreateWorkflow } from './tests/workflow';
import { cleanup, setupTest } from './utils/common';

describe('Workflow tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest());
    });

    // create workflow tests
    it('Opens workflow create page', () => openCreateWorkflow(webview));
    it('Can create workflow', () => createWorkflow(webview, editorView));
    it('Check files', () => checkFiles());

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
