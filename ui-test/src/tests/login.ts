import { expect } from 'chai';
import { By, WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { clickElement } from '../utils/webview';

export const login = async (webview: WebView) => {
    await sleep(3000);
    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(4);
    await clickElement(webview, 'set-active-instance', 7);
    await sleep(1000);
};
