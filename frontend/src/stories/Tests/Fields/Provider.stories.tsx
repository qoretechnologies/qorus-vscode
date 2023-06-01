import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import connectors from '../../../components/Field/connectors';
import { ApiCall, Message, Type } from '../../Fields/DataProvider/Provider.stories';
import { sleep } from '../utils';

const meta = {
  component: connectors,
  title: 'Tests/Fields/Data Provider',
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

    await fireEvent.change(document.querySelector('.reqore-modal .reqore-input'), {
      target: {
        value: 'Test',
      },
    });

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

export const AddAndRemoveFromFavorites: StoryObj<typeof meta> = {
  args: {
    isMessage: true,
    localOnlyFavorites: true,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await CreateFavorite.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await expect(document.querySelectorAll('.data-provider-favorite').length).toBe(1);

    await fireEvent.click(document.querySelector('.data-provider-favorite-delete'));

    // Confirm the action
    await fireEvent.click(canvas.getAllByText('Confirm')[0]);
    await expect(document.querySelectorAll('.data-provider-favorite').length).toBe(0);
  },
};

export const ReplaceWithExistingFavorite: StoryObj<typeof meta> = {
  args: {
    localOnlyFavorites: true,
    favorites: {
      FSEventAction: {
        name: 'FSEventAction',
        desc: 'This is my first favorite',
        value: {
          type: 'type',
          name: 'qore',
          path: '/date',
          descriptions: ['Qore types', 'Date type format'],
        },
      },
    },
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await Type.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.data-provider-show-favorites'));
    await fireEvent.click(document.querySelector('.data-provider-favorite-apply'));

    expect(canvas.getAllByText('date')[0]).toBeInTheDocument();
  },
};
