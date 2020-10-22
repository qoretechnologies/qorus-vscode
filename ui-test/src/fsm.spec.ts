import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { createFSM } from './tests/fsm';
import { cleanup, setupTest } from './utils/common';

describe('FSM tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens FSM create page', () => createFSM(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
