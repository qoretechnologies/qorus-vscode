import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import { AppCatalogue, IApp } from '../../components/AppCatalogue';
import { buildAppFromActionSets } from '../../hooks/useActionSets';
import apps from '../Data/apps.json';
import builtInApps from '../Data/builtInApps.json';
import { StoryMeta } from '../types';

const typedApps: IApp[] = apps as IApp[];
const typedBuiltInApps: IApp[] = builtInApps as IApp[];
const typedAppsWithActionSets: IApp[] = apps as IApp[];
const actionSetsApp = buildAppFromActionSets([
  {
    id: '1',
    options: {
      name: {
        type: 'string',
        value: 'Another test',
      },
      shortDescription: {
        type: 'string',
        value: 'This is a second action set',
      },
    },
    states: {
      "1": {
        "position": {
          "x": 47,
          "y": 42
        },
        "initial": true,
        "name": "Save Intent Info",
        "display_name": "Qorus Built-In Action",
        "desc": "",
        "type": "state",
        "id": "djsGWd6mm",
        "action": {
          "type": "connector",
          "value": {
            "class": "BBM_OutputData",
            "connector": "writeOutputData"
          }
        },
        "execution_order": 1,
        "transitions": [
          {
            "state": "2",
            "language": "qore"
          }
        ],
      },
      '2': {
        position: {
          x: 49.99999999999999,
          y: 528.3333333333333,
        },
        initial: false,
        name: 'Send Discord Message',
        display_name: 'Send Discord Message',
        desc: 'Send a message to a Discord channel',
        type: 'state',
        id: '1qSA-sVVn',
        action: {
          type: 'appaction',
          value: {
            app: 'Discord',
            action: 'send-message',
            options: {
              qorus_app_connection: {
                type: 'connection',
                value: 'discord',
              },
              guild: {
                type: 'string',
                value: 'Qore Technologies',
              },
              channel: {
                type: 'string',
                value: 'api',
              },
              content: {
                type: 'string',
                value: 'This Qodex was ran at $data:{1.trigger_time} by $data:{3.discriminator}',
              },
            },
          },
        },
        transitions: [],
      },
      '3': {
        position: {
          x: 50,
          y: 300,
        },
        initial: false,
        is_event_trigger: false,
        name: 'Get User Info',
        display_name: 'Get User Info',
        desc: 'Get info about the current user',
        type: 'state',
        id: 'ZO2l-u06b',
        action: {
          type: 'appaction',
          value: {
            app: 'Discord',
            action: 'user-info',
            options: {
              qorus_app_connection: {
                type: 'connection',
                value: 'discord',
              },
            },
          },
        },
        transitions: [
          {
            state: '2',
            language: 'qore',
          },
          {
            state: '4',
          },
        ],
      },
    },
  },
  {
    id: '2',
    options: {
      name: {
        type: 'string',
        value: 'test',
      },
      shortDescription: {
        type: 'string',
        value: 'test',
      },
    },
    states: {
      '2': {
        position: {
          x: 49.99999999999999,
          y: 528.3333333333333,
        },
        initial: false,
        name: 'Send Discord Message',
        display_name: 'Send Discord Message',
        desc: 'Send a message to a Discord channel',
        type: 'state',
        id: '1qSA-sVVn',
        action: {
          type: 'appaction',
          value: {
            app: 'Discord',
            action: 'send-message',
            options: {
              qorus_app_connection: {
                type: 'connection',
                value: 'discord',
              },
              guild: {
                type: 'string',
                value: 'Qore Technologies',
              },
              channel: {
                type: 'string',
                value: 'api',
              },
              content: {
                type: 'string',
                value: 'This Qodex was ran at $data:{1.trigger_time} by $data:{3.discriminator}',
              },
            },
          },
        },
        transitions: [],
      },
      '3': {
        position: {
          x: 50,
          y: 300,
        },
        initial: false,
        is_event_trigger: false,
        name: 'Get User Info',
        display_name: 'Get User Info',
        desc: 'Get info about the current user',
        type: 'state',
        id: 'ZO2l-u06b',
        action: {
          type: 'appaction',
          value: {
            app: 'Discord',
            action: 'user-info',
            options: {
              qorus_app_connection: {
                type: 'connection',
                value: 'discord',
              },
            },
          },
        },
        transitions: [
          {
            state: '2',
            language: 'qore',
          },
          {
            state: '4',
          },
        ],
      },
    },
  },
]);

typedAppsWithActionSets.push(actionSetsApp);

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

export const WithActionSets: StoryObj<typeof meta> = {
  args: {
    apps: typedAppsWithActionSets,
  },
  play: async (args) => {
    await DefaultQuery.play(args);
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
