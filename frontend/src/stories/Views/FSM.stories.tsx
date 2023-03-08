import { Meta, StoryObj } from '@storybook/react';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';

type StoryFSM = StoryObj<typeof FSMView>;

export default {
  component: FSMView,
} as Meta<typeof FSMView>;

export const New: StoryFSM = {};
export const Existing: StoryFSM = {
  args: {
    fsm,
  },
};
export const NoInstance: StoryFSM = {
  args: {
    qorus_instance: false,
  },
};
