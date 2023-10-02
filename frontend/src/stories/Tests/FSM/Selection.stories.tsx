import { StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import fsm from '../../Data/fsm.json';
import { StoryMeta } from '../../types';
import { _testsCreateSelectionBox, sleep } from '../utils';
import { SwitchesToBuilder } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Selecting states',
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

export const StatesCanBeSelected: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });
    await sleep(500);
    await _testsCreateSelectionBox(300, 100, 800, 800, true);
  },
};

export const SelectionIsRemovedOnClick: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await StatesCanBeSelected.play({ canvasElement, ...rest });

    await sleep(100);

    await fireEvent.mouseDown(document.querySelector('#fsm-states-wrapper'));
    await fireEvent.mouseUp(document.querySelector('#fsm-states-wrapper'));
  },
};

export const SelectionIsRemovedWhenGoingBack: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await StatesCanBeSelected.play({ canvasElement, ...rest });

    await sleep(100);

    await fireEvent.click(canvas.getAllByText('Back')[0]);
  },
};
