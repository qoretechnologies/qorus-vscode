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
    this.timeout(180000);
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
        await input.setText('/Users/filipwitosz/Code/Projects/qorus-vscode/ui-test/test_project');
        await input.confirm();

        await sleep(5000);

        await workbench.executeCommand('Qorus: Webview');

        let isWebviewOpen = false;

        while (!isWebviewOpen) {
            isWebviewOpen = (await editor.getOpenEditorTitles()).includes('Qorus Manager');
        }

        editorView = await new EditorView().openEditor('Qorus Manager');
        webview = await new WebView(new EditorView(), 'Qorus Manager');
    });

    it('Shows environment page', async () => {
        await webview.wait();
        await webview.switchToFrame();

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
});
