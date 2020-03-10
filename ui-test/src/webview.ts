import {
    EditorView,
    VSBrowser,
    WebDriver,
    Workbench,
    WebView,
    By,
    DialogHandler,
    QuickOpenBox,
    InputBox,
} from 'vscode-extension-tester';
import { expect } from 'chai';
import { Editor } from 'vscode-extension-tester/out/webdriver/components/editor/Editor';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Webview Simple Test', function() {
    this.timeout(1800000);
    let driver: WebDriver;
    let workbench: Workbench;
    let editor: EditorView;
    let editorView: Editor;
    let webview: WebView;

    before(async () => {
        driver = VSBrowser.instance.driver;
        workbench = new Workbench();
        editor = new EditorView();

        await workbench.executeCommand('Extest: Open Folder');

        await sleep(10500);

        const input: InputBox = await new InputBox();

        await input.wait();
        await input.setText(process.env.PROJECT_FOLDER || '/builds/mirror/qorus-vscode/ui-test/test_project');
        await input.confirm();

        await sleep(10000);

        await workbench.executeCommand('Qorus: Webview');

        let isWebviewOpen = false;

        while (!isWebviewOpen) {
            isWebviewOpen = (await editor.getOpenEditorTitles()).includes('Qorus Manager');
        }

        editorView = await new EditorView().openEditor('Qorus Manager');
        webview = await new WebView(new EditorView(), 'Qorus Manager');

        await webview.wait();
        await webview.switchToFrame();

        await sleep(3000);
    });

    const clickElement = async (name: string, position?: number, useClassName?: boolean) => {
        if (position !== undefined) {
            await (await webview.findWebElements(By[useClassName ? 'className' : 'name'](name)))[position - 1].click();
        } else {
            await (await webview.findWebElement(By.name(name))).click();
        }
    };

    const fillTextField = async (name: string, value: string | number, position?: number) => {
        if (position) {
            await (await webview.findWebElements(By.name(name)))[position - 1].sendKeys(value);
        } else {
            await (await webview.findWebElement(By.name(name))).sendKeys(value);
        }
    };

    const selectNthFolder = async (name: string, position: number) => {
        await clickElement(`folder-expander-${name}`);
        await clickElement('bp3-tree-node-content', position, true);
    };

    const selectField = async (name: string) => {
        await clickElement(`field-select-${name}`);
    };

    const selectNthDropdownItem = async (name: string, position: number) => {
        await clickElement(`field-${name}`);
        await sleep(500);
        await clickElement(`field-${name}-item`, position);
    };

    const submitInterface = async (iface: string) => {
        await clickElement(`interface-creator-submit-${iface}`);
    };

    it('Shows environment page', async () => {
        await sleep(3000);

        const environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(1);
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
        expect(environmentPanels).to.have.length(2);
    });

    it('Deletes an environment', async () => {
        let environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(2);
        const environmentDeleteButtons = await webview.findWebElements(By.name('delete-environment'));
        expect(environmentDeleteButtons).to.have.length(2);
        await environmentDeleteButtons[1].click();
        environmentPanels = await webview.findWebElements(By.className('sc-cmTdod'));
        expect(environmentPanels).to.have.length(1);
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
        expect(newText).to.equal('HQEdited');
    });

    it('Adds new instance', async () => {
        await (await webview.findWebElements(By.name('instance-add')))[0].click();
        await (await webview.findWebElement(By.name('instance'))).sendKeys('test');
        await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://google.com');
        await (await webview.findWebElement(By.name('instance-submit'))).click();

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(2);
        expect(links).to.have.length(2);
        expect(await links[1].getText()).to.equal('test');
        expect(await links[1].getAttribute('href')).to.equal('https://google.com/');
    });

    it('Edits an instance', async () => {
        await (await webview.findWebElements(By.name('instance-edit')))[1].click();
        await (await webview.findWebElement(By.name('instance'))).clear();
        await (await webview.findWebElement(By.name('instance'))).sendKeys('new instance');
        await (await webview.findWebElement(By.name('instance-url'))).clear();
        await (await webview.findWebElement(By.name('instance-url'))).sendKeys('https://synthax.io');
        await (await webview.findWebElement(By.name('instance-submit'))).click();

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(2);
        expect(links).to.have.length(2);
        expect(await links[1].getText()).to.equal('new instance');
        expect(await links[1].getAttribute('href')).to.equal('https://synthax.io/');
    });

    it('Deletes an instance', async () => {
        await (await webview.findWebElements(By.name('instance-delete')))[1].click();

        const instances = await webview.findWebElements(By.name('instance-item'));
        const links = await webview.findWebElements(By.name('instance-link'));

        expect(instances).to.have.length(1);
        expect(links).to.have.length(1);
        expect(await links[0].getText()).to.equal('rippy main');
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

        const items = await webview.findWebElements(By.name('other-url-item'));

        expect(items).to.have.length(0);
    });

    it('Adds and removes source directory', async () => {
        await (await webview.findWebElement(By.name('manage-source-dirs'))).click();

        await sleep(500);

        expect(await webview.findWebElements(By.name('source-dir'))).to.have.length(1);

        await (await webview.findWebElement(By.name('folder-expander-source-dirs'))).click();
        await (await webview.findWebElements(By.className('bp3-tree-node-caret')))[0].click();

        await sleep(500);

        await (await webview.findWebElements(By.className('bp3-tree-node-content')))[1].click();

        await sleep(500);

        expect(await webview.findWebElements(By.name('source-dir'))).to.have.length(2);

        await (await webview.findWebElements(By.name('source-dir-remove')))[0].click();

        expect(await webview.findWebElements(By.name('source-dir'))).to.have.length(1);

        await (await webview.findWebElement(By.className('bp3-overlay'))).click();
    });

    it('Opens workflow create page', async () => {
        await clickElement('CreateInterface');
        await clickElement('Workflow');

        await sleep(3000);

        expect(await webview.findWebElements(By.name('selected-field'))).to.have.length(4);
    });

    it('Can create workflow', async () => {
        // Submit disabled by default
        expect(
            await (await webview.findWebElement(By.name('interface-creator-submit-workflow'))).getAttribute('disabled')
        ).to.equal('true');

        await selectNthFolder('target_dir', 1);
        await fillTextField('field-name', 'Workflow test');
        await fillTextField('field-desc', 'Workflow test description');
        await fillTextField('field-version', '1.0');
        await selectField('class-name');

        await sleep(2000);

        expect(await webview.findWebElements(By.name('selected-field'))).to.have.length(7);

        await fillTextField('field-class-name', 'TestWorkflow');
        await selectNthDropdownItem('base-class-name', 1);

        const workflowNext = await webview.findWebElement(By.name('interface-creator-submit-workflow'));

        expect(await workflowNext.getAttribute('disabled')).to.equal(null);

        await workflowNext.click();

        // STEP PAGE
        await sleep(2000);
        await clickElement('add-step-after-all');
        await sleep(500);
        await clickElement('create-new-step');
        await sleep(3000);

        await selectNthFolder('target_dir', 1);
        await fillTextField('field-name', 'Step test');
        await fillTextField('field-desc', 'Step test description');
        await selectNthDropdownItem('base-class-name', 6);
        await fillTextField('field-version', '1.0');
        await submitInterface('step');

        expect(await webview.findWebElements(By.name('steplist-step'))).to.have.length(1);
        expect(
            await (await webview.findWebElement(By.name('interface-creator-submit-workflow-steps'))).getAttribute(
                'disabled'
            )
        ).to.equal(null);

        await submitInterface('workflow-steps');
        await sleep(4000);
    });
});
