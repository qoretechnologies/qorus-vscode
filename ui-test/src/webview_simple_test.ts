import { expect } from 'chai';
import {
    EditorView,
    InputBox,
    VSBrowser,
    WebDriver,
    WebView,
    Workbench,
    NotificationType,
    NotificationsCenter,
} from 'vscode-extension-tester';
import { sleep } from './common/utils';
import {
    openEnvironmentPage,
    addEnvironment,
    deleteEnvironment,
    renameEnvironment,
    addInstance,
    editInstance,
    deleteInstance,
    addUrl,
    deleteUrl,
    addAndRemoveSourceDirectory,
} from './webview_simple_test/environment_config_tests';
import {
    openCreateWorkflow,
    createWorkflow,
} from './webview_simple_test/create_workflow_tests';


describe('Webview Simple Test', function() {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    let notificationsCenter: NotificationsCenter;
    const project_folder: string = process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project';

    before(async () => {
        driver = VSBrowser.instance.driver;
        workbench = new Workbench();
        editorView = new EditorView();

        await sleep(8000);

        await workbench.executeCommand('Extest: Open Folder');

        await sleep(8000);

        const input: InputBox = await new InputBox();

        await input.wait();
        await input.setText(project_folder);
        await input.confirm();

        await sleep(10000);

        await workbench.executeCommand('Qorus: Open Webview');

        let isWebviewOpen = false;

        while (!isWebviewOpen) {
            isWebviewOpen = (await editorView.getOpenEditorTitles()).includes('Qorus Webview');
        }
        await sleep(1000);

        webview = await new WebView(editorView, 'Qorus Webview');
        notificationsCenter = await workbench.openNotificationsCenter();
        notificationsCenter.clearAllNotifications();

        await webview.wait();
        await webview.switchToFrame();

        await sleep(3000);
    });

    this.beforeEach(async () => {
        await webview.switchBack();
        // Clear all notifications before every run
        await notificationsCenter.clearAllNotifications();

        await webview.switchToFrame();
    });

    this.afterEach(async () => {
        await webview.switchBack();
        // Make sure there are no warning notifications after each test
        const notifications = [
            ...(await notificationsCenter.getNotifications(NotificationType.Warning)),
            ...(await notificationsCenter.getNotifications(NotificationType.Error)),
        ];

        expect(notifications.length).to.eql(0);

        await webview.switchToFrame();
    });

    // environment config tests
    it('Shows environment page', () => openEnvironmentPage(webview));
    it('Adds new environment', () => addEnvironment(webview));
    it('Deletes an environment', () => deleteEnvironment(webview));
    it('Renames an environment', () => renameEnvironment(webview));
    it('Adds new instance', () => addInstance(webview));
    it('Edits an instance', () => editInstance(webview));
    it('Deletes an instance', () => deleteInstance(webview));
    it('Adds new url', () => addUrl(webview));
    it('Deletes url', () => deleteUrl(webview));
    it('Adds and removes source directory', () => addAndRemoveSourceDirectory(webview));

    // create workflow tests
    it('Opens workflow create page', () => openCreateWorkflow(webview));
    it('Can create workflow', () => createWorkflow(webview, editorView, project_folder));
});
