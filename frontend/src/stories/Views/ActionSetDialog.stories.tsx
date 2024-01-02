import { StoryObj } from '@storybook/react';
import { ActionSetDialog } from '../../containers/InterfaceCreator/fsm/ActionSetDialog';
import { AppsContext } from '../../context/apps';
import apps from '../Data/apps.json';
import { StoryMeta } from '../types';

const meta = {
  component: ActionSetDialog,
  title: 'Views/FSM/Action Set Dialog',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
  render: (args) => {
    return (
      // @ts-ignore
      <AppsContext.Provider value={{ apps }}>
        <ActionSetDialog {...args} />
      </AppsContext.Provider>
    );
  },
} as StoryMeta<typeof ActionSetDialog>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Filled: Story = {
  args: {
    name: 'My Action Set',
    shortDescription: 'My Action Set Description',
    withOptions: true,
  },
};
