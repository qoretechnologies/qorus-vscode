import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { waitFor, within } from '@storybook/testing-library';
import { Qodex } from '../../containers/InterfaceCreator/qodex';
import {
  _testsClickState,
  _testsDoubleClickState,
  _testsOpenAppCatalogue,
  _testsSelectAppOrAction,
  sleep,
} from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: Qodex,
  title: 'Views/Qodex',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof Qodex>;

export default meta;

type Story = StoryObj<typeof meta>;

export const New: Story = {};
export const InitialEvent: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await _testsSelectAppOrAction(canvas, 'Discord');
    await _testsSelectAppOrAction(canvas, 'New Discord Messages on Server');

    await waitFor(() => expect(canvas.getAllByText('Server')[0]).toBeInTheDocument(), {
      timeout: 3000,
    });
    await waitFor(() => expect(canvas.getAllByText('PleaseSelect')[0]).toBeInTheDocument(), {
      timeout: 3000,
    });
  },
};

export const NewAction: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await InitialEvent.play({ canvasElement, ...rest });

    await sleep(300);

    await _testsOpenAppCatalogue(undefined, 1825, 350);
    await _testsSelectAppOrAction(canvas, 'Discord');
    await _testsSelectAppOrAction(canvas, 'Send Discord Message');

    await _testsDoubleClickState('state-1');

    await sleep(500);

    await _testsClickState('state-2');
  },
};
