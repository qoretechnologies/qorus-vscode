import { StoryObj } from '@storybook/react';
import { ConfigItemsManagerFilters } from '../../containers/ConfigItemManager/filters';
import configItems from '../Data/configItems';
import { StoryMeta } from '../types';

const meta = {
  component: ConfigItemsManagerFilters,
  title: 'Components/Collection Filters',
} as StoryMeta<typeof ConfigItemsManagerFilters>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
  },
};

export const Existing: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
    filters: {
      type: ['string', 'number'],
      level: ['step'],
      strictly_local: [true],
      is_set: [false],
    },
  },
};

export const NoItems: StoryObj<typeof meta> = {
  args: {
    localItems: configItems.items,
    globalItems: configItems.global_items,
    workflowItems: configItems.workflow_items,
    filters: {
      type: ['string', 'number'],
      level: ['step'],
      parent_class: ['MoreConfigItems'],
      strictly_local: [true],
      is_set: [false],
    },
  },
};
