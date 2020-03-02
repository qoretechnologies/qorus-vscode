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
        const environmentButton = await webview.findWebElement(By.id('new-environment-add'));
        await environmentButton.click();

        const environmentInput = await webview.findWebElement(By.id('new-environment'));
        expect(environmentInput).to.exist;
        await environmentInput.sendKeys('test environment');

        const environmentSubmit = await webview.findWebElement(By.id('new-environment-submit'));
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
});
