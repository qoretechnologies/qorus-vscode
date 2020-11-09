import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import { checkFiles, createJob, editJob } from './tests/job';
import { cleanup, setupTest } from './utils/common';

describe('Job test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;
    let workbench: Workbench;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview, workbench } = await setupTest());
    });

    it('Create job', () => createJob(webview));
    it('Check files', () => checkFiles());
    it('Edit job', async () => {
        await cleanup(editorView, webview);
        webview = await editJob(workbench, editorView);
    });
    it('Check changed files', () => checkFiles(true));

    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
