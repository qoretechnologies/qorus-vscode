import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';

describe('Config Items Tests', function () {
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async function() {
        this.timeout(18000);
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupExtest());
    });

    it('Create service class', async () => {
        this.timeout(18000);
        createServiceClass(webview)
    });
    it('Create class', async () => {
        this.timeout(18000);
        createClass(webview, editorView)
    });
    it('Create service', async () => {
        this.timeout(18000);
        createService(webview, editorView)
    });

    it('Check files', async () => {
        await checkFiles(project_folder);
        await webview.switchBack();
    });

    it('Edit interface', async () => {
        webview = await editInterface(workbench, editorView, project_folder);
    });

    // Reset the workbench
    after(async () => {
        await webview.switchBack();
        await editorView.closeAllEditors();
    });
});
