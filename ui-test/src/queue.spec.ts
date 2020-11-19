import { EditorView, WebView } from 'vscode-extension-tester';
import {
    checkFile,
    editInterface,
    createInterface,
    openPage,
} from './tests/group_event_queue';
import { cleanup, setupTest } from './utils/common';

describe('Queue tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Queue page', () => openPage(webview, 'Queue'));
    it('Creates and submits Queue', () => createInterface(webview, 'queue'));
    it('Checks file', () => checkFile('queue', false));
    it('Edits and submits Queue', () => editInterface(webview, 'queue'));
    it('Checks edited file', () => checkFile('queue', true));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
