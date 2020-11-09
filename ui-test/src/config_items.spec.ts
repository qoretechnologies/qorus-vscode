import { EditorView, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { checkFiles, createClass, createService, createServiceClass } from './tests/config_items';
import { cleanup, setupTest } from './utils/common';

describe('Config Items Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview } = await setupTest());
    });

    it('Create service class', () => createServiceClass(webview));
    it('Create class', () => createClass(webview, editorView));
    it('Create service', () => createService(webview, editorView));
    it('Check files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
