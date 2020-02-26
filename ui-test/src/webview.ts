import {
    EditorView, VSBrowser, WebDriver, Workbench
} from 'vscode-extension-tester';
import { expect } from 'chai';

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

describe('Webview Simple Test', function () {
    this.timeout(10000);
    let driver: WebDriver;

    before(() => {
        driver = VSBrowser.instance.driver;
    });

    it('Can open webview', async () => {
        const workbench = new Workbench();
        await workbench.executeCommand('Qorus: Webview');

        await sleep(3000);
        const webview = await new EditorView().openEditor('Qorus Manager');
        expect(webview).to.be.an('object');
        expect(webview).to.have.property("title").equal('Qorus Manager');
    });
});
