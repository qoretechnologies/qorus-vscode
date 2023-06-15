import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { ConfigItemsManagerFilters } from '../../../containers/ConfigItemManager/filters';
import configItems from '../../Data/configItems';
import { StoryMeta } from '../../types';

const meta = {
  component: ConfigItemsManagerFilters,
  title: 'Tests/Components/Collection Filters',
} as StoryMeta<typeof ConfigItemsManagerFilters>;

export default meta;

export const SelectFilters: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(document.querySelector('.filters'));

    await fireEvent.click(canvas.getByText('boolean'));
    await fireEvent.click(canvas.getByText('number'));
    await fireEvent.click(canvas.getByText('default'));
    await fireEvent.click(canvas.getByText('step'));
    await fireEvent.click(canvas.getByText('With value'));
    await fireEvent.click(canvas.getByText('ConfigItems'));
    await fireEvent.click(canvas.getByText('GreatConfigItems'));
    await fireEvent.click(canvas.getByText('SomeOtherClass'));

    await expect(canvas.getByText('51')).toBeInTheDocument();

    await fireEvent.click(canvas.getAllByText('View items')[0]);

    if (rest.args.onSubmit) {
      expect(rest.args.onSubmit).toHaveBeenCalledWith({
        type: ['boolean', 'number'],
        level: ['default', 'step'],
        is_set: [true],
        parent_class: ['ConfigItems', 'GreatConfigItems', 'SomeOtherClass'],
      });
    }
  },
};

export const ResetFilters: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SelectFilters.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await fireEvent.click(canvas.getAllByText('Reset all filters')[0]);

    await expect(canvas.getByText('69')).toBeInTheDocument();

    await fireEvent.click(canvas.getAllByText('View items')[0]);

    expect(rest.args.onSubmit).toHaveBeenCalledWith({});
  },
};
