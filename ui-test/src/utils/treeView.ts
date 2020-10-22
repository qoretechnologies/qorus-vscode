import { expect } from 'chai';
import { CustomTreeSection, Notification, SideBarView, TreeItem, Workbench } from 'vscode-extension-tester';
import { closeQorusActivityBar, openQorusActivityBar, sleep } from './common';

export const getQorusTreeSection = async (sectionName: string): Promise<CustomTreeSection> => {
    return (await new SideBarView().getContent().getSection(sectionName)) as CustomTreeSection;
};

export const getQorusTreeItem = async (sectionName: string, itemName: string): Promise<TreeItem> => {
    const section = await getQorusTreeSection(sectionName);

    return (await section.findItem(itemName)) as TreeItem;
};

export const toggleQorusTreeSection = async (sectionName: string, collapse?: boolean) => {
    const section: CustomTreeSection = await getQorusTreeSection(sectionName);

    collapse ? await section.collapse() : await section.expand();
};

export const logoutFromTreeView = async (instanceName: string) => {
    await openQorusActivityBar();
    await toggleQorusTreeSection('Interfaces', true);
    const instance = await getQorusTreeItem('Instances', instanceName);
    const logoutAction: TreeItem = (await instance.findChildItem('Logout')) as TreeItem;

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
