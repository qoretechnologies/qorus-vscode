import { EditorView, WebView } from 'vscode-extension-tester';
import {
  addsTypeFields,
  deletesTypeField,
  fillsTypeFields,
  opensTypePage,
  renamesTypeField,
  submitsTypeAndChecksFiles
} from './tests/type';
import { cleanup, setupTest } from './utils/common';

describe('Type tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens Type create page', () => opensTypePage(webview));
    it('Fills Type fields', () => fillsTypeFields(webview));
    it('Adds Type fields', () => addsTypeFields(webview));
    it('Renames Type field', () => renamesTypeField(webview));
    it('Deletes Type field', () => deletesTypeField(webview));
    it('Submits Type and checks files', () => submitsTypeAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
