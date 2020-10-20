import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createMapperCode } from './tests/mapper_code';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('Mapper code test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;
    let workbench: Workbench;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview, workbench } = await setupWebview());
    });

    it('Create mapper code', () => createMapperCode(webview));
    it('Check files', () => checkFiles(project_folder));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
