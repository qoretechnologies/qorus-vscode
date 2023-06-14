import { StoryObj } from '@storybook/react';
import { ConfigItemsManagerFilters } from '../../../containers/ConfigItemManager/filters';
import configItems from '../../Data/configItems';
import { StoryMeta } from '../../types';

const meta = {
  component: ConfigItemsManagerFilters,
  title: 'Components/Config Items/Filters',
} as StoryMeta<typeof ConfigItemsManagerFilters>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
  },
};
