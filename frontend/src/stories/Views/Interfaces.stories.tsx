import { expect } from '@storybook/jest';
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
  play: async () => {
    await waitFor(
      () => expect(document.querySelectorAll('.reqore-collection-item')).toHaveLength(15),
      { timeout: 10000 }
    );
  },
};

export const ChangeTab: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(canvas.getAllByText('Mapper Code')[0]);

    await waitFor(() => canvas.getAllByText('GlImportClass'), { timeout: 10000 });

    await expect(document.querySelectorAll('.reqore-collection-item')).toHaveLength(3);
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

export const WithRemotes: Story = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.interfaces-toggle-remotes')!);

    await waitFor(() => canvas.getAllByText('AbstractSalesforceEventStreamer'), { timeout: 10000 });
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

    await WithRemotes.play({ canvasElement, ...rest });

    await sleep(500);

    await fireEvent.click(canvas.getAllByText('BBM_AutoMapperRecordStep')[0]);

    await sleep(1000);
  },
};

export const ZoomedIn: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.interfaces-zoom-in'));
    await fireEvent.click(document.querySelector('.interfaces-zoom-in'));
    await fireEvent.click(document.querySelector('.interfaces-zoom-in'));

    await waitFor(() => expect(canvas.getAllByText('250%')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const ZoomedOut: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Default.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.interfaces-zoom-out'));

    await waitFor(() => expect(canvas.getAllByText('50%')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};
