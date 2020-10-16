import { ActivityBar, EditorView, SideBarView, ViewControl, ViewTitlePart, WebView } from 'vscode-extension-tester';
import { logoutFromTreeView } from './treeView';

export const cleanup = async (editorView: EditorView, webview?: WebView, logoutInstanceName?: string) => {
    if (webview) {
        await webview.switchBack();
    }

    await editorView.closeAllEditors();

    if (logoutInstanceName) {
        await logoutFromTreeView(logoutInstanceName);
    }
};

export const openQorusActivityBar = async () => {
    const sidebar: SideBarView = new SideBarView();
    const title: ViewTitlePart = await sidebar.getTitlePart();

    if (title && (await title.getText()) === 'QORUS DEVELOPMENT') {
        return;
    }

    const activityBar: ActivityBar = new ActivityBar();
    const control: ViewControl = await activityBar.getViewControl('Qorus Development');
    await control.click();
    await sleep(2000);
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
