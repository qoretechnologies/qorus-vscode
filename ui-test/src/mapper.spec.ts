import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupWebview } from './common/utils';
import { login } from './tests/login';
import { createMapper, checkFile } from './tests/mapper';

describe('Mapper Tests', function () {
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

    it('Login', () => login(webview));
    it('Create mapper', () => createMapper(webview));
    it('Check file', () => checkFile(project_folder));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
