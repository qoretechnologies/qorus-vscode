import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFile, createMapper, editMapper } from './tests/mapper';
import { cleanup, setupTest } from './utils/common';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest('rippy IP'));
    });

    it('Create mapper', () => createMapper(webview));
    it('Check file', () => checkFile(0));
    it('Edit mapper', async () => {
        await cleanup(editorView, webview);
        webview = await editMapper(workbench, editorView);
    });
    it('Check changed file', () => checkFile(1));

    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
