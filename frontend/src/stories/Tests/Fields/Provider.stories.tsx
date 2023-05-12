import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor } from '@storybook/testing-library';
import connectors from '../../../components/Field/connectors';
import { ApiCall, Message } from '../../Fields/DataProvider/Provider.stories';

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
