import { expect } from 'chai';
import { omit, reduce } from 'lodash';
import * as path from 'path';
import { WebView } from 'vscode-extension-tester';
import { projectFolder, sleep } from '../utils/common';
import { compareWithGoldFiles } from '../utils/files';
import { connectStates, createBasicState, editState, openTransitionsDialog } from '../utils/fsm';
import {
    clickElement,
    closeLastDialog,
    fillTextField,
    getElementsCount,
    getNthElement,
    getSelectedFields,
    rightClickElement,
    selectFromContextMenu,
    selectMultiselectItemsByNumbers,
    selectNthFilteredDropdownItem,
    selectNthFolder
} from '../utils/webview';

export const openFSMPage = async (webview: WebView) => {
    await sleep(2000);

    await clickElement(webview, 'CreateInterface');
    await clickElement(webview, 'FiniteStateMachine');

    await sleep(3000);

    expect(await getSelectedFields(webview)).to.have.length(4);
};

export const fillFSMFields = async (webview: WebView) => {
    await sleep(1000);

    await selectNthFolder(webview, 'target_dir', 1);
    await fillTextField(webview, 'field-name', 'FSMTest');
    await fillTextField(webview, 'field-desc', 'FSM Test');
    await selectMultiselectItemsByNumbers(webview, [2, 4]);
    await clickElement(webview, 'fsm-hide-metadata-button');

    await sleep(300);
};

export const createStates = async (webview: WebView) => {
    await createBasicState(webview, 'pipeline', 'PipelineForFSMTest', undefined, true);
    await createBasicState(webview, 'mapper', 'MapperForFSMTest:1.0');
    await createBasicState(webview, 'connector', 'ClassForFSMTest', 'InputConnectorHash');
    await createBasicState(webview, 'connector', 'ClassForFSMTest', 'InputOutputConnectorHashString');
    await createBasicState(webview, 'if', 'a === b');
    await createBasicState(webview, 'connector', 'ClassForFSMTest', 'InputConnectorHash');
    await createBasicState(webview, 'connector', 'ClassForFSMTest', 'InputConnectorHash');
};

export const connectsStates = async (webview: WebView) => {
    await connectStates(webview, 'fsm-state-State 1', 'fsm-state-State 2');
    await connectStates(webview, 'fsm-state-State 2', 'fsm-state-State 3');
    await connectStates(webview, 'fsm-state-State 3', 'fsm-state-State 4');
    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(3);

    await connectStates(webview, 'fsm-state-State 4', 'fsm-state-State 5');

    // Cannot transition from State 4 to State 5 because the types do not match
    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(3);

    await connectStates(webview, 'fsm-state-State 3', 'fsm-state-State 5');

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(4);

    await connectStates(webview, 'fsm-state-State 5', 'fsm-state-State 6');
    await connectStates(webview, 'fsm-state-State 5', 'fsm-state-State 7');

    expect(await getElementsCount(webview, 'fsm-transition-true')).to.eq(2);
};

export const editsIfTransition = async (webview: WebView) => {
    await openTransitionsDialog(webview, 'State 5');
    await sleep(500);
    await clickElement(webview, 'fsm-edit-transition', 2);
    await sleep(500);
    await clickElement(webview, 'field-branch-radio-false');
    await sleep(500);
    await clickElement(webview, 'fsm-submit-transition');
    await sleep(500);
    await clickElement(webview, 'fsm-submit-transitions');
    await sleep(1300);

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(4);
    expect(await getElementsCount(webview, 'fsm-transition-true')).to.eq(1);
    expect(await getElementsCount(webview, 'fsm-transition-false')).to.eq(1);
};

export const editsTransitionsOrder = async (webview: WebView) => {
    await openTransitionsDialog(webview, 'State 5');
    await sleep(500);

    expect(await (await getNthElement(webview, 'fsm-transition-order-name', 1)).getText()).to.eq(
        '1. TransitionToState State 6 [ClassForFSMTest:InputConnectorHash connector]'
    );

    await clickElement(webview, 'fsm-move-transition-down', 1);
    await sleep(200);

    expect(await (await getNthElement(webview, 'fsm-transition-order-name', 1)).getText()).to.eq(
        '1. TransitionToState State 7 [ClassForFSMTest:InputConnectorHash connector]'
    );

    await closeLastDialog(webview);

    await sleep(1000);
};

export const changesState = async (webview: WebView) => {
    await editState(webview, 'State 3');
    await sleep(500);
    await clickElement(webview, 'field-action-radio-mapper');
    await sleep(500);
    await selectNthFilteredDropdownItem(webview, 'action', 'MapperForFSMTest:1.0');
    await sleep(500);
    await clickElement(webview, 'fsm-submit-state');
    await sleep(2000);

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(3);
    expect(await getElementsCount(webview, 'isolated-state', 'className')).to.eq(5);
};

export const undoToPreviousState = async (webview: WebView) => {
    await clickElement(webview, 'fsm-undo-button');
    await sleep(1000);

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(4);
    expect(await getElementsCount(webview, 'isolated-state', 'className')).to.eq(0);
};

export const deletesState = async (webview: WebView) => {
    await rightClickElement(await getNthElement(webview, `fsm-state-State 3`));
    await selectFromContextMenu(webview, 7);
    await sleep(1000);

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(1);
    expect(await getElementsCount(webview, 'isolated-state', 'className')).to.eq(4);

    await clickElement(webview, 'fsm-undo-button');
    await sleep(1000);
};

export const removesAllTransitions = async (webview: WebView) => {
    await rightClickElement(await getNthElement(webview, `fsm-state-State 3`));
    await selectFromContextMenu(webview, 5);
    await sleep(1000);

    expect(await getElementsCount(webview, 'fsm-transition')).to.eq(2);
    expect(await getElementsCount(webview, 'isolated-state', 'className')).to.eq(4);

    await clickElement(webview, 'fsm-undo-button');
    await sleep(1000);
};

export const submitFSMAndCheckFiles = async (webview: WebView) => {
    await clickElement(webview, 'fsm-submit');

    await sleep(4000);

    await compareWithGoldFiles(path.join(projectFolder, '_tests'), ['FSMTest.qfsm.yaml'], undefined, (data) => {
        // Remove the RNG ids from the states
        const transformedData = { ...data };

        transformedData.states = reduce(
            data.states,
            (states, stateData, stateId) => {
                return { ...states, [stateId]: omit(stateData, ['id']) };
            },
            {}
        );

        return transformedData;
    });
};

