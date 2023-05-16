import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { IServiceEventList, ServiceEventListField } from '../../components/Field/serviceEvents';
import serviceEvents from '../Data/serviceEvents.json';
import { Event } from '../Fields/DataProvider/Provider.stories';
import { SwitchesToBuilder } from './FSM/Basic.stories';
import {
  _testsSelectItemFromCollection,
  _testsSelectItemFromDropdown,
  _testsSubmitFSMState,
  sleep,
} from './utils';

const meta = {
  component: ServiceEventListField,
  title: 'Tests/Service Events',
  parameters: {
    chromatic: {
      disableSnapshot: true,
    },
  },
} as Meta<typeof ServiceEventListField>;

export default meta;

export const CreateNew: StoryObj<typeof meta> = {
  play: async ({ canvasElement, ...rest }) => {
    const canvas = await within(canvasElement);

    // @ts-expect-error
    await Event.play({ canvasElement, ...rest });

    await sleep(1000);

    await waitFor(
      _testsSelectItemFromCollection(canvas, 'ws-data-event', 'Select from available events')
    );

    await fireEvent.click(document.querySelectorAll('.reqore-checkbox')[1]);

    await waitFor(_testsSelectItemFromDropdown(canvas, 'Test FSM 1'));

    await sleep(1000);

    await waitFor(
      _testsSelectItemFromCollection(canvas, 'ws-pong-event', 'Select from available events')
    );

    await fireEvent.click(document.querySelector('.service-event-add-new'));

    await expect(document.querySelectorAll('.service-event-handler').length).toBe(2);
    await expect(document.querySelectorAll('.service-event').length).toBe(2);
  },
};

export const ModifyExisting: StoryObj<typeof meta> = {
  args: {
    value: serviceEvents as IServiceEventList,
  },
  play: async ({ canvasElement }) => {
    const canvas = await within(canvasElement);

    await waitFor(
      () => {
        expect(document.querySelectorAll('.reqore-checkbox').length).toBe(6);
      },
      { timeout: 5000 }
    );

    await expect(document.querySelectorAll('.service-event-handler').length).toBe(3);

    await fireEvent.click(document.querySelectorAll('.reqore-checkbox')[3]);

    await sleep(2500);

    await _testsSelectItemFromDropdown(canvas, 'Test FSM 1')();

    // Add new event
    await fireEvent.click(document.querySelector('.service-event-add-new'));

    await expect(document.querySelectorAll('.service-event').length).toBe(3);

    // Remove added event
    await fireEvent.click(document.querySelectorAll('.service-event-remove')[2]);

    // Remove existing handler
    await fireEvent.click(document.querySelectorAll('.service-event-handler-remove')[0]);

    await sleep(1000);

    await expect(document.querySelectorAll('.service-event-handler').length).toBe(2);
    await expect(document.querySelectorAll('.service-event').length).toBe(2);
  },
};

export const CreateFSMStateFromEventVariable: StoryObj<typeof meta> = {
  args: {
    value: serviceEvents as IServiceEventList,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = await within(canvasElement);

    await waitFor(
      () => {
        expect(document.querySelectorAll('.service-event-handler').length).toBe(3);
      },
      { timeout: 5000 }
    );

    await fireEvent.click(document.querySelectorAll('.select-reference-add-new')[0]);

    // @ts-expect-error
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await fireEvent.dblClick(document.querySelector(`#var-actionevent_provider`));
    await waitFor(() => expect(document.querySelector('.reqore-drawer')).toBeInTheDocument());
    await expect(document.querySelector('#state-1')).toBeInTheDocument();

    await sleep(1000);

    await _testsSelectItemFromDropdown(
      canvas,
      'send-message',
      undefined,
      '.fsm-action-type-selector'
    )();

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

    //Submit the state
    await waitFor(_testsSubmitFSMState(), { timeout: 10000 });
    await waitFor(() => canvas.findByText('send-message'), { timeout: 10000 });
  },
};
