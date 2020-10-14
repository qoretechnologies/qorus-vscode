import { EditorView, InputBox, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';

import { sleep } from './common/utils';
import { checkFiles, createClass, createService, createServiceClass, editInterface } from './tests/config_items';
import {
    addAndRemoveSourceDirectory, addEnvironment, addInstance, addUrl, deleteEnvironment, deleteInstance, deleteUrl,
    editInstance, openEnvironmentPage, renameEnvironment
} from './tests/environments';

describe('Qorus IDE Tests', function() {
    this.timeout(1800000);
    let browser: VSBrowser;
    let driver: WebDriver;
    let input: InputBox;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';


    before(async () => {
        console.log('project_folder ' + project_folder);
        browser = VSBrowser.instance;
        driver = browser.driver;
        workbench = new Workbench();
        editorView = new EditorView();

        await workbench.executeCommand('Extest: Open Folder');
        await sleep(5000);

        input = await InputBox.create();
        await input.setText(project_folder);
        await input.confirm();
        await sleep(5000);

        await workbench.executeCommand('Qorus: Open Webview');

        let isWebviewOpen = false;

        while (!isWebviewOpen) {
            await sleep(1000);
            isWebviewOpen = (await editorView.getOpenEditorTitles()).includes('Qorus Webview');
        }

        await sleep(1000);

        const webview = await new WebView(editorView, 'Qorus Webview');
        await webview.wait();
        await webview.switchToFrame();

        await sleep(3000);
    });

    // config items
    it('Create service class', async () => createServiceClass(webview));
    it('Create class', async () => createClass(webview, editorView));
    it('Create service', async () => createService(webview, editorView));
    it('Check files', async () => checkFiles(project_folder));
    it('Edit interface', async () => editInterface(webview, workbench, project_folder));

    // environments
    it('Shows environment page', async () => openEnvironmentPage(webview));
    it('Adds new environment', async () => addEnvironment(webview));
    it('Deletes an environment', async () => deleteEnvironment(webview));
    it('Renames an environment', async () => renameEnvironment(webview));
    it('Adds new instance', async () => addInstance(webview));
    it('Edits an instance', async () => editInstance(webview));
    it('Deletes an instance', async () => deleteInstance(webview));
    it('Adds new url', async () => addUrl(webview));
    it('Deletes url', async () => deleteUrl(webview));
    it('Adds and removes source directory', async () => addAndRemoveSourceDirectory(webview));

    this.afterAll(async () => {
        webview.switchBack();
        editorView.closeAllEditors();
    });
});
