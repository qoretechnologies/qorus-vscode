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
    createServiceClassWithConfigItems,
    createServiceWithConfigItems,
    checkFiles,
} from './config_items_tests/config_items_tests';


describe('Config Items Tests', function() {
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

        await sleep(3000);

        const input: InputBox = await new InputBox();

        await input.wait();
        await input.setText(project_folder);
        await input.confirm();

        await sleep(12000);

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

        await sleep(1000);
    });

    it('Create class', () => createServiceClassWithConfigItems(webview));
    it('Create service', () => createServiceWithConfigItems(webview, editorView, project_folder));
    it('Check files', () => checkFiles(project_folder));
});
