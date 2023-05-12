import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import connectors from '../../../components/Field/connectors';
import { sleep } from '../../Tests/utils';

const meta = {
  component: connectors,
  title: 'Fields/DataProvider/Provider',
} as Meta<typeof connectors>;

export default meta;

export const Basic: StoryObj<typeof meta> = {};
export const Event: StoryObj<typeof meta> = {
  args: {
    isEvent: true,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(() => expect(document.querySelector('.provider-selector')).toBeInTheDocument(), {
      timeout: 10000,
    });

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('wsclient')[0]);

    await waitFor(() => expect(document.querySelector('.system-option')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await fireEvent.change(document.querySelector('.system-option textarea'), {
      target: {
        value: 'wss://sandbox:sandbox@sandbox.qoretechnologies.com/apievents',
      },
    });

    await waitFor(
      async () => {
        await canvas.findAllByText(/Apply options/);
        await fireEvent.click(canvas.getAllByText(/Apply options/)[0]);
      },
      { timeout: 10000 }
    );

    await sleep(1000);
  },
};

export const Message: StoryObj<typeof meta> = {
  args: {
    isMessage: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = await within(canvasElement);

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(() => expect(document.querySelector('.provider-selector')).toBeInTheDocument(), {
      timeout: 10000,
    });

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('wsclient')[0]);

    await waitFor(() => expect(document.querySelector('.system-option')).toBeInTheDocument(), {
      timeout: 10000,
    });
    await fireEvent.change(document.querySelector('.system-option textarea'), {
      target: {
        value: 'wss://sandbox:sandbox@sandbox.qoretechnologies.com/apievents',
      },
    });

    await waitFor(
      async () => {
        await canvas.findAllByText(/Apply options/);
        await fireEvent.click(canvas.getAllByText(/Apply options/)[0]);
      },
      { timeout: 10000 }
    );

    await waitFor(
      async () => {
        await expect(document.querySelector('.provider-message-selector')).toBeInTheDocument();
        await fireEvent.click(document.querySelector('.provider-message-selector'));
      },
      { timeout: 10000 }
    );

    // Select the message type
    await waitFor(
      async () => {
        await canvas.findByText(/Select from items/g);
        await fireEvent.click(canvas.getByText('raw'));
      },
      { timeout: 10000 }
    );

    await waitFor(
      async () => {
        await expect(document.querySelector('.provider-message-data textarea')).toBeInTheDocument();
        await fireEvent.change(document.querySelector('.provider-message-data textarea'), {
          target: { value: 'Hello World' },
        });
      },
      { timeout: 10000 }
    );
  },
};

export const ApiCall: StoryObj<typeof meta> = {
  args: {
    requiresRequest: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = await within(canvasElement);

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(1), {
      timeout: 10000,
    });

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('qorus-api')[0]);

    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(2), {
      timeout: 10000,
    });

    await sleep(500);

    await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
    await fireEvent.click(canvas.getAllByText('util')[0]);

    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(3), {
      timeout: 10000,
    });

    await sleep(500);

    await fireEvent.click(document.querySelectorAll('.provider-selector')[2]);
    await fireEvent.click(canvas.getAllByText('log-message')[0]);

    await sleep(1500);

    await fireEvent.click(document.querySelector('.reqore-checkbox'));
    await waitFor(
      () =>
        fireEvent.change(document.querySelector('.system-option textarea'), {
          target: {
            value: 'logging some stuff',
          },
        }),
      { timeout: 10000 }
    );
  },
};

export const ExistingData: StoryObj<typeof meta> = {
  args: {
    value: {
      type: 'type',
      name: 'qore',
      path: '/fsevents/event/name',
      descriptions: ['Qore API', 'File System Events', 'Event', 'Event name'],
    },
  },
};
