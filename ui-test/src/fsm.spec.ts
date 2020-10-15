import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { setupWebview } from './common/utils';
import { openFSMPage } from './tests/fsm';
import { login } from './tests/login';

describe('FSM tests', function () {
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

    it('Login', () => login(webview));
    it('Opens FSM create page', () => openFSMPage(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await webview.switchBack();
        await editorView.closeAllEditors();
    });
});
