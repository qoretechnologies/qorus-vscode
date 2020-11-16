import { EditorView, WebDriver, WebView } from 'vscode-extension-tester';
import { checkFiles, createsClassFromClass, editClass } from './tests/class';
import { cleanup, setupTest } from './utils/common';

describe('Edit class test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ webview, editorView } = await setupTest());
    });

    it('Creates Class from Class', () => createsClassFromClass(webview));
    it('Edit class', async () => editClass(webview));
    it('Check changed files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
