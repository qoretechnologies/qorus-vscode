import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';

const meta = {
  component: FSMView,
} as Meta<typeof FSMView>;

export default meta;

type StoryFSM = StoryObj<typeof meta>;
export const SwitchesToBuilder: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Go to flow builder')[0]);
    await fireEvent.click(canvas.getAllByText('Go to flow builder')[0]);

    // Wait for some time to allow the canvas to render
    await new Promise((resolve) => setTimeout(resolve, 500));
  },
};

export const ShowsStateIds: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await fireEvent.click(document.querySelector('#show-state-ids'));

    await expect(canvas.getAllByText('[1] Save Intent Info')[0]).toBeInTheDocument();
  },
};

export const AutoAlign: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await waitFor(() => canvas.getAllByText('Auto align states')[0]);
    await fireEvent.click(canvas.getAllByText('Auto align states')[0]);

    await expect(true).toBe(true);
  },
};

export const AddsNewState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await waitFor(() => document.querySelector('#send-message'));
    await fireEvent.dblClick(document.querySelector('#send-message'));
    await waitFor(() => document.querySelector('#state-1'));
    await expect(document.querySelector('#state-1')).toBeInTheDocument();
    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();
  },
};

export const SelectedStateChange: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await waitFor(() => document.querySelector('#state-3'));
    await fireEvent.click(document.querySelector('#state-3'));

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();

    await fireEvent.click(document.querySelector('#state-1'));

    await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();
  },
};

export const NewMessageState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await AddsNewState.play({ canvasElement, ...rest });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
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
    await waitFor(() => canvas.findAllByText(/Apply options/g), { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Click on apply options
    await fireEvent.click(canvas.getAllByText(/Apply options/g)[0]);

    await waitFor(() => canvas.findByText(/MessageType/g), { timeout: 10000 });
    await waitFor(
      () => expect(document.querySelector('.provider-message-selector')).toBeInTheDocument(),
      { timeout: 10000 }
    );

    // Select the message type
    await fireEvent.click(document.querySelector('.provider-message-selector'));
    await waitFor(() => canvas.findByText(/Select from items/g), { timeout: 10000 });
    await fireEvent.click(canvas.getAllByText(/raw/g)[0]);

    // Add the message data
    await waitFor(() => canvas.findByText(/MessageData/g), { timeout: 10000 });
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await userEvent.type(document.querySelector('.provider-message-data textarea'), 'Hello World');
    await new Promise((resolve) => setTimeout(resolve, 500));
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await fireEvent.click(document.querySelector('.state-submit-button'));
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => canvas.findByText('factory/wsclient'));

    // Check that state data were saved
    await fireEvent.click(document.querySelector('#state-1'));
    await waitFor(() => canvas.findByDisplayValue('Hello World'));
    await expect(document.querySelector('.provider-message-data textarea')).toHaveValue(
      'Hello World'
    );
  },
};
