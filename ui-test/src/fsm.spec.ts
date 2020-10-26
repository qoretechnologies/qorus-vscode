import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import {
    changesState,
    connectsStates,
    createStates,
    deletesState,
    editsIfTransition,
    editsTransitionsOrder,
    fillFSMFields,
    openFSMPage,
    removesAllTransitions,
    submitFSMAndCheckFiles,
    undoToPreviousState,
} from './tests/fsm';
import { cleanup, setupTest } from './utils/common';

describe('FSM tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest('rippy IP'));
    });

    it('Opens FSM create page', () => openFSMPage(webview));
    it('Fills FSM fields', () => fillFSMFields(webview));
    it('Creates new states', () => createStates(webview));
    it('Connects states', () => connectsStates(webview));
    it('Edits IF state transition to "false"', () => editsIfTransition(webview));
    it('Edits transitions order', () => editsTransitionsOrder(webview));
    it('Changes state from Connector to Mapper', () => changesState(webview));
    it('Undo to last state', () => undoToPreviousState(webview));
    it('Deletes state', () => deletesState(webview));
    it('Removes all transitions from state', () => removesAllTransitions(webview));
    it('Submits FSM and checks files', () => submitFSMAndCheckFiles(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
