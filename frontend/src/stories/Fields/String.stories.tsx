import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import StringField from '../../components/Field/string';

const meta = {
  component: StringField,
};

export default meta;

export const Default: StoryObj<typeof StringField> = {};
export const WithLabel: StoryObj<typeof StringField> = {
  args: {
    label: 'Field label',
  },
  play: async () => {
    await expect(document.querySelector('.reqore-tag')).toBeInTheDocument();
  },
};

export const WithDefaultValue: StoryObj<typeof StringField> = {
  args: {
    default_value: 'Some default value',
  },
};

export const WithValue: StoryObj<typeof StringField> = {
  args: {
    ...WithDefaultValue.args,
    value: 'Some value',
  },
};

export const WithAutofocus: StoryObj<typeof StringField> = {
  args: {
    autoFocus: true,
  },
};

export const CanBeNull: StoryObj<typeof StringField> = {
  args: {
    canBeNull: true,
    value: null,
  },
};
