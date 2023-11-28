import { StoryObj } from '@storybook/react';
import { Dashboard } from '../../views/dashboard';
import { StoryMeta } from '../types';

const meta = {
  component: Dashboard,
  title: 'Views/Dashboard',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof Dashboard>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {};
