import { StoryObj } from '@storybook/react';
import Component from '../../components/Field/number';

const meta = {
  component: Component,
};

export default meta;

export const Default: StoryObj<typeof Component> = {};

export const WithDefaultValue: StoryObj<typeof Component> = {
  args: {
    default_value: 10,
  },
};

export const WithValue: StoryObj<typeof Component> = {
  args: {
    ...WithDefaultValue.args,
    value: 20,
  },
};

export const WithAutofocus: StoryObj<typeof Component> = {
  args: {
    autoFocus: true,
  },
};
