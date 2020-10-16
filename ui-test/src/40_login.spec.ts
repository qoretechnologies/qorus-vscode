import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { setupWebview } from './common/utils';
import { login } from './tests/login';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview } = await setupWebview());
    });

    it('Login', () => login(webview));

    this.afterAll(async () => {
        await webview.switchBack();
        await editorView.closeAllEditors();
    });
});
