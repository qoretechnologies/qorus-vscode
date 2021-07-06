import { EditorView, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createsClassFromClass, editClass, editsClassCreatedFromClass } from './tests/class';
import { cleanup, setupTest } from './utils/common';

describe('Class tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;
    let workbench: Workbench;

    before(async () => {
        ({ editorView, webview, workbench } = await setupTest());
    });

    it('Creates Class from another Class', async () => {
        // Remove notifications
        const notifications = await workbench.getNotifications();

        console.log('NOTIFICATIONS LENGTH', notifications.length);

        return createsClassFromClass(webview);
    });
    it('Edits Class created from another Class', () => editsClassCreatedFromClass(webview));
    it('Edits class', () => editClass(webview));
    it('Check changed files', () => checkFiles());

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
