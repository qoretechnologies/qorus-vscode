import { StoryObj } from '@storybook/react';
import { FSMVariables } from '../../../containers/InterfaceCreator/fsm/variables';
import { StoryMeta } from '../../types';

const meta = {
  component: FSMVariables,
} as StoryMeta<typeof FSMVariables>;

export default meta;

export const Empty = {};
export const Existing: StoryObj<typeof meta> = {
  args: {
    transient: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
    },
    persistent: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'var',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'var',
        desc: 'Description for my variable',
      },
    },
  },
};

export const New: StoryObj<typeof meta> = {
  args: {
    selectedVariable: {
      name: 'var5',
      variableType: 'transient',
    },
    transient: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var5: {
        type: 'string',
        variableType: 'transient',
        value: undefined,
      },
    },
    persistent: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'var',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'var',
        desc: 'Description for my variable',
      },
    },
  },
};

export const Selected: StoryObj<typeof meta> = {
  args: {
    selectedVariable: {
      name: 'var2',
      variableType: 'var',
    },
    transient: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var3: {
        type: 'bool',
        value: true,
        variableType: 'transient',
        desc: 'Description for my variable',
      },
      var4: {
        type: 'hash',
        value: 'key: value',
        variableType: 'transient',
        desc: 'Description for my variable',
      },
    },
    persistent: {
      var1: {
        type: 'string',
        value: 'This is a test var',
        variableType: 'var',
        desc: 'Description for my variable',
      },
      var2: {
        type: 'number',
        value: 10,
        variableType: 'var',
        desc: 'Description for my variable',
      },
    },
  },
};
