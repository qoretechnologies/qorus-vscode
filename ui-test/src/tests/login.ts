import { expect } from 'chai';
import { By, WebView } from 'vscode-extension-tester';
import { sleep, clickElement } from '../common/utils';

export const login = async (webview: WebView) => {
    await sleep(1000);
    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(4);
    await clickElement(webview, 'set-active-instance', 7);
    await sleep(1000);
};
