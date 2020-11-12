import { EditorView, WebView } from 'vscode-extension-tester';
import {
    checkFile,
    editInterface,
    createInterface,
    openPage,
} from './tests/group_event_queue';
import { cleanup, setupTest } from './utils/common';

describe('Group tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest());
    });

    it('Opens Group page', () => openPage(webview, 'Group'));
    it('Creates and submits Group', () => createInterface(webview, 'group'));
    it('Checks file', () => checkFile('group', false));
    it('Edits and submits Group', () => editInterface(webview, 'group'));
    it('Checks edited file', () => checkFile('group', true));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
