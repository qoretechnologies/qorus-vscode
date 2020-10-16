import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { openFSMPage } from './tests/fsm';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('FSM tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupWebview('rippy main'));
    });

    it('Opens FSM create page', () => openFSMPage(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy main');
    });
});
