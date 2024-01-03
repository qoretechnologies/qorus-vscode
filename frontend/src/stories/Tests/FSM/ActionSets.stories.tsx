import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import { Existing } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import {
  _testsOpenAppCatalogue,
  _testsSelectFromAppCatalogue,
  _testsSelectStateByLabel,
  sleep,
} from '../utils';
import { SwitchesToBuilder } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Action Sets',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof FSMView, { stateType?: string }>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;

export const CreateNewSet: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await sleep(500);

    await _testsSelectStateByLabel(canvas, 'Get User Info');
    await _testsSelectStateByLabel(canvas, 'Send Discord Message');

    await sleep(200);

    await fireEvent.click(document.querySelector('#save-action-set'));

    await sleep(200);

    await fireEvent.change(document.querySelectorAll('.system-option.reqore-textarea')[0], {
      target: { value: 'Test action set' },
    });

    await sleep(200);

    await fireEvent.click(document.querySelector('#submit-action-set'));

    await waitFor(() => expect(document.querySelector('.reqore-modal')).not.toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const AddNewSet: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await CreateNewSet.play({ canvasElement, ...rest });

    await _testsOpenAppCatalogue(undefined, 500, 400);

    await _testsSelectFromAppCatalogue(canvas, undefined, 'Action sets', 'Test action set');

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(5);
  },
};

export const AddNewSetFromState: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await CreateNewSet.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelectorAll('.add-new-state-after')[0]);

    await _testsSelectFromAppCatalogue(canvas, undefined, 'Action sets', 'Test action set');

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(5);
  },
};

export const AddNewSetFromStateFromSet: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await AddNewSetFromState.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelectorAll('.add-new-state-after')[3]);

    await _testsSelectFromAppCatalogue(canvas, undefined, 'Action sets', 'Test action set');

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(7);
  },
};

export const AddNewSetFromStateAndFreely: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await CreateNewSet.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelectorAll('.add-new-state-after')[0]);

    await _testsSelectFromAppCatalogue(canvas, undefined, 'Action sets', 'Test action set');

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(5);

    await await _testsOpenAppCatalogue(undefined, 850, 250);

    await _testsSelectFromAppCatalogue(canvas, undefined, 'Action sets', 'Test action set');

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(7);
  },
};
