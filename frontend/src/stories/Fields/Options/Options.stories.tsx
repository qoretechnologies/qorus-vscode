import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { useEffect, useState } from 'react';
import Options, { IOptionsSchema } from '../../../components/Field/systemOptions';

const meta = {
  component: Options,
  title: 'Fields/Options',
} as Meta<typeof Options>;

export default meta;

const getOptions = (allOptional: boolean = false): IOptionsSchema => ({
  basicOption: { type: 'string', preselected: !allOptional },
  optionWithDescription: {
    type: 'string',
    display_name: 'Option with description',
    desc: 'Option with markdown `description`\n\r ## Nice',
    preselected: !allOptional,
  },
  optionWithShortDescription: {
    type: 'list',
    display_name: 'Option with short description',
    short_desc: 'Option with short description',
    required: !allOptional,
    depends_on: ['basicOption', 'nonExistentOption'],
  },
  hiddenOption: {
    type: 'string',
    display_name: 'I am hidden',
    short_desc: 'I am hidden because I am not preselected or required',
  },
  optionWithValue: {
    type: 'string',
    display_name: 'Option with value',
  },
  optionWithInvalidValue: {
    type: 'string',
    display_name: 'Option with invalid value',
  },
  templateOption: {
    type: 'string',
    display_name: 'Template option',
  },
  optionWithMessages: {
    short_desc: 'Option with some messages',
    preselected: !allOptional,
    type: 'string',
    display_name: 'Option with messages',
    messages: [
      {
        title: 'Success',
        intent: 'success',
        content: 'A successful message with title',
      },
      {
        intent: 'danger',
        content: 'A dangerous message',
      },
    ],
  },
  disabledOption: {
    type: 'number',
    display_name: 'Disabled option',
    disabled: true,
    preselected: !allOptional,
  },
  optionWithAutoSelect: {
    type: 'string',
    display_name: 'Option with auto select',
    allowed_values: [{ name: 'Allowed value 1', short_desc: 'Allowed value 1' }],
    required: !allOptional,
  },
  optionWithBrokenAllowedValues: {
    type: 'string',
    display_name: 'Option with allowed values',
    allowed_values: [
      { name: 'Allowed value 1', short_desc: 'Allowed value 1' },
      { name: 'Allowed value 2', short_desc: 'Allowed value 2' },
    ],
    required: !allOptional,
  },
  selectedOption: {
    type: 'hash',
    display_name: 'Selected option',
  },
  optionWithDependents: {
    type: 'date',
    display_name: 'Option with dependents',
    short_desc: 'Option with dependents',
    has_dependents: true,
    required: !allOptional,
  },
  schemaOption: {
    type: 'hash',
    preselected: !allOptional,
    display_name: 'Schema Option',
    short_desc: 'Option with arg schema',
    arg_schema: {
      schemaOption1: {
        type: 'string',
        display_name: 'Schema option 1',
        short_desc: 'Schema option 1',
        required: true,
      },
      optionWithAutoSelect: {
        type: 'string',
        display_name: 'Option with auto select',
        allowed_values: [{ name: 'Allowed value 1', short_desc: 'Allowed value 1' }],
        required: true,
      },
    },
  },
});

export const Basic: StoryObj<typeof meta> = {
  render: ({ value, onChange, ...rest }) => {
    const [val, setValue] = useState(value);

    useEffect(() => {
      onChange('options', val);
    }, [val]);

    return <Options {...rest} value={val} onChange={(_n, v) => setValue(v)} />;
  },
  args: {
    minColumnWidth: '300px',
    options: getOptions(),
    value: {
      optionWithValue: { type: 'string', value: '123' },
      optionWithInvalidValue: { type: 'string', value: 123 },
      templateOption: { type: 'string', value: '$local:test' },
      selectedOption: { type: 'hash', value: undefined },
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('local')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(
      () =>
        expect(document.querySelectorAll('.reqore-collection-item.system-option').length).toBe(13),
      {
        timeout: 10000,
      }
    );

    await expect(rest.args.onChange).toHaveBeenLastCalledWith(
      'options',
      expect.objectContaining({
        optionWithAutoSelect: {
          type: 'string',
          value: 'Allowed value 1',
        },
        optionWithValue: { type: 'string', value: '123' },
        optionWithInvalidValue: { type: 'string', value: 123 },
        templateOption: { type: 'string', value: '$local:test' },
        selectedOption: { type: 'hash', value: undefined },
      })
    );
  },
};

export const Optional: StoryObj<typeof meta> = {
  args: {
    minColumnWidth: '300px',
    options: getOptions(true),
  },
};

export const OptionalOpened: StoryObj<typeof meta> = {
  args: {
    minColumnWidth: '300px',
    options: getOptions(true),
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByText('AddNewOption (14)')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });

    await fireEvent.click(canvas.getAllByText('AddNewOption (14)')[0]);
  },
};

export const OptionalWithValues: StoryObj<typeof meta> = {
  args: {
    minColumnWidth: '300px',
    options: getOptions(true),
    value: {
      optionWithValue: { type: 'string', value: '123' },
      optionWithInvalidValue: { type: 'string', value: 123 },
      templateOption: { type: 'string', value: '$local:test' },
      selectedOption: { type: 'hash', value: undefined },
    },
  },
};

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
