import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import VariablesFSM from '../../Data/variablesFsm.json';
import { StoryMeta } from '../../types';
import { _testsSelectItemFromDropdown, sleep } from '../utils';
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

export const NewVariable: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await SwitchesToBuilder.play({ canvasElement, ...rest });

    // Open the variables dialog
    await waitFor(async () => {
      await fireEvent.click(document.querySelector('#fsm-variables'));
      await expect(document.querySelector('#create-new-variable')).toBeInTheDocument();
    });

    await fireEvent.click(document.querySelector('#create-new-variable'));
    await expect(document.querySelector('#save-variable')).toBeDisabled();

    await fireEvent.change(document.querySelectorAll('.reqore-input')[0], {
      target: { value: 'testVariable' },
    });
    await fireEvent.change(document.querySelectorAll('.reqore-textarea')[0], {
      target: { value: 'This is a test description' },
    });
    await waitFor(_testsSelectItemFromDropdown(canvas, 'data-provider', 'string'));

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('datasource'));
    await waitFor(
      async () => {
        await fireEvent.click(document.querySelector('.provider-selector'));
        await fireEvent.click(canvas.getAllByText('omquser')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await fireEvent.change(document.querySelectorAll('.reqore-textarea')[1], {
          target: { value: 'SELECT * FROM gl_record' },
        });
        await sleep(1000);
        await fireEvent.click(canvas.getAllByText('Apply search options')[0]);
      },
      {
        timeout: 5000,
      }
    );

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelector('#save-variable')).toBeEnabled();
        await fireEvent.click(document.querySelector('#save-variable'));
        await fireEvent.click(document.querySelector('#submit-variables'));
        await expect(document.querySelector(`#var-actiontestVariable`)).toBeInTheDocument();
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
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await sleep(1000);

    await userEvent.click(document.querySelectorAll('.reqore-menu-item-right-icon')[0]);
    await fireEvent.change(document.querySelectorAll('.reqore-input')[0], {
      target: { value: 'FirstVariableChanged' },
    });

    await fireEvent.click(document.querySelector('#save-variable'));
    await fireEvent.click(document.querySelector('#submit-variables'));

    expect(document.getElementById('state-2')).toBeInTheDocument();
    expect(document.querySelectorAll('.fsm-state').length).toBe(1);
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

    await userEvent.click(document.querySelectorAll('.reqore-menu-item-right-icon')[1]);
    await userEvent.click(
      document.querySelectorAll('.reqore-modal .reqore-menu-item-right-icon')[1]
    );
    await userEvent.click(canvas.getAllByText('Confirm')[0]);

    await fireEvent.click(document.querySelector('#submit-variables'));

    expect(document.getElementById('state-1')).toBeInTheDocument();
    expect(document.getElementById('state-3')).toBeInTheDocument();
    expect(document.querySelectorAll('.fsm-state').length).toBe(2);
  },
};
