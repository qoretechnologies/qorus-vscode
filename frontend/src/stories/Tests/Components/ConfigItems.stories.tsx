import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import ConfigItemManager from '../../../containers/ConfigItemManager';
import { FiltersOpened, Grouped } from '../../Components/ConfigItems.stories';
import { StoryMeta } from '../../types';
import { SelectFilters } from './Filters.stories';

const meta = {
  component: ConfigItemManager,
  title: 'Tests/Components/Config Items',
} as StoryMeta<typeof ConfigItemManager>;

export default meta;

export const ItemsCanBeSearched: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Grouped.play({ canvasElement, ...rest });

    await fireEvent.change(canvas.getByPlaceholderText('Search'), {
      target: { value: 'Special' },
    });

    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(9);
  },
};

export const ItemsCanBeFiltered: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    await FiltersOpened.play({ canvasElement, ...rest });
    // @ts-ignore
    await SelectFilters.play({ canvasElement, ...rest });

    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(39);
  },
};

export const ItemsCanBeFilteredAndSearched: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await ItemsCanBeFiltered.play({ canvasElement, ...rest });

    await fireEvent.change(canvas.getByPlaceholderText('Search'), {
      target: { value: 'Special' },
    });

    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(7);
  },
};

export const ResetFilters: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    await FiltersOpened.play({ canvasElement, ...rest });
    // @ts-ignore
    await SelectFilters.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.config-items-filters-reset'));

    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(42);
  },
};
