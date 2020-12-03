import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import {
    addsExistingStepFromWorkflowDiagram,
    canOpenStepForEditingFromDiagram,
    createsNewStepFromWorkflowDiagram,
    editsWorkflowAndChecksFiles,
    fillsWorkflowFields,
    openCreateWorkflow,
    submitsWorkflowAndChecksFiles,
} from './tests/workflow';
import { cleanup, setupTest } from './utils/common';

describe('Workflow tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest());
    });

    // create workflow tests
    it('Opens Workflow create page', () => openCreateWorkflow(webview));
    it('Fills Workflow fields', () => fillsWorkflowFields(webview));
    it('Creates new Step from Workflow and adds it to diagram', () => createsNewStepFromWorkflowDiagram(webview));
    it('Adds existing Step to diagram', () => addsExistingStepFromWorkflowDiagram(webview));
    it('Can open Step for editing from diagram', () => canOpenStepForEditingFromDiagram(webview));
    it('Submits Workflow and checks files', () => submitsWorkflowAndChecksFiles(webview));
    it('Edits Workflow and checks files', () => editsWorkflowAndChecksFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
