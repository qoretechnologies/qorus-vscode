import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import Options from '../../../components/Field/systemOptions';

const meta = {
  component: Options,
  title: 'Tests/Fields/Options',
} as Meta<typeof Options>;

export default meta;

export const NonExistentOptionsFiltered: StoryObj<typeof meta> = {
  args: {
    value: {
      option1: { type: 'string', value: 'option1' },
      option2: { type: 'string', value: 'option2' },
      option3: { type: 'string', value: 'option3' },
    },
    options: {
      option1: { type: 'string' },
      option2: { type: 'string' },
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    await fireEvent.change(document.querySelectorAll('.system-option .reqore-textarea')[0], {
      target: { value: 'option1a' },
    });

    await expect(rest.args.onChange).toHaveBeenCalledWith(undefined, {
      option1: { type: 'string', value: 'option1a' },
      option2: { type: 'string', value: 'option2' },
      option3: { type: 'string', value: 'option3' },
    });
  },
};

export const OptionIsDependentOnAnotherOption: StoryObj<typeof meta> = {
  args: {
    options: {
      option1: { type: 'string', required: true },
      option2: { type: 'string', required: true, depends_on: ['option1'], default_value: 'test' },
      option3: { type: 'string', required: true, depends_on: ['option1', 'option2'] },
      option4: { type: 'string', required: true, depends_on: ['option2'] },
    },
  },
};
