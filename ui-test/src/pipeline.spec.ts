import { EditorView, WebView } from 'vscode-extension-tester';
import {
    createsPipelineElements,
    disablesSubmitForIncompatiblePipeline,
    editsPipelineAndChecksFiles, fillPipelineFields,
    openPipelinePage,
    removesPipelineElementAndChildren,
    submitPipelineAndCheckFiles,
    undoPipelineToPreviousState
} from './tests/pipeline';
import { cleanup, setupTest } from './utils/common';

describe('Pipeline tests', function () {
    this.timeout(1800000);
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        ({ editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens Pipeline create page', () => openPipelinePage(webview));
    it('Fills Pipeline data', () => fillPipelineFields(webview));
    it('Creates Pipeline elements', () => createsPipelineElements(webview));
    it('Removes Pipeline elements and its children', () => removesPipelineElementAndChildren(webview));
    it('Undo Pipeline to previous state', () => undoPipelineToPreviousState(webview));
    it('Submits Pipeline and checks files', () => submitPipelineAndCheckFiles(webview));
    it('Disables submit for incompatible Pipeline', () => disablesSubmitForIncompatiblePipeline(webview));
//    it('Edits Pipeline and checks files', () => editsPipelineAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
