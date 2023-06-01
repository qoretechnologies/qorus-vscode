import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import String from '../../../components/Field/string';
import { TemplateField } from '../../../components/Field/template';
import { ShowsTemplatesList } from '../../Fields/Template.stories';

const meta = {
  component: TemplateField,
  title: 'Tests/Fields/Template',
} as Meta<typeof TemplateField>;

export default meta;

export const TemplateCanBeSelected: StoryObj<typeof meta> = {
  args: {
    component: String,
    value: '$config:something',
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ShowsTemplatesList.play({ canvasElement, ...rest });

    await waitFor(() => expect(document.querySelector('.q-select-dialog')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(async () => await canvas.getByText('python-expr'), { timeout: 10000 });

    await fireEvent.click(canvas.getByText('python-expr'));

    await expect(canvas.getAllByText('python-expr')[0]).toBeInTheDocument();
  },
};

export const ValueIsResetWhenChangingTabs: StoryObj<typeof meta> = {
  args: {
    component: String,
    value: '$config:something',
    name: 'Test Field',
  },
  play: async ({ canvasElement, ...rest }) => {
    await fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[0]);
    await expect(rest.args.onChange).toHaveBeenCalledWith('Test Field', '$config:something');
    await expect(rest.args.onChange).toHaveBeenLastCalledWith('Test Field', null);
  },
};
