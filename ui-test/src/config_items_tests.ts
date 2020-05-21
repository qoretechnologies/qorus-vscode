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
    createClassWithConfigItems,
} from './config_items_tests/config_items_tests';


describe('Config Items Tests', function() {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editorView: EditorView;
    let webview: WebView;
    let notificationsCenter: NotificationsCenter;

    before(async () => {
        driver = VSBrowser.instance.driver;
        workbench = new Workbench();
        editorView = new EditorView();

        await sleep(8000);

        await workbench.executeCommand('Extest: Open Folder');

        await sleep(8000);

        const input: InputBox = await new InputBox();

        await input.wait();
        await input.setText(process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project');
        await input.confirm();

        await sleep(10000);

        await workbench.executeCommand('Qorus: Webview');

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

    it('Create class', () => createClassWithConfigItems(webview));
});
