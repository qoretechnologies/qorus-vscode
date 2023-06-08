import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { waitFor } from '@storybook/testing-library';
import { InterfacesView } from '../../containers/InterfacesView';
import { StoryMeta } from '../types';

const meta = {
  component: InterfacesView,
  title: 'Views/Interfaces',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof InterfacesView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async () => {
    await waitFor(
      () => expect(document.querySelectorAll('.reqore-collection-item')).toHaveLength(4),
      { timeout: 10000 }
    );
  },
};
