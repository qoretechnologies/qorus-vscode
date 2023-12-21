import { StoryObj } from '@storybook/react';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import { Existing } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import { _testsClickState } from './../utils';
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
    await SwitchesToBuilder.play({ canvasElement, ...rest });
    await _testsClickState(`state-2`);
  },
};
