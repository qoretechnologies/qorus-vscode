import { StoryObj } from '@storybook/react';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import { StoryMeta } from '../../types';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Drafts',
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

export const SavesDrafts: StoryFSM = {};
