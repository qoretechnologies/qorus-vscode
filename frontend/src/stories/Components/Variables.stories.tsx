import { StoryObj } from '@storybook/react';
import { FSMVariables } from '../../containers/InterfaceCreator/fsm/variables';
import { StoryMeta } from '../types';

const meta = {
  component: FSMVariables,
  title: 'Components/Variables Editor',
} as StoryMeta<typeof FSMVariables>;

export default meta;

export const Empty = {};
export const Existing: StoryObj<typeof meta> = {
  args: {
    global: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'global',
        desc: 'Description for my variable',
      },
    },
    local: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'local',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'local',
        desc: 'Description for my variable',
      },
    },
  },
};

export const New: StoryObj<typeof meta> = {
  args: {
    selectedVariable: {
      name: 'var5',
      variableType: 'global',
    },
    global: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var5: {
        type: 'string',
        variableType: 'global',
        value: undefined,
      },
    },
    local: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'local',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'local',
        desc: 'Description for my variable',
      },
    },
  },
};

export const Selected: StoryObj<typeof meta> = {
  args: {
    selectedVariable: {
      name: 'var2',
      variableType: 'local',
    },
    global: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'global',
        desc: 'Description for my variable',
      },
    },
    local: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'local',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'local',
        desc: 'Description for my variable',
      },
    },
  },
};

export const ReadOnly: StoryObj<typeof meta> = {
  args: {
    selectedVariable: {
      name: 'var2',
      variableType: 'global',
    },
    global: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'data-provider',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/bb_local',
          supports_read: true,
          supports_update: true,
          supports_create: true,
          supports_delete: true,
          supports_messages: 'NONE',
          descriptions: [
            'Data provider for database `pgsql:omquser@omquser`; use the search API with the `sql` and `args` arguments to execute record-based queries',
            'Record-based data provider for db table `public.bb_local`; supports create, read/search, update, delete, upsert, and bulk operations',
          ],
        },
        variableType: 'global',
        desc: 'Description for my variable',
        readOnly: true,
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'global',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'global',
        desc: 'Description for my variable',
      },
    },
    local: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'local',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 20,
        variableType: 'local',
        desc: 'Description for my variable',
      },
    },
  },
};
