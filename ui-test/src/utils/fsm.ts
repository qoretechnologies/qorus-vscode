import { WebView } from 'vscode-extension-tester';
import { sleep } from './common';
import {
    clickElement,
    clickSwitchElement,
    doubleClickElement,
    fillTextField,
    getNthElement,
    selectFromContextMenu,
    selectFsmToolbarItem,
    selectNthFilteredDropdownItem,
    selectProviderData,
} from './webview';

export const createBasicState = async (
    webview: WebView,
    type: 'mapper' | 'pipeline' | 'connector' | 'fsm' | 'if',
    itemName: string,
    connectorName?: string,
    initial?: boolean
) => {
    await selectFsmToolbarItem(webview, type);
    await sleep(2000);

    if (type === 'fsm') {
        await selectNthFilteredDropdownItem(webview, 'name', itemName);
    } else if (type === 'if') {
        await fillTextField(webview, 'field-condition', itemName);
        await selectProviderData(webview, ['type', 'qore', 'hash']);
    } else {
        await selectNthFilteredDropdownItem(webview, type === 'connector' ? 'class' : 'action', itemName);

        if (connectorName) {
            await selectNthFilteredDropdownItem(webview, 'connector', connectorName);
        }
    }

    if (initial) {
        await sleep(300);
        await clickSwitchElement(webview, 'initial');
    }

    await sleep(300);
    await clickElement(webview, 'fsm-submit-state');
    await sleep(1000);
};

export const connectStates = async (webview: WebView, from: string, to: string) => {
    const fromState = await getNthElement(webview, from);
    await doubleClickElement(fromState);
    await sleep(2500);
    await clickElement(webview, to);
    await sleep(500);
};

export const openTransitionsDialog = async (webview: WebView, stateName: string) => {
    await selectFromContextMenu(webview, `fsm-state-${stateName}`, 4);
};

export const editState = async (webview: WebView, stateName: string) => {
    await selectFromContextMenu(webview, `fsm-state-${stateName}`, 6);
};
