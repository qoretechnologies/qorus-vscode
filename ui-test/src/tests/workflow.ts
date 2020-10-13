import * as path from 'path';
import { expect } from 'chai';
import { WebView, EditorView } from 'vscode-extension-tester';
import {
    sleep,
    compareWithGoldFiles,
    clickElement,
    getSelectedFields,
    getElementAttribute,
    fillTextField,
    selectNthDropdownItem,
    selectNthFolder,
    getElementText,
    selectField,
    getNthElement,
    submitInterface,
    getElements,
} from '../common/utils';

export const openCreateWorkflow = async (webview: WebView) => {
    await sleep(4000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Workflow');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(4);
};

export const createWorkflow = async (webview: WebView, editorView: EditorView) => {
    // Submit disabled by default
    expect(await getElementAttribute(webview, 'interface-creator-submit-workflow', 'disabled')).to.equal('true');

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'Workflow test');
    await fillTextField(webview, 'field-desc', 'Workflow test description');
    await fillTextField(webview, 'field-version', '1.0');
    await selectField(webview, 'class-name');

    await sleep(2000);

    expect(await getSelectedFields(webview)).to.have.length(7);

    await fillTextField(webview, 'field-class-name', 'TestWorkflow');
    await selectNthDropdownItem(webview, 'base-class-name', 1);

    const workflowNext = await getNthElement(webview, 'interface-creator-submit-workflow');

    expect(await workflowNext.getAttribute('disabled')).to.equal(null);

    await workflowNext.click();

    // STEP PAGE
    await sleep(2000);
    await clickElement(webview, 'add-step-after-all');
    await sleep(500);
    await clickElement(webview, 'create-new-step');
    await sleep(3000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'Step test', 2);
    await fillTextField(webview, 'field-desc', 'Step test description');
    await selectNthDropdownItem(webview, 'base-class-name', 6);
    await fillTextField(webview, 'field-version', '1.0');
    await submitInterface(webview, 'step');

    await sleep(2000);

    expect(await getElements(webview, 'steplist-step')).to.have.length(1);
    expect(await getElementAttribute(webview, 'interface-creator-submit-workflow-steps', 'disabled')).to.equal(null);

    await sleep(5000);

    expect(await getElementText(webview, 'stepList-name', 1, 'name')).to.eql('Step test:1.0');

    await submitInterface(webview, 'workflow-steps');
    await sleep(2000);
    await webview.switchBack();

    const titles = await editorView.getOpenEditorTitles();
    expect(titles.includes('Workflow test-1.0.qwf')).to.eql(true);
};

export const checkFiles = async (project_folder: string) => {
    compareWithGoldFiles(path.join(project_folder, 'arpm'), [
        'Step test-1.0.qstep.yaml',
        'Step test-1.0.qstep',
        'Workflow test-1.0.qwf.yaml',
        'Workflow test-1.0.qwf'
    ]);
};
