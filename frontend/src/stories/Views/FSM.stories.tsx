import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';
import multipleVariablesFsm from '../Data/multipleVariablesFsm.json';
import transactionStateFsm from '../Data/transacitonStateFsm.json';
import { AutoAlign, SwitchesToBuilder } from '../Tests/FSM/Basic.stories';
import {
  _testsClickState,
  _testsClickStateByLabel,
  _testsSelectState,
  sleep,
} from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: FSMView,
  title: 'Views/FSM',
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
    await _testsClickState('state-3');
  },
};

export const MultipleDeepVariableStates: StoryFSM = {
  args: {
    fsm: multipleVariablesFsm,
  },
  play: async ({ canvasElement, stateType, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await _testsClickState('state-2');

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeDisabled(),
      {
        timeout: 5000,
      }
    );

    // Fill the required option
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.system-option .reqore-textarea')[0], {
          target: {
            value: 'This is a test',
          },
        });
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeEnabled(),
      {
        timeout: 5000,
      }
    );

    await waitFor(async () => await canvas.findAllByText('Next'), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Next')[0]);

    await waitFor(async () => await canvas.findAllByText('State 2.State 3'), {
      timeout: 5000,
    });

    await _testsClickStateByLabel(canvas, 'State 2.State 3');

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeDisabled(),
      {
        timeout: 5000,
      }
    );

    // Fill the required option
    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.system-option .reqore-textarea')[1], {
          target: {
            value: 'This is a test 2',
          },
        });
      },
      { timeout: 5000 }
    );

    await waitFor(
      async () => await expect(document.querySelector('.state-next-button')).toBeEnabled(),
      {
        timeout: 5000,
      }
    );

    await waitFor(async () => await canvas.findAllByText('Next'), {
      timeout: 5000,
    });

    await fireEvent.click(canvas.getAllByText('Next')[0]);
    await expect(canvas.getAllByText('State 2.State 3.State 6')[0]).toBeInTheDocument();
  },
};

export const TransactionState: StoryFSM = {
  args: {
    fsm: transactionStateFsm,
  },
  play: async ({ canvasElement, stateType, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await _testsClickState('state-1');

    await sleep(1500);

    await waitFor(async () => await canvas.findAllByText('Next'), {
      timeout: 5000,
    });

    await sleep(1500);

    await fireEvent.click(canvas.getAllByText('Next')[0]);
  },
};

export const ReadonlyVariablesInState: StoryFSM = {
  args: {
    fsm: multipleVariablesFsm,
  },
  play: async ({ canvasElement, stateType, ...rest }) => {
    await MultipleDeepVariableStates.play({ canvasElement, ...rest });

    await userEvent.click(document.querySelectorAll('.reqore-menu-item-right-icon')[6]);
    await userEvent.click(document.querySelectorAll('.variable-list .reqore-menu-item')[1]);
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
    await _testsClickState('state-1');
    await _testsClickState('state-1');
  },
};

export const SelectedStates: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    await sleep(500);

    await _testsSelectState('state-1');
    await _testsSelectState('state-2');
    await _testsSelectState('state-3');
  },
};

export const SelectionBox: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    await sleep(500);

    await fireEvent.mouseOver(document.querySelector('#fsm-diagram'));

    await fireEvent.keyDown(document, {
      key: 'Meta',
      shiftKey: true,
    });

    await sleep(500);

    await fireEvent.mouseDown(document.querySelector('#fsm-diagram'), {
      clientX: 400,
      clientY: 200,
      shiftKey: true,
    });

    await sleep(500);

    await fireEvent.mouseMove(document.querySelector('#fsm-diagram'), {
      clientX: 1000,
      clientY: 600,
      shiftKey: true,
    });
  },
};
