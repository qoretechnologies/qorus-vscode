import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@testing-library/react';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';
import { SwitchesToBuilder } from '../Tests/FSM.stories';
import { StoryMeta } from '../types';

const meta = {
  component: FSMView,
} as StoryMeta<typeof FSMView>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;
export const New: StoryFSM = {};
export const Existing: StoryFSM = {
  args: {
    fsm,
  },
};

export const NewState: StoryFSM = {
  play: async ({ canvasElement, stateType, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await fireEvent.dblClick(document.querySelector(`#${stateType || 'mapper'}`));
    await waitFor(() => expect(document.querySelector('.reqore-drawer')).toBeInTheDocument());
    expect(document.querySelector('#state-1')).toBeInTheDocument();
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
