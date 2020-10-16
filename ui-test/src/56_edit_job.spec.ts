import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { editJob, checkFiles } from './tests/job';

describe('Job test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        workbench = new Workbench();
        editorView = new EditorView();
    });

    it('Edit job', async () => {
        webview = await editJob(workbench, editorView, project_folder);
    });
    it('Check changed files', async () => checkFiles(project_folder, 'changed_interfaces'));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
