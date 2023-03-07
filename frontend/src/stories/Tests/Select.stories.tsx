import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent } from '@testing-library/react';
import SelectField from '../../components/Field/select';

export default {
  component: SelectField,
  argTypes: {
    onChange: { action: 'onChange' },
  },
};

export const ItemsWithDescription: StoryObj<typeof SelectField> = {
  args: {
    name: 'test',
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
      },
      {
        name: 'Item 2',
        desc: 'This is item 2',
      },
    ],
  },
  play: async () => {
    await fireEvent.click(document.querySelector('.reqore-button')!);

    await expect(document.querySelector('.reqore-modal')).toBeInTheDocument();
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(2);
  },
};
