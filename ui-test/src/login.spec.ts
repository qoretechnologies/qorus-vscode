import { EditorView, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { login } from './tests/login';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

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
        await cleanup(editorView, webview, 'rippy IP');
    });
});
