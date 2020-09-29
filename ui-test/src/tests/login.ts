import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep, clickElement } from '../common/utils';

export const login = async (webview: WebView) => {
    await sleep(3000);
    const environmentPanels = await webview.findWebElements(By.className('env-panel'));
    expect(environmentPanels).to.have.length(4);
    await clickElement(webview, 'set-active-instance', 7);
    await sleep(2000);
};
