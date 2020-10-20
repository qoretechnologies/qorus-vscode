import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createWorkflow, openCreateWorkflow } from './tests/workflow';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('Workflow tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupWebview());
    });

    // create workflow tests
    it('Opens workflow create page', () => openCreateWorkflow(webview));
    it('Can create workflow', () => createWorkflow(webview, editorView));
    it('Check files', () => checkFiles(project_folder));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
