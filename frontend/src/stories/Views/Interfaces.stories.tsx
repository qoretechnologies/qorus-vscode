import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { InterfacesView } from '../../containers/InterfacesView';
import { sleep } from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: InterfacesView,
  title: 'Views/Interfaces',
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof InterfacesView>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('_DraftTestClass'), { timeout: 10000 });
  },
};

export const ChangeTab: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getAllByText('Mapper Code')[0]);

    await waitFor(() => canvas.getAllByText('GlImportClass'), { timeout: 10000 });
  },
};

export const NoInstance: Story = {
  args: {
    qorus_instance: null,
  },
  play: async (args) => {
    await Default.play(args);
  },
};

export const OtherFiles: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getAllByText('Script')[0]);

    await waitFor(() => canvas.getAllByText('BB_ExcelDataProvider'), { timeout: 10000 });
  },
};

export const ShowRemoteDetail: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getAllByText('Connection')[0]);

    await waitFor(() => canvas.getAllByText('bee'), { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('bee')[0]);

    await sleep(1000);
  },
};
