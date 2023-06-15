import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import ConfigItemManager from '../../containers/ConfigItemManager';
import { sleep } from '../Tests/utils';
import { StoryMeta } from '../types';

const meta = {
  component: ConfigItemManager,
  title: 'Components/Config Items',
} as StoryMeta<typeof ConfigItemManager>;

export default meta;

export const Grouped: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });
  },
};
export const Ungrouped: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('Ungroup items')[0]);

    await waitFor(() => expect(canvas.getAllByText('Group items')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};
export const Workflow: StoryObj<typeof meta> = {
  args: {
    type: 'workflow',
    interfaceId: 'test',
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Workflow Item 2'), { timeout: 10000 });
  },
};

export const ItemView: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(canvas.getByText('Another Item'));

    await waitFor(() => expect(canvas.getByText('Editing Another Item')).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const NewValueView: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(canvas.getAllByText('button.add-new-value')[0]);

    await waitFor(() => expect(canvas.getByText('AssignNewConfig')).toBeInTheDocument(), {
      timeout: 10000,
    });

    await sleep(1000);

    await fireEvent.click(canvas.getAllByText('PleaseSelect')[0]);
  },
};

export const ZoomedIn: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(document.querySelector('.config-items-zoom-in'));
    await fireEvent.click(document.querySelector('.config-items-zoom-in'));
    await fireEvent.click(document.querySelector('.config-items-zoom-in'));

    await waitFor(() => expect(canvas.getAllByText('250%')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const ZoomedOut: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(document.querySelector('.config-items-zoom-out'));

    await waitFor(() => expect(canvas.getAllByText('50%')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};

export const SetItemsPerPage: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await Ungrouped.play({ canvasElement, ...rest });

    await waitFor(async () => await canvas.getAllByText('Items per page')[0], {
      timeout: 10000,
    });

    await sleep(100);

    await fireEvent.click(canvas.getAllByText('Items per page')[0]);
    await waitFor(async () => await canvas.getAllByText('10 items')[1], { timeout: 10000 });
    await fireEvent.click(canvas.getAllByText('10 items')[1]);
  },
};

export const FiltersOpened: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getByText('Another Item'), { timeout: 10000 });

    await fireEvent.click(document.querySelector('.config-items-filters'));

    await waitFor(() => expect(canvas.getAllByText('View items')[0]).toBeInTheDocument(), {
      timeout: 10000,
    });
  },
};
