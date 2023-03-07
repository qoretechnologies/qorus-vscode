import { StoryObj } from '@storybook/react';
import SelectField from '../../components/Field/select';

export default {
  component: SelectField,
};

export const Default: StoryObj<typeof SelectField> = {};
export const Items: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
      },
      {
        name: 'Item 2',
      },
    ],
  },
};

export const ItemsWithDescription: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
      },
      {
        name: 'Item 2',
        desc: 'This is item 2',
      },
    ],
  },
};

export const WithValue: StoryObj<typeof SelectField> = {
  args: {
    value: 'Item 2',
    defaultItems: [
      {
        name: 'Item 1',
      },
      {
        name: 'Item 2',
      },
    ],
  },
};
