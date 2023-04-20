import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';
import multipleVariablesFsm from '../Data/multipleVariablesFsm.json';
import { AutoAlign, SwitchesToBuilder } from '../Tests/FSM/Basic.stories';
import { sleep } from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: FSMView,
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
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

export const MultipleDeepVariableStates: StoryFSM = {
  args: {
    fsm: multipleVariablesFsm,
  },
  play: async ({ canvasElement, stateType, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getByText('State 2'));

    await waitFor(async () => await canvas.findAllByText('Next'), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Next')[0]);

    await waitFor(async () => await canvas.findAllByText('State 2.State 3'), {
      timeout: 5000,
    });
    await fireEvent.click(canvas.getAllByText('State 2.State 3')[0]);

    await waitFor(async () => await canvas.findAllByText('Next'), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Next')[0]);
    await expect(canvas.getAllByText('State 2.State 3.State 6')[0]).toBeInTheDocument();
  },
};

export const ReadonlyVariablesInState: StoryFSM = {
  args: {
    fsm: multipleVariablesFsm,
  },
  play: async ({ canvasElement, stateType, ...rest }) => {
    await MultipleDeepVariableStates.play({ canvasElement, ...rest });

    await userEvent.click(document.querySelectorAll('.reqore-menu-item-right-icon')[3]);
    await userEvent.click(document.querySelectorAll('.variable-selector')[0]);
  },
};

export const NoInstance: StoryFSM = {
  args: {
    qorus_instance: false,
  },
};

export const IncompatibleStates: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    await sleep(500);

    // Fake double click lol
    await fireEvent.click(document.querySelector('#state-1'));
    await fireEvent.click(document.querySelector('#state-1'));
  },
};
