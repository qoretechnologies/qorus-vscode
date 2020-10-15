import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupWebview } from './common/utils';
import { createJob, checkFiles } from './tests/job';

describe('Job test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ editorView, webview } = await setupWebview());
    });

    it('Create job', () => createJob(webview));
//    it('Check files', () => checkFiles(project_folder));

    this.afterAll(async () => {
        await webview.switchBack();
        await editorView.closeAllEditors();
    });
});
