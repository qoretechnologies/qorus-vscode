import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import connectors from '../../../components/Field/connectors';
import {
  _testsSelectItemFromCollection,
  _testsSelectItemFromDropdown,
  sleep,
} from '../../Tests/utils';

const meta = {
  component: connectors,
  title: 'Fields/DataProvider/Provider',
} as Meta<typeof connectors>;

export default meta;

export const Basic: StoryObj<typeof meta> = {};
export const Type: StoryObj<typeof meta> = {
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);

    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('type'));

    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(1), {
      timeout: 10000,
    });
    await _testsSelectItemFromDropdown(canvas, 'qore')();
    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(2), {
      timeout: 10000,
    });
    await _testsSelectItemFromCollection(canvas, 'fsevents')();
    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(3), {
      timeout: 10000,
    });
    await _testsSelectItemFromCollection(canvas, 'event')();
    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(4), {
      timeout: 10000,
    });
    await _testsSelectItemFromCollection(canvas, 'action')();
    await sleep(1000);
  },
};

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

    await sleep(1500);

    await fireEvent.click(document.querySelectorAll('.provider-selector')[1]);
    await fireEvent.click(canvas.getAllByText('util')[0]);

    await waitFor(() => expect(document.querySelectorAll('.provider-selector').length).toBe(3), {
      timeout: 10000,
    });

    await sleep(1500);

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

export const ExistingFavorites: StoryObj<typeof meta> = {
  args: {
    favorites: {
      test: {
        id: 'test',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/bb_local',
          supports_request: false,
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
      },
    },
  },
  play: async () => {
    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(1);
  },
};

export const SelectedFavorite: StoryObj<typeof meta> = {
  args: {
    favorites: {
      test: {
        id: 'test',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/bb_local',
          supports_request: false,
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
      },
    },
  },
  play: async () => {
    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(1);
    await fireEvent.click(document.querySelector('.data-provider-favorite-apply'));
  },
};

export const MultipleFavorites: StoryObj<typeof meta> = {
  args: {
    favorites: {
      test: {
        id: 'test',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/bb_local',
          supports_request: false,
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
      },
      test1: {
        id: 'test1',
        name: 'External GL Journal',
        desc: 'Data provider for database `pgsql:omquser@omquser`; use the search API with the `sql` and `args` arguments to execute record-based queries',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/external_gl_journal',
          supports_request: false,
          supports_read: true,
          supports_update: true,
          supports_create: true,
          supports_delete: true,
          supports_messages: 'NONE',
          descriptions: [
            'Data provider for database `pgsql:omquser@omquser`; use the search API with the `sql` and `args` arguments to execute record-based queries',
            'Record-based data provider for db table `public.external_gl_journal`; supports create, read/search, update, delete, upsert, and bulk operations',
          ],
        },
      },
      test2: {
        id: 'test2',
        name: 'OMQUser',
        desc: 'Just the datasource',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          supports_request: false,
          supports_read: true,
          supports_update: true,
          supports_create: true,
          supports_delete: true,
          supports_messages: 'NONE',
          descriptions: [
            'Data provider for database `pgsql:omquser@omquser`; use the search API with the `sql` and `args` arguments to execute record-based queries',
          ],
        },
      },
      test3: {
        id: 'test3',
        desc: 'Order items without name',
        value: {
          type: 'datasource',
          name: 'omquser',
          transaction_management: true,
          record_requires_search_options: false,
          path: '/order_items',
          supports_request: false,
          supports_read: true,
          supports_update: true,
          supports_create: true,
          supports_delete: true,
          supports_messages: 'NONE',
          descriptions: [
            'Data provider for database `pgsql:omquser@omquser`; use the search API with the `sql` and `args` arguments to execute record-based queries',
            'Record-based data provider for db table `public.order_items`; supports create, read/search, update, delete, upsert, and bulk operations',
          ],
        },
      },
    },
  },
  play: async () => {
    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(4);
  },
};
