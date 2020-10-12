import { EditorView, InputBox, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import { login } from './tests/login';
import { createMapper, checkFile, editMapper } from './tests/mapper';

describe('Mapper Tests', function () {
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

    it('Login', () => login(webview));
    it('Create mapper', () => createMapper(webview));

    it('Check file', () => {
        checkFile(project_folder, 0);
        webview.switchBack();
    });

    it('Edit mapper', async () => {
        webview = await editMapper(inputBox, workbench, editorView, project_folder);
    });

    it('Check changed file', () => checkFile(project_folder, 1));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
