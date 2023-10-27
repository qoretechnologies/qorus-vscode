import { StoryObj } from '@storybook/react';
import { OptionFieldMessages } from '../../../components/Field/optionFieldMessages';
import { StoryMeta } from '../../types';

const meta = {
  component: OptionFieldMessages,
  title: 'Fields/Options/Messages',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof OptionFieldMessages>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Required: Story = {
  args: {
    schema: {
      test: {
        type: 'string',
        required: true,
      },
    },
    option: {
      type: 'string',
      value: undefined,
    },
    name: 'test',
  },
};

export const Invalid: Story = {
  args: {
    schema: {
      test: {
        type: 'string',
        required: true,
      },
    },
    option: {
      type: 'string',
      value: 123,
    },
    name: 'test',
  },
};

export const MissingDependencies: Story = {
  args: {
    schema: {
      someOption: {
        type: 'string',
        required: true,
      },
      anotherOption: {
        type: 'string',
        required: true,
      },
      test: {
        type: 'string',
        required: true,
        depends_on: ['someOption', 'anotherOption'],
      },
    },
    allOptions: {
      someOption: {
        type: 'string',
        value: undefined,
      },
      anotherOption: {
        type: 'string',
        value: 'test',
      },
    },
    option: {
      type: 'string',
      value: 'heh',
    },
    name: 'test',
  },
};
