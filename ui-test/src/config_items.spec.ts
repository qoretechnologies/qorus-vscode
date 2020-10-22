import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';
import { cleanup, setupTest } from './utils/common';

describe('Config Items Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest());
    });

    it('Create service class', () => createServiceClass(webview));
    it('Create class', () => createClass(webview, editorView));
    it('Create service', () => createService(webview, editorView));
    it('Check files', () => checkFiles());
    it('Edit interface', async () => {
        await cleanup(editorView, webview);
        webview = await editInterface(workbench, editorView);
    });

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
