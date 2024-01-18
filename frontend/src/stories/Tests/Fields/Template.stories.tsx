import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import Number from '../../../components/Field/number';
import { TemplateField } from '../../../components/Field/template';
import { buildTemplates } from '../../../helpers/functions';
import templates from '../../Data/templates.json';
import { ShowsTemplatesListForString } from '../../Fields/Template.stories';
import { sleep } from '../utils';

const meta = {
  component: TemplateField,
  title: 'Tests/Fields/Template',
  args: {
    templates: buildTemplates(templates as any),
  },
} as Meta<typeof TemplateField>;

export default meta;

export const TemplateCanBeSelected: StoryObj<typeof meta> = {
  args: {
    type: 'string',
    defaultType: 'string',
    defaultInternalType: 'string',
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ShowsTemplatesListForString.play({ canvasElement, ...rest });

    await waitFor(
      () => expect(document.querySelector('.reqore-popover-content')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );

    await sleep(500);

    await waitFor(async () => await canvas.getAllByText('Context Data')[0], { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('Context Data')[0]);

    await sleep(500);

    await waitFor(async () => await canvas.getAllByText('Interface ID')[0], { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('Interface ID')[0]);

    await expect(canvas.getByDisplayValue('$local:id')).toBeInTheDocument();
  },
};

export const ValueIsResetWhenChangingTabs: StoryObj<typeof meta> = {
  args: {
    component: Number,
    type: 'number',
    value: '$config:something',
    name: 'Test Field',
  },
  play: async ({ canvasElement, ...rest }) => {
    await waitFor(
      async () => {
        await expect(document.querySelector('.template-selector')).toBeInTheDocument();
      },
      { timeout: 10000 }
    );

    await fireEvent.click(document.querySelectorAll('.reqore-tabs-list-item')[0]);
    await expect(rest.args.onChange).toHaveBeenLastCalledWith('Test Field', null);
  },
};
