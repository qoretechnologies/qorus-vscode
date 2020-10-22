import { EditorView, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { login } from './tests/login';
import { cleanup, setupTest } from './utils/common';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview } = await setupTest());
    });

    it('Login', () => login(webview));

    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
