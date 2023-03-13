import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@testing-library/react';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';

const meta = {
  component: FSMView,
} as Meta<typeof FSMView>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;
export const SwitchesToBuilder: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Go to flow builder')[0]);
    await fireEvent.click(canvas.getAllByText('Go to flow builder')[0]);

    // Wait for some time to allow the canvas to render
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(document.querySelector('#state-1')).toBeInTheDocument();
  },
};

export const ShowsStateIds: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await fireEvent.click(document.querySelector('#show-state-ids'));

    await expect(canvas.getAllByText('[1] Save Intent Info')[0]).toBeInTheDocument();
  },
};

export const AutoAlign: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Auto align states')[0]);
    await fireEvent.click(canvas.getAllByText('Auto align states')[0]);

    await expect(true).toBe(true);
  },
};

export const SelectedStateChange: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await waitFor(() => document.querySelector('#state-3'));
    await fireEvent.click(document.querySelector('#state-3'));

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();

    await fireEvent.click(document.querySelector('#state-1'));

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();
  },
};
