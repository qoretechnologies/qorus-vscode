import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import { createWorkflow, openCreateWorkflow } from './tests/workflow';
import { openFSMPage } from './tests/fsm';

describe('FSM tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupExtest());
    });

    // create workflow tests
    it('Opens FSM create page', () => openFSMPage(webview));
    //it('Can create an FSM', () => createWorkflow(webview, editorView, project_folder));

    // Reset the workbench
    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
