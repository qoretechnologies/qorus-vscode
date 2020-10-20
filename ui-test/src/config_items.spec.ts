import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('Config Items Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupWebview());
    });

    it('Create service class', () => createServiceClass(webview));
    it('Create class', () => createClass(webview, editorView));
    it('Create service', () => createService(webview, editorView));
    it('Check files', () => checkFiles(project_folder));
    it('Edit interface', async () => {
        await cleanup(editorView, webview);
        webview = await editInterface(workbench, editorView, project_folder);
    });

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
