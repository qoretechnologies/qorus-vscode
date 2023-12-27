import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, within } from '@storybook/testing-library';
import { Description } from '../../components/Description';
import { sleep } from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: Description,
  title: 'Components/Description',
} as StoryMeta<typeof Description>;

export default meta;
export type Story = StoryObj<typeof meta>;

export const Empty: Story = {};
export const ShortDescription: Story = {
  args: {
    shortDescription: 'This is a short description',
  },
};

export const ShortDescriptionWithMaxLength: Story = {
  args: {
    shortDescription: 'This is a short description',
    maxShortDescriptionLength: 8,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    LongDescriptionOnly.play({ canvasElement, ...rest });

    await sleep(300);

    await expect(canvas.getByText('This is a short description')).toBeInTheDocument();
  },
};

export const LongDescriptionOnly: Story = {
  args: {
    // Add markdown long description
    longDescription: `# This is a long description with markdown support and a [link](https://www.google.com)`,
  },
  play: async ({ canvasElement, ...rest }) => {
    await fireEvent.click(document.querySelector('.description-more'));
  },
};

export const ShortAndLongDescription: Story = {
  args: {
    shortDescription: 'This is a short description',
    // Add markdown long description
    longDescription: `# This is a long description with markdown support and a [link](https://www.google.com)`,
  },
  play: async ({ canvasElement, ...rest }) => {
    LongDescriptionOnly.play({ canvasElement, ...rest });
  },
};
