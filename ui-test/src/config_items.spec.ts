import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupWebview } from './common/utils';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';

describe('Config Items Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;

        const extestHelpers = await setupWebview();

        workbench = extestHelpers.workbench;
        editorView = extestHelpers.editorView;
        webview = extestHelpers.webview;
    });

    it('Create service class', () => createServiceClass(webview));
    it('Create class', () => createClass(webview, editorView));
    it('Create service', () => createService(webview, editorView));
    it('Check files', () => checkFiles(project_folder));
    it('Edit interface', () => editInterface(webview, workbench, project_folder));

    // Reset the workbench
    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
