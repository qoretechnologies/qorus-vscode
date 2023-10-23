import { StoryObj } from '@storybook/react';
import { within } from '@storybook/testing-library';
import { Qodex } from '../../containers/InterfaceCreator/qodex';
import { _testsSelectAppOrAction } from '../Tests/utils';
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

    await _testsSelectAppOrAction(canvas, 'Google Calendar');
    await _testsSelectAppOrAction(canvas, 'New Google calendar event');
  },
};
