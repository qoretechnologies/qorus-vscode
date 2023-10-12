import { expect } from '@storybook/jest';
import { Meta, StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import { IServiceEventList, ServiceEventListField } from '../../components/Field/serviceEvents';
import serviceEvents from '../Data/serviceEvents.json';
import { SwitchesToBuilder } from '../Tests/FSM/Basic.stories';
import {
  _testsManageVariableFromCatalogue,
  _testsOpenAppCatalogue,
  _testsSelectAppOrAction,
} from '../Tests/utils';

const meta = {
  component: ServiceEventListField,
  title: 'Fields/Service Events',
} as Meta<typeof ServiceEventListField>;

export default meta;

export const Default: StoryObj<typeof meta> = {};
export const Existing: StoryObj<typeof meta> = {
  play: async () => {
    await waitFor(
      () => {
        expect(document.querySelectorAll('.service-event-handler').length).toBe(3);
      },
      { timeout: 5000 }
    );
  },
  args: {
    value: serviceEvents as IServiceEventList,
  },
};
export const EventVariablesInFSM: StoryObj<typeof meta> = {
  play: async (playData) => {
    const canvas = within(playData.canvasElement);

    await waitFor(
      () => {
        expect(document.querySelectorAll('.service-event-handler').length).toBe(3);
      },
      { timeout: 5000 }
    );

    await fireEvent.click(document.querySelectorAll('.select-reference-add-new')[0]);

    // @ts-expect-error
    await SwitchesToBuilder.play(playData);

    await _testsOpenAppCatalogue();
    await _testsSelectAppOrAction(canvas, 'Variables');
    await _testsManageVariableFromCatalogue('event_provider');
  },
  args: {
    value: serviceEvents as IServiceEventList,
  },
};
