import { StoryObj } from '@storybook/react';
import { ConnectionManagement } from '../../components/ConnectionManagement';
import { StoryMeta } from '../types';

const meta = {
  component: ConnectionManagement,
  title: 'Components/Connection Management',
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
