import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { useState } from 'react';
import SelectField from '../../components/Field/select';
import { sleep } from '../Tests/utils';

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

export const ItemsWithDescriptionAndMessages: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
        messages: [
          {
            title: 'Test',
            intent: 'danger',
            content: 'This is a test',
          },
        ],
      },
      {
        name: 'Item 2',
        desc: 'This is item 2',
        messages: [
          {
            title: 'Test',
            intent: 'success',
            content: 'This is a test',
          },
          {
            intent: 'warning',
            content: 'This is a test',
          },
        ],
      },
    ],
  },
};

export const OpenedItemsWithDescriptionAndMessages: StoryObj<typeof SelectField> = {
  ...ItemsWithDescriptionAndMessages,
  play: async () => {
    await fireEvent.click(document.querySelector('.reqore-button')!);

    await expect(document.querySelector('.reqore-modal')).toBeInTheDocument();
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(2);
  },
};

export const DisabledItemsWithIntent: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
      },
      {
        name: 'Item 2',
      },
      {
        name: 'Disabled item',
        disabled: true,
      },
      {
        name: 'Item with intent',
        intent: 'success',
      },
      {
        name: 'Disabled Item with Intent',
        intent: 'danger',
        disabled: true,
      },
    ],
  },
  play: async () => {
    await sleep(500);
    await fireEvent.click(document.querySelector('.reqore-button')!);

    await expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  },
};

export const DisabledItemsWithIntentAndDescriptions: StoryObj<typeof SelectField> = {
  args: {
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
      },
      {
        name: 'Item 2',
        short_desc: 'This is item 2',
      },
      {
        name: 'Disabled item',
        disabled: true,
        short_desc: 'This is item 2',
      },
      {
        name: 'Item with intent',
        intent: 'success',
        short_desc: 'This is item 2',
      },
      {
        name: 'Disabled Item with Intent',
        intent: 'danger',
        disabled: true,
        short_desc: 'This is item 2',
      },
    ],
  },
  play: async () => {
    await fireEvent.click(document.querySelector('.reqore-button')!);

    await expect(document.querySelector('.reqore-modal')).toBeInTheDocument();
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(5);
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
  play: async () => {
    await sleep(300);
    await fireEvent.click(document.querySelector('.reqore-button')!);

    await expect(document.querySelectorAll('.reqore-popover-content').length).toBe(1);
  },
};

export const WithValueAndErrors: StoryObj<typeof SelectField> = {
  args: {
    value: 'Item 2',
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
        intent: 'danger',
      },
      {
        name: 'Item 2',
        desc: 'This is item 1',
      },
    ],
  },
};

export const WithValueAndErrorsSelected: StoryObj<typeof SelectField> = {
  args: {
    value: 'Item 1',
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
        intent: 'danger',
      },
      {
        name: 'Item 2',
        desc: 'This is item 1',
      },
    ],
  },
};

export const WithValueAndWarningsSelected: StoryObj<typeof SelectField> = {
  args: {
    value: 'Item 1',
    defaultItems: [
      {
        name: 'Item 1',
        desc: 'This is item 1',
        metadata: {
          needs_auth: true,
        },
      },
      {
        name: 'Item 2',
        desc: 'This is item 1',
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

export const AutoSelectWithShortDescriptions: StoryObj<typeof SelectField> = {
  ...AutoSelect,
  args: {
    defaultItems: [
      {
        name: 'Item 1',
        short_desc: 'Short item 1 description',
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
