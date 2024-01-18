import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import { Existing } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import { _testsClickState, sleep } from './../utils';
import { SwitchesToBuilder } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/State Detail',
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

export const StateDataIsShown: StoryFSM = {
  ...Existing,
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });
    await _testsClickState(`Send Discord Message`);
    await sleep(500);
    await waitFor(() => canvas.getAllByText('Message Content')[0], { timeout: 20000 });
    await sleep(5000);
    await fireEvent.click(document.querySelector('.system-option.reqore-textarea'));
    await expect(
      document.querySelectorAll('.reqore-popover-content .reqore-menu-item')
    ).toHaveLength(3);
  },
};
