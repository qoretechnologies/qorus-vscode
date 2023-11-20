import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { AppCatalogue, IApp } from '../../components/AppCatalogue';
import apps from '../Data/apps.json';
import builtInApps from '../Data/builtInApps.json';
import { StoryMeta } from '../types';

const typedApps: IApp[] = apps as IApp[];
const typedBuiltInApps: IApp[] = builtInApps as IApp[];

const meta = {
  component: AppCatalogue,
  title: 'Components/App Catalogue',
} as StoryMeta<typeof AppCatalogue>;

export default meta;

export const Basic: StoryObj<typeof meta> = {
  args: {
    apps: typedApps,
    icon: 'Apps2Fill',
    label: 'Apps',
  },
};

export const Builtin: StoryObj<typeof meta> = {
  args: {
    apps: typedBuiltInApps,
    icon: 'AppsLine',
    image: 'https://hq.qoretechnologies.com:8092/api/public/apps/Qorus/qorus-logo.svg',
    label: 'Built in modules',
  },
};

export const AppSelected: StoryObj<typeof meta> = {
  ...Basic,
  play: async () => {
    await fireEvent.click(document.querySelectorAll('.reqore-collection-item')[5]);
  },
};

export const DefaultQuery: StoryObj<typeof meta> = {
  args: {
    ...Basic.args,
    defaultQuery: 'get file',
  },
  play: async () => {
    await fireEvent.click(document.querySelectorAll('.reqore-collection-item')[0]);
  },
};

export const Favorites: StoryObj<typeof meta> = {
  args: {
    ...Basic.args,
    favorites: ['Trello', 'YouTube'],
  },
};
