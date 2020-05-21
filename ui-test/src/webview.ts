import { expect } from 'chai';
import {
    By,
    EditorView,
    InputBox,
    VSBrowser,
    WebDriver,
    WebView,
    Workbench,
    NotificationType,
    NotificationsCenter,
} from 'vscode-extension-tester';
import {
    sleep,
    confirmDeletion,
    clickElement,
    getSelectedFields,
    getElementAttribute,
    selectNthFolder,
    fillTextField,
    selectField,
    selectNthDropdownItem,
    getNthElement,
    submitInterface,
    getElements,
    getElementText,
} from './common/utils';


describe('Webview Simple Test', function() {
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

    it('Shows environment page', async () => {
        await sleep(3000);

        const environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(3);
    });

    it('Adds new environment', async () => {
        const environmentButton = await webview.findWebElement(By.name('new-environment-add'));
        await environmentButton.click();

        const environmentInput = await webview.findWebElement(By.name('new-environment'));
        expect(environmentInput).to.exist;
        await environmentInput.sendKeys('test environment');

        const environmentSubmit = await webview.findWebElement(By.name('new-environment-submit'));
        await environmentSubmit.click();

        const environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(4);
    });

    it('Deletes an environment', async () => {
        let environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(4);
        const environmentDeleteButtons = await webview.findWebElements(By.name('delete-environment'));
        expect(environmentDeleteButtons).to.have.length(4);
        await environmentDeleteButtons[3].click();
        await confirmDeletion(webview);
        environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(3);
    });

    it('Renames an environment', async () => {
        const environmentEditButtons = await webview.findWebElements(By.name('edit-environment'));
        await environmentEditButtons[0].click();
        const environmentEditInput = await webview.findWebElements(By.name('environment-edit-input'));
        expect(environmentEditInput).to.have.length(1);
        await environmentEditInput[0].sendKeys('Edited');
        const environmentEditSubmit = await webview.findWebElements(By.name('edit-environment-submit'));
        await environmentEditSubmit[0].click();
        const environmentNames = await webview.findWebElements(By.name('environment-name'));
        const newText = await environmentNames[0].getText();
        expect(newText).to.equal('David - GreybeardEdited');
    });

    it('Adds new instance', async () => {
        await (await webview.findWebElements(By.name('instance-add')))[0].click();
        await (await webview.findWebElement(By.name('instance'))).sendKeys('test');
        await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://google.com');
        await (await webview.findWebElement(By.name('instance-submit'))).click();

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(8);
        expect(links).to.have.length(8);
        expect(await links[4].getText()).to.equal('test');
        expect(await links[4].getAttribute('href')).to.equal('https://google.com/');
    });

    it('Edits an instance', async () => {
        await (await webview.findWebElements(By.name('instance-edit')))[4].click();
        await (await webview.findWebElement(By.name('instance'))).clear();
        await (await webview.findWebElement(By.name('instance'))).sendKeys('new instance');
        await (await webview.findWebElement(By.name('instance-url'))).clear();
        await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://synthax.io');
        await (await webview.findWebElement(By.name('instance-submit'))).click();

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(8);
        expect(links).to.have.length(8);
        expect(await links[4].getText()).to.equal('new instance');
        expect(await links[4].getAttribute('href')).to.equal('https://synthax.io/');
    });

    it('Deletes an instance', async () => {
        await (await webview.findWebElements(By.name('instance-delete')))[4].click();
        await confirmDeletion(webview);

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(7);
        expect(links).to.have.length(7);
        expect(await links[0].getText()).to.equal('greybeard-1');
    });

    it('Adds new url', async () => {
        await (await webview.findWebElements(By.name('instance-expand')))[0].click();
        await (await webview.findWebElement(By.name('other-url-add'))).click();
        await (await webview.findWebElement(By.name('other-url'))).sendKeys('second url');
        await (await webview.findWebElement(By.name('other-url-url'))).sendKeys('https://twitter.com');
        await (await webview.findWebElement(By.name('other-url-submit'))).click();

        const items = await webview.findWebElements(By.name('other-url-item'));
        const links = await webview.findWebElements(By.name('other-url-link'));

        expect(items).to.have.length(1);
        expect(links).to.have.length(1);
        expect(await items[0].getText()).to.equal('1. second url [https://twitter.com]');
        expect(await links[0].getAttribute('href')).to.equal('https://twitter.com/');
    });

    it('Deletes url', async () => {
        await (await webview.findWebElement(By.name('other-url-delete'))).click();
        await confirmDeletion(webview);

        const items = await webview.findWebElements(By.name('other-url-item'));

        expect(items).to.have.length(0);
    });

    it('Adds and removes source directory', async () => {
        await (await webview.findWebElement(By.name('manage-source-dirs'))).click();

        await sleep(500);

        await (await webview.findWebElement(By.name('folder-expander-source-dirs'))).click();
        await (await webview.findWebElements(By.className('bp3-tree-node-caret')))[0].click();

        await sleep(500);

        await (await webview.findWebElements(By.className('bp3-tree-node-content')))[13].click();

        await sleep(500);

        await (await webview.findWebElements(By.name('source-dir-remove')))[0].click();
        await confirmDeletion(webview);

        //expect(await webview.findWebElements(By.name('source-dir'))).to.have.length(19);

        await (await webview.findWebElement(By.className('bp3-overlay'))).click();
        await (await webview.findWebElement(By.className('bp3-dialog-close-button'))).click();

        await sleep(2000);
    });

    it('Opens workflow create page', async () => {
        await clickElement(webview, 'CreateInterface');
        await clickElement(webview, 'Workflow');

        await sleep(3000);

        expect(await getSelectedFields(webview)).to.have.length(4);
    });

    it('Can create workflow', async () => {
    // Submit disabled by default
        expect(await getElementAttribute(webview, 'interface-creator-submit-workflow', 'disabled')).to.equal('true');

        await selectNthFolder(webview, 'target_dir', 1);
        await fillTextField(webview, 'field-name', 'Workflow test');
        await fillTextField(webview, 'field-desc', 'Workflow test description');
        await fillTextField(webview, 'field-version', '1.0');
        await selectField(webview, 'class-name');

        await sleep(2000);

        expect(await getSelectedFields(webview)).to.have.length(7);

        await fillTextField(webview, 'field-class-name', 'TestWorkflow');
        await selectNthDropdownItem(webview, 'base-class-name', 1);

        const workflowNext = await getNthElement(webview, 'interface-creator-submit-workflow');

        expect(await workflowNext.getAttribute('disabled')).to.equal(null);

        await workflowNext.click();

        // STEP PAGE
        await sleep(2000);
        await clickElement(webview, 'add-step-after-all');
        await sleep(500);
        await clickElement(webview, 'create-new-step');
        await sleep(3000);

        await selectNthFolder(webview, 'target_dir', 1);
        await fillTextField(webview, 'field-name', 'Step test', 2);
        await fillTextField(webview, 'field-desc', 'Step test description');
        await selectNthDropdownItem(webview, 'base-class-name', 6);
        await fillTextField(webview, 'field-version', '1.0');
        await submitInterface(webview, 'step');

        expect(await getElements(webview, 'steplist-step')).to.have.length(1);
        expect(await getElementAttribute(webview, 'interface-creator-submit-workflow-steps', 'disabled')).to.equal(null);

        await sleep(5000);

        expect(await getElementText(webview, 'stepList-name', 1, 'name')).to.eql('Step test:1.0');

        await submitInterface(webview, 'workflow-steps');
        await sleep(2000);
        await webview.switchBack();

        const titles = await editorView.getOpenEditorTitles();

        expect(titles.includes('Workflow test-1.0.qwf')).to.eql(true);

        const workflow = await editorView.openEditor('Workflow test-1.0.qwf');
        const workflowText = await workflow.getText();

        expect(workflowText).to.eql(
            '%new-style\n%strict-args\n%require-types\n%enable-all-warnings\n\nclass TestWorkflow inherits QorusWorkflow {\n}\n'
        );
    });
});
