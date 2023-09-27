import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import fsm from '../../Data/fsm.json';
import { SelectedStates } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import { _testsDeleteState, sleep } from '../utils';
import { SwitchesToBuilder } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Aligning states',
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

export const AutoAlign: StoryFSM = {
  name: 'Smart Align',
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('#fsm-diagram .reqore-panel').length).toBe(9);
        await sleep(1000);
        await fireEvent.click(document.querySelectorAll('#auto-align-states')[0]);
      },
      { timeout: 5000 }
    );
  },
};

export const VerticalTop: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-top'));
  },
};

export const VerticalCenter: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-center'));
  },
};

export const VerticalBottom: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-bottom'));
  },
};

export const HorizontalLeft: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-left'));
  },
};

export const HorizontalMiddle: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-middle'));
  },
};

export const HorizontalRight: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectedStates.play({ canvasElement, ...rest });
    await _testsDeleteState(2);
    await _testsDeleteState(3);
    await _testsDeleteState(4);
    await _testsDeleteState(6);
    await _testsDeleteState(8);
    await fireEvent.click(document.querySelector('.align-right'));
  },
};
