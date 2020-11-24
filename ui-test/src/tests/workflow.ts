import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { openInterfaceFromTreeView } from '../utils/treeView';
import {
    addNewMultiSelectItemAndSelectIt,
    clickElement,
    fillTextField,
    getElementAttribute,
    getElements,
    getSelectedFields,
    removeField,
    resetAndFillTextField,
    selectAndFillField,
    selectField,
    selectFromContextMenu,
    selectMultiselectItemsByNumbers,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const openCreateWorkflow = async (webview: WebView) => {
    await sleep(4000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Workflow');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(4);
};

export const fillsWorkflowFields = async (webview: WebView) => {
    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'WorkflowTest');
    await fillTextField(webview, 'field-desc', 'Workflow test');
    await fillTextField(webview, 'field-version', '1.0');
    await selectField(webview, 'lang');

    await sleep(2000);

    await fillTextField(webview, 'field-class-name', 'WorkflowTest');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusWorkflow');
    await selectAndFillField(webview, 'attach', 'test');
    await selectField(webview, 'author');
    await addNewMultiSelectItemAndSelectIt(webview, 'Test User');
    await selectField(webview, 'workflow-autostart');
    await selectField(webview, 'classes');
    await selectNthFilteredDropdownItem(webview, 'name', 'ClassForFSMTest', 1, 2);
    await selectField(webview, 'constants');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 2);
    await selectAndFillField(webview, 'detach', 'test');
    await selectAndFillField(webview, 'errorfunction', 'test');
    await selectAndFillField(webview, 'error_handler', 'test');
    await selectField(webview, 'functions');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 3);
    await selectField(webview, 'groups');
    await selectMultiselectItemsByNumbers(webview, [1], 4);
    await selectField(webview, 'keylist');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 5);
    await selectField(webview, 'mappers');
    await selectMultiselectItemsByNumbers(webview, [1], 6);
    await selectAndFillField(webview, 'max_instances', 5);
    await selectAndFillField(webview, 'onetimeinit', 'test');
    await selectField(webview, 'workflow_options');
    await fillTextField(webview, 'field-key', 'foo');
    await fillTextField(webview, 'field-value', 'bar');
    await selectField(webview, 'remote');
    await selectField(webview, 'sla_threshold');
    await selectField(webview, 'statuses');
    await fillTextField(webview, 'field-code', 200);
    await fillTextField(webview, 'field-desc', 'ok', 2);
    await selectField(webview, 'tags');
    await fillTextField(webview, 'field-key', 'foo', 2);
    await fillTextField(webview, 'field-value', 'bar', 2);
    await selectField(webview, 'vmaps');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 7);

    await submitInterface(webview, 'workflow');

    await sleep(1000);
};

export const createsNewStepFromWorkflowDiagram = async (webview: WebView) => {
    await clickElement(webview, 'add-step-after-all');
    await sleep(2500);
    await clickElement(webview, 'field-step-reference-add-new');
    await sleep(3000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'StepFromWorkflowTest');
    await fillTextField(webview, 'field-desc', 'Step from Workflow test');
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusNormalStep');
    await fillTextField(webview, 'field-version', '1.0');
    await submitInterface(webview, 'step');

    await sleep(2000);

    await clickElement(webview, 'workflow-submit-step');

    await sleep(1000);

    expect(await getElements(webview, 'workflow-diagram-step')).to.have.length(1);
};

export const addsExistingStepFromWorkflowDiagram = async (webview: WebView) => {
    await clickElement(webview, 'add-parallel-step-after-StepFromWorkflowTest');
    await sleep(500);
    await selectNthFilteredDropdownItem(webview, 'step', 'StepForWorkflowTest');
    await clickElement(webview, 'workflow-submit-step');
    await sleep(3000);

    expect(await getElements(webview, 'workflow-diagram-step')).to.have.length(2);
};

export const submitsWorkflowAndChecksFiles = async (webview: WebView) => {
    await submitInterface(webview, 'workflow-steps');

    await sleep(4000);

    await compareWithGoldFiles([
        'StepFromWorkflowTest-1.0.qstep.yaml',
        'StepFromWorkflowTest-1.0.qstep',
        'WorkflowTest-1.0.qwf.yaml',
        'WorkflowTest-1.0.qwf',
    ]);
};

export const editsWorkflowAndChecksFiles = async (webview: WebView) => {
    await openInterfaceFromTreeView('WorkflowTest', webview);
    await sleep(4000);

    // Constants, value-maps, functions and keylist should be empty because their interfaces do not exist
    // and submit button should be disabled
    expect(await getElementAttribute(webview, 'interface-creator-submit-workflow', 'disabled')).to.eq('true');

    await removeField(webview, 'constants');
    await removeField(webview, 'functions');
    await removeField(webview, 'vmaps');

    await resetAndFillTextField(webview, 'field-name', 'WorkflowTestEdited');
    await resetAndFillTextField(webview, 'field-target_file', 'WorkflowTestEdited-1.0');

    await submitInterface(webview, 'workflow');

    await sleep(1000);

    await selectFromContextMenu(webview, `workflow-diagram-step`, 6, 2);

    await sleep(1000);

    await submitInterface(webview, 'workflow-steps');

    await sleep(4000);

    await compareWithGoldFiles(['WorkflowTestEdited-1.0.qwf.yaml', 'WorkflowTestEdited-1.0.qwf'], true);
};
