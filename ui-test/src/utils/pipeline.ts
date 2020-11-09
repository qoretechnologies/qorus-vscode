import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from './common';
import {
    clickElement,
    closeLastDialog,
    getElementAttribute,
    selectFromContextMenu,
    selectNthFilteredDropdownItem,
} from './webview';

export const createPipelineElement = async (
    webview: WebView,
    targetPosition: number,
    type: 'queue' | 'mapper' | 'processor',
    name?: string,
    expectFail?: boolean
) => {
    await selectFromContextMenu(webview, 'pipeline-element', 2, targetPosition);
    await sleep(1000);
    await selectNthFilteredDropdownItem(webview, 'type', type);

    await sleep(1000);

    if (name) {
        await selectNthFilteredDropdownItem(webview, 'name', name);
    }

    await sleep(2000);

    if (expectFail) {
        expect(await getElementAttribute(webview, 'pipeline-submit-element', 'disabled')).to.eq('true');
        await closeLastDialog(webview);
    } else {
        await clickElement(webview, 'pipeline-submit-element');
    }

    await sleep(1000);
};

export const addQueue = async (webview: WebView, targetPosition: number) => {
    await selectFromContextMenu(webview, 'pipeline-element', 2, targetPosition);
    await sleep(1000);
};
