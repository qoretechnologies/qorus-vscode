import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@testing-library/react';
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

export const SelectedState: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Go to flow builder')[0]);
    await fireEvent.click(canvas.getAllByText('Go to flow builder')[0]);

    // Wait for some time to allow the canvas to render
    await new Promise((resolve) => setTimeout(resolve, 500));

    await waitFor(() => document.querySelector('#state-3'));
    await fireEvent.click(document.querySelector('#state-3'));
  },
};

export const NoInstance: StoryFSM = {
  args: {
    qorus_instance: false,
  },
};
