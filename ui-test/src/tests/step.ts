import { expect } from 'chai';
import { WebView } from 'vscode-extension-tester';
import { sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import {
    addNewMultiSelectItemAndSelectIt,
    clickElement,
    fillTextField,
    getSelectedFields,
    resetAndFillTextField,
    selectField,
    selectMultiselectItemsByNumbers,
    selectNthFilteredDropdownItem,
    selectNthFolder,
    submitInterface,
} from '../utils/webview';

export const opensStepPage = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'Step');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(7);
};

export const fillsStepFields = async (webview: WebView) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', `StepTest`);
    await fillTextField(webview, 'field-desc', `Step test`);
    await selectNthFilteredDropdownItem(webview, 'base-class-name', 'QorusNormalStep');
    await fillTextField(webview, 'field-version', '1.0');

    await selectField(webview, 'author');
    await selectMultiselectItemsByNumbers(webview, [1]);

    await selectField(webview, 'classes');
    await selectNthFilteredDropdownItem(webview, 'name', 'ClassForFSMTest', 1, 2);

    await selectField(webview, 'constants');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 2);

    await selectField(webview, 'event');
    await selectNthFilteredDropdownItem(webview, 'event', 'EventForStep');

    await selectField(webview, 'fsm');
    await selectNthFilteredDropdownItem(webview, 'fsm-0', 'FSMForFSMTest');
    await sleep(300);
    await clickElement(webview, 'field-fsm-0-add-trigger');
    await sleep(500);
    await selectNthFilteredDropdownItem(webview, 'class', 'ClassForFSMTest');
    await sleep(500);
    await selectNthFilteredDropdownItem(webview, 'connector', 'EventConnector');
    await clickElement(webview, 'fsm-submit-trigger');
    await sleep(500);
    await clickElement(webview, 'field-fsm-add-another');
    await sleep(300);
    await selectNthFilteredDropdownItem(webview, 'fsm-1', 'FSMForFSMTest');
    await sleep(300);
    await clickElement(webview, 'field-fsm-1-add-trigger');
    await sleep(500);
    await clickElement(webview, 'field-conditionType-radio-trigger');
    await sleep(300);
    await selectNthFilteredDropdownItem(webview, 'method', 'primary');
    await clickElement(webview, 'fsm-submit-trigger');
    await sleep(500);

    await selectField(webview, 'mappers');
    await selectMultiselectItemsByNumbers(webview, [1], 3);

    await selectField(webview, 'queue');
    await selectNthFilteredDropdownItem(webview, 'queue', 'QueueForStep');

    await selectField(webview, 'functions');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 4);

    await selectField(webview, 'vmaps');
    await addNewMultiSelectItemAndSelectIt(webview, 'test', 5);
};

export const submitsStepAndChecksFiles = async (webview: WebView) => {
    await submitInterface(webview, 'step');

    await sleep(4000);

    await compareWithGoldFiles(['StepTest-1.0.qstep.yaml']);
};

export const editsStepAndChecksFiles = async (webview: WebView) => {
    await resetAndFillTextField(webview, 'field-name', `StepTestEdited`);
    await resetAndFillTextField(webview, 'field-target_file', `StepTestEdited-1.0`);
    await clickElement(webview, 'field-fsm-1-remove');

    await submitInterface(webview, 'step');

    await sleep(4000);

    await compareWithGoldFiles(['StepTestEdited-1.0.qstep.yaml'], true);
};
