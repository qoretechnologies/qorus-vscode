import { EditorView, VSBrowser, WebDriver, WebView } from 'vscode-extension-tester';
import { checkFiles, editService } from './tests/service';
import { cleanup, setupTest } from './utils/common';

describe('Edit service test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView } = await setupTest(undefined, true));
    });

    it('Edit service', async () => { webview = await editService(editorView); });
    it('Check changed files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
