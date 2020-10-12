import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { setupExtest } from './common/utils';
import {
    addAndRemoveSourceDirectory, addEnvironment, addInstance, addUrl, deleteEnvironment, deleteInstance, deleteUrl,
    editInstance, openEnvironmentPage, renameEnvironment
} from './tests/environments';

describe('Environments page test', function () {
    this.timeout(1800000);
    let browser: VSBrowser;
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        browser = VSBrowser.instance;
        driver = browser.driver;
        ({ workbench, editorView, webview } = await setupExtest());
    });

    it('Shows environment page', async () => openEnvironmentPage(webview));
    it('Adds new environment', async () => addEnvironment(webview));
    it('Deletes an environment', async () => deleteEnvironment(webview));
    it('Renames an environment', async () => renameEnvironment(webview));
    it('Adds new instance', async () => addInstance(webview));
    it('Edits an instance', async () => editInstance(webview));
    it('Deletes an instance', async () => deleteInstance(webview));
    it('Adds new url', async () => addUrl(webview));
    it('Deletes url', async () => deleteUrl(webview));
    it('Adds and removes source directory', () => addAndRemoveSourceDirectory(webview));

    // Reset the workbench
    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
