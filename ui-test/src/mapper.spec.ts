import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFile, createMapper, editMapper } from './tests/mapper';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('Mapper Tests', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupWebview('rippy IP'));
    });

    it('Create mapper', () => createMapper(webview));
    it('Check file', () => checkFile(project_folder, 0));
    it('Edit mapper', async () => {
        await cleanup(editorView, webview);
        webview = await editMapper(workbench, editorView, project_folder);
    });
    it('Check changed file', () => checkFile(project_folder, 1));

    this.afterAll(async () => {
        await cleanup(editorView, webview, 'rippy IP');
    });
});
