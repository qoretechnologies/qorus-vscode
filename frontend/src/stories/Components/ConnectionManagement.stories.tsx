import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { IApp } from '../../components/AppCatalogue';
import { ConnectionManagement } from '../../components/ConnectionManagement';
import { AppsContext } from '../../context/apps';
import apps from '../Data/apps.json';
import { StoryMeta } from '../types';

const meta = {
  component: ConnectionManagement,
  title: 'Components/Connection Management',
  render: (args) => {
    return (
      <AppsContext.Provider value={apps as IApp[]}>
        <ConnectionManagement {...args} />
      </AppsContext.Provider>
    );
  },
} as StoryMeta<typeof ConnectionManagement>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = {
  args: {
    selectedConnection: 'google-calendar',
  },
};

export const SelectedOAuth2UnAuthorized: Story = {
  name: 'Selected OAuth2 Un-Authorized',
  args: {
    selectedConnection: 'google-calendar',
    allowedValues: [
      {
        value: 'google-calendar',
        metadata: {
          needs_auth: true,
          oauth2_auth_code: true,
        },
      },
    ],
  },
};

export const SelectedOAuth2Authorized: Story = {
  name: 'Selected OAuth2 Authorized',
  args: {
    selectedConnection: 'google-calendar',
    allowedValues: [
      {
        value: 'google-calendar',
        metadata: {
          oauth2_auth_code: true,
        },
      },
    ],
  },
};

export const NewConnection: Story = {
  args: {
    app: 'GoogleCalendar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Create new connection')[0], { timeout: 5000 });

    await fireEvent.click(canvas.getAllByText('Create new connection')[0]);
  },
};

export const NewConnectionWithRequiredOptions: Story = {
  args: {
    app: 'Dynamics',
  },
  play: async ({ canvasElement, ...rest }) => {
    await NewConnection.play({ canvasElement, ...rest });

    await waitFor(
      () => expect(document.querySelectorAll('.reqore-collection-item').length).toBe(4),
      { timeout: 5000 }
    );
  },
};

export const EditingConnection: Story = {
  args: {
    app: 'GoogleCalendar',
    selectedConnection: 'google-calendar',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Edit connection')[0], { timeout: 5000 });

    await fireEvent.click(canvas.getAllByText('Edit connection')[0]);

    await waitFor(
      () => expect(document.querySelectorAll('.reqore-collection-item').length).toBe(3),
      { timeout: 5000 }
    );
  },
};
