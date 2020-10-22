import * as fsExtra from 'fs-extra';
import * as path from 'path';
import {
    ActivityBar,
    EditorView,
    SideBarView,
    ViewControl,
    ViewTitlePart,
    WebView,
    Workbench,
} from 'vscode-extension-tester';
import { logoutFromTreeView } from './treeView';
import { setupWebview } from './webview';

export const testFolder = path.join(process.cwd(), 'ui-test');
export const projectFolder = path.join(testFolder, 'test_project');

export const cleanup = async (editorView: EditorView, webview?: WebView, logoutInstanceName?: string) => {
    if (webview) {
        await webview.switchBack();
    }

    await editorView.closeAllEditors();

    if (logoutInstanceName) {
        await logoutFromTreeView(logoutInstanceName);
    }
};

export const setupTest = async (loginInstanceName?: string, noWebview?: boolean) => {
    try {
        await fsExtra.copy(path.join(testFolder, 'mock/'), projectFolder);
    } catch (e) {
        console.error(e);
    }

    const workbench = new Workbench();
    const editorView = new EditorView();
    let webview: WebView;

    if (!noWebview) {
        webview = await setupWebview(workbench, editorView, loginInstanceName);
    }

    // @ts-ignore
    return { workbench, editorView, webview };
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
