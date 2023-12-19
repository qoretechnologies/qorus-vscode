import { StoryObj } from '@storybook/react';
import { useState } from 'react';
import { QodexFields } from '../../containers/InterfaceCreator/fsm/Fields';
import { StoryMeta } from '../types';

const meta = {
  component: QodexFields,
  title: 'Fields/Qodex Fields',
  render: (args) => {
    const [val, setVal] = useState(args.value);

    return (
      <QodexFields
        {...args}
        value={val}
        onChange={(v) => {
          setVal(v);
        }}
      />
    );
  },
} as StoryMeta<typeof QodexFields>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const WithValue: StoryObj<typeof meta> = {
  args: {
    value: {
      name: 'Untitled Qodex',
    },
  },
};
