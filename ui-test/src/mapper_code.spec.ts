import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createMapperCode, editMapperCode } from './tests/mapper_code';
import { cleanup, setupTest } from './utils/common';

describe('Mapper code test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;
    let workbench: Workbench;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview, workbench } = await setupTest());
    });

    it('Create mapper code', () => createMapperCode(webview));
    it('Check files', () => checkFiles());
    it('Edit mapper code', async () => {
        await cleanup(editorView, webview);
        webview = await editMapperCode(editorView);
    });
    it('Check changed files', () => checkFiles(true));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
