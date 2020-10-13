import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupWebview } from './common/utils';
import { createWorkflow, openCreateWorkflow } from './tests/workflow';

describe('Workflow tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;

        const extestHelpers = await setupWebview();

        workbench = extestHelpers.workbench;
        editorView = extestHelpers.editorView;
        webview = extestHelpers.webview;
    });

    // create workflow tests
    it('Opens workflow create page', () => openCreateWorkflow(webview));
    it('Can create workflow', () => createWorkflow(webview, editorView, project_folder));

    // Reset the workbench
    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
