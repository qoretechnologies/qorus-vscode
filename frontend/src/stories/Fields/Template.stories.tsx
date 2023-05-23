import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
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
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await waitFor(
      async () => {
        await canvas.findAllByText('config')[0];
        await fireEvent.click(canvas.getAllByText('config')[0]);
      },
      { timeout: 5000 }
    );
  },
};
