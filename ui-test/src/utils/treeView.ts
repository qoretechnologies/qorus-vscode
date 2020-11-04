import { expect } from 'chai';
import {
    ActionSequence,
    CustomTreeSection,
    Notification,
    SideBarView,
    TreeItem,
    VSBrowser,
    WebView,
    Workbench,
} from 'vscode-extension-tester';
import { closeQorusActivityBar, openQorusActivityBar, sleep } from './common';

export const getQorusTreeSection = async (sectionName: string): Promise<CustomTreeSection> => {
    let qorusTreeSection: CustomTreeSection | null = null;

    while (!qorusTreeSection) {
        qorusTreeSection = (await new SideBarView().getContent().getSection(sectionName)) as CustomTreeSection;
        await sleep(1000);
    }

    return qorusTreeSection;
};

export const getQorusTreeItem = async (sectionName: string, itemName: string): Promise<TreeItem> => {
    //! Collapse the unused tree section, so that all items are visible
    sectionName === 'Interfaces'
        ? await toggleQorusTreeSection('Instances', true)
        : await toggleQorusTreeSection('Interfaces', true);

    const section = await getQorusTreeSection(sectionName);
    let qorusTreeItem: TreeItem | null = null;
    let time: number = 0;

    while (!qorusTreeItem && time < 10) {
        qorusTreeItem = (await section.findItem(itemName)) as TreeItem;
        await sleep(1000);
        time += 1;
    }

    if (!qorusTreeItem) {
        throw new Error(`Qorus tree item ${itemName} not found in 10 seconds`);
    }

    return qorusTreeItem;
};

export const toggleQorusTreeSection = async (sectionName: string, collapse?: boolean) => {
    const section: CustomTreeSection = await getQorusTreeSection(sectionName);

    collapse ? await section.collapse() : await section.expand();
};

export const logoutFromTreeView = async (instanceName: string) => {
    await openQorusActivityBar();
    await toggleQorusTreeSection('Interfaces', true);
    const logoutAction: TreeItem = await getQorusTreeItem('Instances', 'Logout');

    if (logoutAction) {
        await logoutAction.click();
        await sleep(2000);
        await closeQorusActivityBar();
    } else {
        throw new Error('Logout action not found');
    }
};

export const loginFromTreeView = async (workbench: Workbench, instanceName: string) => {
    let loggedIn: boolean = false;
    let time: number = 0;

    await openQorusActivityBar();

    // Collapse of the interfaces is needed because if the instance is not in the view
    // it cannot be clicked
    await toggleQorusTreeSection('Interfaces', true);

    const instance: TreeItem = await getQorusTreeItem('Instances', instanceName);

    await instance.wait(60000);

    if (instance) {
        const loginAction: TreeItem = (await instance.findChildItem('Set as active Qorus instance')) as TreeItem;

        if (loginAction) {
            await loginAction.click();

            while (!loggedIn && time < 10000) {
                const notifications: Notification[] = await workbench.getNotifications();

                for await (const notification of notifications) {
                    const text: string = await notification.getText();

                    if (text === 'Login successful') {
                        loggedIn = true;
                        break;
                    }

                    if (text.includes('Error in getting info') || text.includes('refused')) {
                        console.error('ERROR LOGGING IN!:', text);
                        time = 10000;
                        break;
                    }
                }

                await sleep(1000);
                time += 1000;
            }
        }
    }

    expect(loggedIn).to.be.true;

    await closeQorusActivityBar();
};

export const openInterfaceFromTreeView = async (interfaceName: string, webview?: WebView) => {
    if (webview) {
        await webview.switchBack();
    }

    await openQorusActivityBar();

    // Open the other section
    const other = (await getQorusTreeItem('Interfaces', 'Other')) as TreeItem;

    if (!other) {
        throw new Error('Other section not found!');
    }

    await other.collapse();
    await other.click();

    const item = (await getQorusTreeItem('Interfaces', interfaceName)) as TreeItem;

    if (!item) {
        throw new Error('Item to edit not found');
    }

    const driver = VSBrowser.instance.driver;
    await new ActionSequence(driver).mouseMove(item).perform();

    const actionButtons = await item.getActionButtons();
    if (!actionButtons) {
        throw new Error('Action buttons for item editing not found!');
    }

    await actionButtons[2].click();

    await sleep(5000);

    if (webview) {
        await webview.switchToFrame();
    }
};
