import { EditorView, WebView } from 'vscode-extension-tester';
import { checkFiles, createsClassFromClass, editClass, editsClassCreatedFromClass } from './tests/class';
import { cleanup, setupTest } from './utils/common';

describe('Class tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Creates Class from another Class', () => createsClassFromClass(webview));
    it('Edits Class created from another Class', () => editsClassCreatedFromClass(webview));
    it('Edits class', () => editClass(webview));
    it('Check changed files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
