import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createJob, editJob } from './tests/job';
import { cleanup } from './utils/common';
import { setupWebview } from './utils/webview';

describe('Job test', function () {
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

    it('Create job', () => createJob(webview));
    it('Check files', () => checkFiles(project_folder));
    it('Edit job', async () => {
        await cleanup(editorView, webview);
        webview = await editJob(workbench, editorView, project_folder);
    });
    it('Check changed files', async () => checkFiles(project_folder, 'changed_interfaces'));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
