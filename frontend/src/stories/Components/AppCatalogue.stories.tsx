import { StoryObj } from '@storybook/react';
import { AppCatalogue } from '../../components/AppCatalogue';
import apps from '../Data/apps.json';
import { StoryMeta } from '../types';

const meta = {
  component: AppCatalogue,
  title: 'Components/App Catalogue',
} as StoryMeta<typeof AppCatalogue>;

export default meta;

export const Default: StoryObj<typeof meta> = {
  args: {
    apps,
  },
};
