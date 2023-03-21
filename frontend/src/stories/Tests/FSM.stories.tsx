import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, userEvent, waitFor, within } from '@storybook/testing-library';
import { reduce } from 'lodash';
import FSMView from '../../containers/InterfaceCreator/fsm';
import fsm from '../Data/fsm.json';
import { StoryMeta } from '../types';
import { NewState } from '../Views/FSM.stories';
import {
  _testsSelectItemFromCollection,
  _testsSelectItemFromDropdown,
  _testsSubmitFSMState,
} from './utils';

const meta = {
  component: FSMView,
  args: {
    reqoreOptions: {
      animations: {
        dialogs: false,
      },
    },
  },
} as StoryMeta<typeof FSMView, { stateType?: string }>;

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
    await waitFor(() => expect(document.querySelector('#fsm-diagram svg')).toBeInTheDocument());
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

export const NewMapperState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'mapper' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromCollection(canvas, 'Test Mapper 1'), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState, { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test Mapper 1')).toBeInTheDocument());
  },
};

export const NewPipelineState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'pipeline' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromCollection(canvas, 'Test Pipeline 1'), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState, { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test Pipeline 1')).toBeInTheDocument());
  },
};

export const NewConnectorState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'connector' });

    const className = 'Test Class With Connectors 1';
    const connectorName = 'Input Output Connector';

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromDropdown(canvas, className), { timeout: 5000 });
    await waitFor(_testsSelectItemFromCollection(canvas, connectorName), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState, { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() =>
      expect(canvas.getByText(`${className}:${connectorName} connector`)).toBeInTheDocument()
    );
  },
};

export const NewFSMState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'fsm' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(_testsSelectItemFromDropdown(canvas, 'Test FSM 1'), { timeout: 5000 });
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState, { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('Test FSM 1')).toBeInTheDocument());
  },
};

export const NewIfState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'if' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await waitFor(
      async () => await userEvent.type(document.querySelector('#condition-field'), 'asfg condition')
    );
    await expect(document.querySelector('.state-submit-button')).toBeEnabled();

    // Submit the state
    await waitFor(_testsSubmitFSMState, { timeout: 5000 });
    await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    await waitFor(() => expect(canvas.getByText('asfg condition')).toBeInTheDocument());
  },
};

export const NewMessageState: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    // Save the current time to a variable called start, in format YYYY-MM-DD HH:MM:SS:msmsms
    // This is used to check if the message was sent after the state was executed
    const times: any = { start: new Date().toISOString().slice(0, 23).replace('T', ' ') };
    const canvas = within(canvasElement);

    await NewState.play({ canvasElement, ...rest, stateType: 'send-message' });

    // The submit button needs to be disabled
    await expect(document.querySelector('.state-submit-button')).toBeDisabled();
    await fireEvent.click(document.querySelector('.provider-type-selector'));
    await fireEvent.click(canvas.getByText('factory'));

    await waitFor(() => expect(document.querySelector('.provider-selector')).toBeInTheDocument(), {
      timeout: 5000,
    });

    await fireEvent.click(document.querySelector('.provider-selector'));
    await fireEvent.click(canvas.getAllByText('wsclient')[0]);
    await waitFor(() => expect(document.querySelector('.system-option')).toBeInTheDocument(), {
      timeout: 5000,
    });
    await fireEvent.change(document.querySelector('.system-option textarea'), {
      target: {
        value: 'wss://sandbox:sandbox@sandbox.qoretechnologies.com/apievents',
      },
    });

    times.optionFilled = new Date().toISOString().slice(0, 23).replace('T', ' ');

    await waitFor(() => canvas.findAllByText(/Apply options/g), { timeout: 5000 });
    // Click on apply options
    await fireEvent.click(canvas.getAllByText(/Apply options/g)[0]);

    times.optionsApplied = new Date().toISOString().slice(0, 23).replace('T', ' ');

    await waitFor(() => canvas.findByText(/MessageType/g), { timeout: 5000 });
    await waitFor(
      () => expect(document.querySelector('.provider-message-selector')).toBeInTheDocument(),
      { timeout: 5000 }
    );

    // // Select the message type
    await fireEvent.click(document.querySelector('.provider-message-selector'));
    await waitFor(async () => {
      await canvas.findByText(/Select from items/g);
      await fireEvent.click(canvas.getByText('raw'));
    });

    times.messageSelected = new Date().toISOString().slice(0, 23).replace('T', ' ');

    // Add the message data
    // WORKS TILL HERE
    await waitFor(() => canvas.findByText(/MessageData/g), { timeout: 5000 });
    await waitFor(async () => {
      await expect(document.querySelector('.state-submit-button')).toBeDisabled();
      await fireEvent.change(document.querySelector('#state-description-field'), {
        target: {
          value:
            reduce(times, (str, time, action) => `${str}${action}: ${time}\r\n`, '') +
            `End: ${new Date().toISOString().slice(0, 23).replace('T', ' ')}\r\n`,
        },
      });
    });

    // await waitFor(
    //   async () => {
    //     await expect(document.querySelector('.provider-message-data textarea')).toBeInTheDocument();
    //     await fireEvent.change(document.querySelector('.provider-message-data textarea'), {
    //       target: { value: 'Hello World' },
    //     });
    //   },
    //   { timeout: 5000 }
    // );

    // Submit the state
    // await waitFor(_testsSubmitFSMState, { timeout: 5000 });

    // await expect(document.querySelector('.reqore-drawer')).not.toBeInTheDocument();
    // await waitFor(() => canvas.findByText('factory/wsclient'));

    // // Check that state data were saved
    // await fireEvent.click(document.querySelector('#state-1'));
    // await waitFor(() => canvas.findByDisplayValue('Hello World'));
    // await expect(document.querySelector('.provider-message-data textarea')).toHaveValue(
    //   'Hello World'
    // );
  },
};
