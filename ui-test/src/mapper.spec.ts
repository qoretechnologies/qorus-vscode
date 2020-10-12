import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import { login } from './tests/login';
import { createMapper, checkFile, editMapper } from './tests/mapper';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupExtest());
    });

    it('Login', async () => login(webview));
    it('Create mapper', async () => createMapper(webview));

    it('Check file', async () => {
        checkFile(project_folder, 0);
        webview.switchBack();
    });

    it('Edit mapper', async () => {
        webview = await editMapper(workbench, editorView, project_folder);
    });

    it('Check changed file', async () => checkFile(project_folder, 1));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
