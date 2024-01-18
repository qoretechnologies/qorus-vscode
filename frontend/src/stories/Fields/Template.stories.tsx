import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor } from '@storybook/testing-library';
import LongStringField from '../../components/Field/longString';
import Number from '../../components/Field/number';
import { TemplateField } from '../../components/Field/template';
import { buildTemplates } from '../../helpers/functions';
import templates from '../Data/templates.json';

const meta = {
  component: TemplateField,
  title: 'Fields/Template',
  args: {
    templates: buildTemplates(templates as any),
  },
} as Meta<typeof TemplateField>;

export default meta;

export const StringComponent: StoryObj<typeof meta> = {
  args: {
    component: LongStringField,
    value: 'Some string',
  },
};

export const TemplateValue: StoryObj<typeof meta> = {
  args: {
    component: Number,
    type: 'number',
    value: '$config:something',
  },
};

export const ShowsTemplatesList: StoryObj<typeof meta> = {
  ...TemplateValue,
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

export const ShowsTemplatesListForString: StoryObj<typeof meta> = {
  ...StringComponent,
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
