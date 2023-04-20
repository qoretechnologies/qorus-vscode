import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { FSMVariables } from '../../containers/InterfaceCreator/fsm/variables';
import { StoryMeta } from '../types';
import { _testsSelectItemFromDropdown, sleep } from './utils';

const meta = {
  component: FSMVariables,
  title: 'Tests/Variables',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof FSMVariables, { stateType?: string }>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;

export const NewVariable: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    // Open the variables dialog
    await waitFor(async () => {
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
      },
      {
        timeout: 5000,
      }
    );

    if (rest.args.onSubmit) {
      await expect(rest.args.onSubmit).toHaveBeenCalled();
    }
  },
};
