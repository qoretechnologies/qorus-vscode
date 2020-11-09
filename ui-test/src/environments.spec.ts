import { EditorView, VSBrowser, WebDriver, WebView, Workbench } from 'vscode-extension-tester';
import {
    addAndRemoveSourceDirectory,
    addEnvironment,
    addInstance,
    addUrl,
    createNewSourceDir,
    deleteEnvironment,
    deleteInstance,
    deleteUrl,
    editInstance,
    openEnvironmentPage,
    renameEnvironment,
} from './tests/environments';
import { cleanup, setupTest } from './utils/common';

describe('Environments page test', function () {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        ({ workbench, editorView, webview } = await setupTest());
    });

    it('Shows environment page', () => openEnvironmentPage(webview));
    it('Adds new environment', () => addEnvironment(webview));
    it('Renames an environment', () => renameEnvironment(webview));
    it('Adds new instance', () => addInstance(webview));
    it('Edits an instance', () => editInstance(webview));
    it('Deletes an instance', () => deleteInstance(webview));
    it('Adds new url', () => addUrl(webview));
    it('Deletes url', () => deleteUrl(webview));
    it('Deletes an environment', () => deleteEnvironment(webview));
    it('Adds and removes source directory', () => addAndRemoveSourceDirectory(webview));
    it('Creates new directory and adds it to sources', () => createNewSourceDir(webview));

    // Reset the workbench
    this.afterAll(async () => {
        await cleanup(editorView, webview);
    });
});
