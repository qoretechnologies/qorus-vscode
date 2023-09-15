import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { useState } from 'react';
import SelectField from '../../components/Field/select';

export default {
  component: SelectField,
  title: 'Fields/Select',
};

export const Default: StoryObj<typeof SelectField> = {};
export const Items: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
      },
      {
        name: 'Item 2',
      },
    ],
  },
};

export const ItemsWithDescription: StoryObj<typeof SelectField> = {
  args: {
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

export const WithValue: StoryObj<typeof SelectField> = {
  args: {
    value: 'Item 2',
    defaultItems: [
      {
        name: 'Item 1',
      },
      {
        name: 'Item 2',
      },
    ],
  },
};

export const AutoSelect: StoryObj<typeof SelectField> = {
  render: (props) => {
    const [value, setValue] = useState(undefined);

    return (
      <SelectField
        value={value}
        onChange={(name, value) => setValue(value)}
        autoSelect
        {...props}
      />
    );
  },
  args: {
    defaultItems: [
      {
        name: 'Item 1',
      },
    ],
  },
};

export const AutoSelectWithDescriptions: StoryObj<typeof SelectField> = {
  ...AutoSelect,
  args: {
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
      },
    ],
  },
};
