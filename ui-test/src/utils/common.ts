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
export const goldFilesFolder = path.join(testFolder, 'gold_files');

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
        await fsExtra.remove(path.join(projectFolder, '_tests'));
        await fsExtra.remove(path.join(projectFolder, 'demos'));
        await fsExtra.remove(path.join(projectFolder, 'mydir'));
        await fsExtra.copy(path.join(testFolder, 'mock/'), projectFolder);
        await sleep(5000);
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
        return Promise.resolve();
    }

    const activityBar: ActivityBar = new ActivityBar();
    const control: ViewControl | undefined = await activityBar.getViewControl('Qorus Development');

    if (control) {
        await control.click();
    } else {
        throw new Error('Qorus Development button does not exist');
    }
};

export const closeQorusActivityBar = async () => {
    const activityBar: ActivityBar = new ActivityBar();
    const control: ViewControl | undefined = await activityBar.getViewControl('Qorus Development');

    if (control) {
        await control.click();
    } else {
        throw new Error('Qorus Development button does not exist');
    }

    await sleep(2000);
};

export const sleep = (ms: number) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
};
