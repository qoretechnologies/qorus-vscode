import { EditorView, InputBox, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';

describe('Config Items Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let inputBox: InputBox;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ inputBox, workbench, editorView, webview } = await setupExtest());
    });

    it('Create service class', () => createServiceClass(webview));
    it('Create class', () => createClass(webview, editorView));
    it('Create service', () => createService(webview, editorView));

    it('Check files', () => {
        checkFiles(project_folder);
        webview.switchBack();
    });

    it('Edit interface', async () => {
        webview = await editInterface(inputBox, workbench, editorView, project_folder);
    });

    // Reset the workbench
    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
