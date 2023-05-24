import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor } from '@storybook/testing-library';
import String from '../../components/Field/string';
import { TemplateField } from '../../components/Field/template';

const meta = {
  component: TemplateField,
  title: 'Fields/Template',
} as Meta<typeof TemplateField>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    component: String,
    value: 'Some string',
  },
};

export const TemplateValue: StoryObj<typeof meta> = {
  args: {
    component: String,
    value: '$config:something',
  },
};

export const ShowsTemplatesList: StoryObj<typeof meta> = {
  args: {
    component: String,
    value: '$config:something',
  },
  play: async () => {
    await waitFor(
      async () => {
        await expect(document.querySelector('.template-selector')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await fireEvent.click(document.querySelector('.template-selector'));
  },
};
