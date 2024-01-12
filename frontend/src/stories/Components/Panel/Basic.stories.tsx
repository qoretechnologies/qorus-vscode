import { StoryObj } from '@storybook/react';
import { compose } from 'recompose';
import Panel from '../../../containers/InterfaceCreator/panel';
import withFields from '../../../hocomponents/withFields';
import withGlobalOptions from '../../../hocomponents/withGlobalOptions';
import withInitialData from '../../../hocomponents/withInitialData';
import withMapper from '../../../hocomponents/withMapper';
import withMethods from '../../../hocomponents/withMethods';
import withSteps from '../../../hocomponents/withSteps';
import { StoryMeta } from '../../types';

const PanelWithHoC = compose(
  withFields(),
  withInitialData(),
  withMethods(),
  withSteps(),
  withGlobalOptions(),
  withMapper()
)(Panel);

const meta = {
  component: PanelWithHoC,
  title: 'Components/Panel',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof Panel>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Class: Story = {
  args: {
    type: 'class',
  },
};

export const Job: Story = {
  args: {
    type: 'job',
  },
};

export const Service: Story = {
  args: {
    type: 'service',
  },
};

export const Mapper: Story = {
  args: {
    type: 'mapper',
  },
};
