import { StoryObj } from '@storybook/react';
import Auto from '../../components/Field/auto';

export default {
  component: Auto,
  title: 'Fields/Auto',
};

export const Default: StoryObj<typeof Auto> = {};
export const Connection: StoryObj<typeof Auto> = {
  args: {
    defaultType: 'connection',
  },
};
