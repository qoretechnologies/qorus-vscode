import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupWebview } from './common/utils';
import { checkFiles, editJob } from './tests/job';

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

    it('Edit job', () => editJob(webview, workbench, project_folder));
    it('Check changed files', () => checkFiles(project_folder, 'changed_interfaces'));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
