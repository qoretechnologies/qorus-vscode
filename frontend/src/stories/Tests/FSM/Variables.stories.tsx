import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import VariablesFSM from '../../Data/variablesFsm.json';
import { StoryMeta } from '../../types';
import { NewVariable } from '../Variables.stories';
import {
  _testsCloseAppCatalogue,
  _testsOpenAppCatalogue,
  _testsSelectAppOrAction,
  sleep,
} from '../utils';
import { SwitchesToBuilder } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Variable management',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} as StoryMeta<typeof FSMView, { stateType?: string }>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;

export const NewVariableState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await _testsOpenAppCatalogue();

    await waitFor(() => canvas.getByText('Variables', { selector: 'h4' }), { timeout: 10000 });
    await fireEvent.click(canvas.getAllByText('Manage', { selector: 'span' })[0]);

    // @ts-ignore
    await NewVariable.play({ canvasElement, ...rest });

    await sleep(100);

    await fireEvent.click(canvas.getAllByText('Variables', { selector: 'h4' })[0]);

    await waitFor(
      async () => {
        await expect(canvas.getByText('testVariable', { selector: 'h4' })).toBeInTheDocument();
      },
      {
        timeout: 5000,
      }
    );
  },
};

export const EditVariable: StoryFSM = {
  args: {
    fsm: VariablesFSM,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await sleep(1000);

    // Open app catalogue
    await _testsOpenAppCatalogue();
    // Select variables
    await _testsSelectAppOrAction(canvas, 'Variables');

    await userEvent.click(document.querySelectorAll('.manage-variable')[0]);

    await fireEvent.change(document.querySelectorAll('.variables-form .reqore-input')[0], {
      target: { value: 'FirstVariableChanged' },
    });

    await fireEvent.click(document.querySelector('#save-variable'));
    await fireEvent.click(document.querySelector('#submit-variables'));

    await _testsCloseAppCatalogue();

    await expect(document.getElementById('state-2')).toBeInTheDocument();
    await expect(document.querySelectorAll('.fsm-state').length).toBe(1);
  },
};

export const DeleteVariable: StoryFSM = {
  args: {
    fsm: VariablesFSM,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await sleep(1000);

    // Open app catalogue
    await _testsOpenAppCatalogue();
    // Select variables
    await _testsSelectAppOrAction(canvas, 'Variables');

    await userEvent.click(document.querySelectorAll('.manage-variable')[1]);

    await userEvent.click(
      document.querySelectorAll('.reqore-modal .reqore-menu-item-right-icon')[1]
    );
    await userEvent.click(canvas.getAllByText('Confirm')[0]);

    await fireEvent.click(document.querySelector('#submit-variables'));

    await _testsCloseAppCatalogue();

    await expect(document.getElementById('state-1')).toBeInTheDocument();
    await expect(document.getElementById('state-3')).toBeInTheDocument();
    await expect(document.querySelectorAll('.fsm-state').length).toBe(2);
  },
};
