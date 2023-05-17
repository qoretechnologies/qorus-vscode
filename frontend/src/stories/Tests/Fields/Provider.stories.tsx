import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor } from '@storybook/testing-library';
import connectors from '../../../components/Field/connectors';
import { ApiCall, Message } from '../../Fields/DataProvider/Provider.stories';
import { sleep } from '../utils';

const meta = {
  component: connectors,
  title: 'Tests/Data Provider',
} as Meta<typeof connectors>;

export default meta;

export const GoStepBack: StoryObj<typeof meta> = {
  args: {
    requiresRequest: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    await ApiCall.play({ canvasElement, ...rest });
    await fireEvent.click(document.querySelector('.provider-go-back'));
    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(3);
      },
      {
        timeout: 10000,
      }
    );
  },
};

export const Reset: StoryObj<typeof meta> = {
  args: {
    isMessage: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    await Message.play({ canvasElement, ...rest });
    await fireEvent.click(document.querySelector('.provider-reset'));
    await waitFor(
      async () => {
        await expect(document.querySelectorAll('.provider-selector').length).toBe(0);
      },
      {
        timeout: 10000,
      }
    );
  },
};

export const CreateFavorite: StoryObj<typeof meta> = {
  args: {
    isMessage: true,
    localOnlyFavorites: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    await Message.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.data-provider-add-favorite'));

    await sleep(200);

    await fireEvent.click(document.querySelector('.data-provider-favorite-submit-details'));

    await waitFor(
      () => expect(document.querySelector('.data-provider-show-favorites')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );

    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
  },
};

export const CreateFavoriteWithDetails: StoryObj<typeof meta> = {
  args: {
    isMessage: true,
    localOnlyFavorites: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    await Message.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.data-provider-add-favorite'));

    await sleep(200);

    await fireEvent.change(document.querySelector('.reqore-modal .reqore-input'), {
      target: {
        value: 'First Favorite',
      },
    });

    await fireEvent.change(document.querySelector('.reqore-modal .reqore-textarea'), {
      target: {
        value: 'This is my first favorite',
      },
    });

    await fireEvent.click(document.querySelector('.data-provider-favorite-submit-details'));

    await waitFor(
      () => expect(document.querySelector('.data-provider-show-favorites')).toBeInTheDocument(),
      {
        timeout: 10000,
      }
    );

    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
  },
};

export const RemoveFromFavorites: StoryObj<typeof meta> = {
  args: {
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
    await fireEvent.click(document.querySelector('.data-provider-add-favorite'));
    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await expect(document.querySelectorAll('.reqore-collection-item').length).toBe(3);
  },
};
