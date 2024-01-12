import { StoryObj } from '@storybook/react';
import { compose } from 'recompose';
import { CreateInterface } from '../../../containers/InterfaceCreator';
import withFields from '../../../hocomponents/withFields';
import withGlobalOptions from '../../../hocomponents/withGlobalOptions';
import withInitialData from '../../../hocomponents/withInitialData';
import withMapper from '../../../hocomponents/withMapper';
import withMethods from '../../../hocomponents/withMethods';
import withSteps from '../../../hocomponents/withSteps';
import { StoryMeta } from '../../types';

const Creator = compose(
  withFields(),
  withInitialData(),
  withMethods(),
  withSteps(),
  withGlobalOptions(),
  withMapper()
)(CreateInterface);

const meta = {
  component: Creator,
  title: 'Views/Creator/Basic',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof Creator>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Class: Story = {
  args: {
    initialData: { subtab: 'class' },
  },
};

export const Service: Story = {
  args: {
    initialData: { subtab: 'service' },
  },
};

export const Job: Story = {
  args: {
    initialData: { subtab: 'job' },
  },
};

export const Workflow: Story = {
  args: {
    initialData: { subtab: 'workflow' },
  },
};
