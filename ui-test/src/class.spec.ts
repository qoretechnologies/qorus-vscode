import { EditorView, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { checkFiles, editClass } from './tests/class';
import { cleanup, setupTest } from './utils/common';

describe('Edit class test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView } = await setupTest(undefined, true));
    });

    it('Edit class', async () => { webview = await editClass(editorView); });
    it('Check changed files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
