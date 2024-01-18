import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import Options from '../../../components/Field/systemOptions';
import { Basic } from '../../Fields/Options/Options.stories';

const meta = {
  component: Options,
  title: 'Tests/Fields/Options',
} as Meta<typeof Options>;

export default meta;

export const DependantsResetWhenParentChanges: StoryObj<typeof meta> = {
  ...Basic,
  args: {
    minColumnWidth: '300px',
    options: {
      optionWithDependents: {
        type: 'string',
        display_name: 'Option with dependents',
        short_desc: 'Option with dependents',
        has_dependents: true,
        required: true,
      },
      anotherDependent: {
        type: 'string',
        display_name: 'Another dependent',
        short_desc: 'Another dependent',
        has_dependents: true,
        required: true,
      },
      dependent1: {
        type: 'string',
        display_name: 'Dependent 1',
        short_desc: 'Dependent 1',
        depends_on: ['optionWithDependents'],
        required: true,
      },
      dependent2: {
        type: 'hash',
        display_name: 'Dependent 2',
        short_desc: 'Dependent 2',
        depends_on: ['optionWithDependents', 'anotherOption'],
        required: true,
      },
    },
    value: {
      optionWithDependents: { type: 'string', value: 'I have a value' },
      anotherDependent: { type: 'string', value: 'My value will not change' },
      dependent1: { type: 'string', value: '$local:test' },
      dependent2: { type: 'hash', value: 'test: Hello' },
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(canvas.getAllByDisplayValue('$local:test')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
    await waitFor(
      () =>
        expect(document.querySelectorAll('.reqore-collection-item.system-option').length).toBe(4),
      {
        timeout: 10000,
      }
    );

    await fireEvent.change(
      document.querySelectorAll('.system-option.reqore-panel')[3].querySelector('.reqore-textarea'),
      {
        target: { value: 'My value changed' },
      }
    );

    await expect(rest.args.onChange).toHaveBeenLastCalledWith('options', {
      optionWithDependents: {
        type: 'string',
        value: 'My value changed',
      },
      anotherDependent: { type: 'string', value: 'My value will not change' },
      dependent1: { type: 'string', value: undefined },
      dependent2: { type: 'hash', value: undefined },
    });
  },
};
