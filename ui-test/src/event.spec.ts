import { EditorView, WebView } from 'vscode-extension-tester';
import {
    checkFile,
    editInterface,
    createInterface,
    openPage,
} from './tests/group_event_queue';
import { cleanup, setupTest } from './utils/common';

describe('Event tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Event page', () => openPage(webview, 'Event'));
    it('Creates and submits Event', () => createInterface(webview, 'event'));
    it('Checks file', () => checkFile('event', false));
    it('Edits and submits Event', () => editInterface(webview, 'event'));
    it('Checks edited file', () => checkFile('event', true));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
