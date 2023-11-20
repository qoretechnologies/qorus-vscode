import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { IApp } from '../../components/AppCatalogue';
import { QodexActionExec } from '../../containers/InterfaceCreator/fsm/ActionExec';
import { AppsContext } from '../../context/apps';
import apps from '../Data/apps.json';
import { StoryMeta } from '../types';

const meta = {
  component: QodexActionExec,
  title: 'Views/FSM/Action execution',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
  render: (args) => {
    return (
      <AppsContext.Provider value={apps as IApp[]}>
        <QodexActionExec {...args} />
      </AppsContext.Provider>
    );
  },
} as StoryMeta<typeof QodexActionExec>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Event: Story = {
  args: {
    appName: 'Discord',
    actionName: 'watch-guild-messages',
  },
};

export const EventFilled: Story = {
  args: {
    appName: 'Discord',
    actionName: 'watch-guild-messages',
    options: {
      qorus_app_connection: {
        type: 'string',
        value: 'discord',
      },
      guild: {
        type: 'string',
        value: 'Qore Technologies',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Working...')[0], {
      timeout: 10000,
    });

    await waitFor(() => canvas.getAllByText('"example string"')[0], {
      timeout: 10000,
    });
  },
};

export const Action: Story = {
  args: {
    appName: 'Discord',
    actionName: 'user-info',
  },
};

export const ActionFilled: Story = {
  args: {
    appName: 'Discord',
    actionName: 'user-info',
    options: {
      qorus_app_connection: {
        type: 'string',
        value: 'discord',
      },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => expect(document.querySelectorAll('.reqore-button')[0]).toBeEnabled(), {
      timeout: 10000,
    });

    await fireEvent.click(document.querySelectorAll('.reqore-button')[0]);

    await waitFor(() => canvas.getAllByText('Working...')[0], {
      timeout: 10000,
    });

    await waitFor(() => canvas.getAllByText('"foxhoundn"')[0], {
      timeout: 10000,
    });
  },
};
