import { expect } from '@storybook/jest';
import { StoryObj } from '@storybook/react';
import { fireEvent, waitFor, within } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import fsm from '../../Data/fsm.json';
import { NewState } from '../../Views/FSM.stories';
import { StoryMeta } from '../../types';
import { _testsClickState, _testsCreateSelectionBox, sleep } from './../utils';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Basic',
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

    await waitFor(async () => {
      await fireEvent.click(canvas.getAllByText('Go to flow builder')[0]);
      await expect(document.querySelector('#fsm-diagram svg')).toBeInTheDocument();
    });
  },
};

export const ShowsStateIds: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    const canvas = within(canvasElement);

    await sleep(1000);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
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

    await waitFor(
      async () => {
        await expect(document.querySelectorAll('#fsm-diagram .reqore-panel').length).toBe(9);
        await sleep(1000);
        await fireEvent.click(document.querySelectorAll('#auto-align-states')[0]);
      },
      { timeout: 5000 }
    );
  },
};

export const SelectedStateChange: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await _testsClickState('state-3');

    await sleep(1000);

    await waitFor(
      async () => {
        await expect(document.querySelector('.reqore-drawer')).toBeInTheDocument();
        await expect(document.querySelector('.reqore-drawer h3').textContent).toBe(
          'Intent: Close Ticket?'
        );
      },
      { timeout: 10000 }
    );

    await sleep(500);

    await _testsClickState('state-1');

    await sleep(500);

    await waitFor(
      async () => {
        // Make sure the h3 with text `Intent: Close Ticket?` inside .reqore-drawer is visible
        await expect(document.querySelector('.reqore-drawer h3').textContent).toBe(
          'Save Intent Info'
        );
      },
      { timeout: 10000 }
    );
  },
};

export const StateIsDeleted: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    await sleep(1500);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(8);
    await expect(document.querySelectorAll('.fsm-transition').length).toBe(7);

    await fireEvent.click(document.querySelectorAll('#state-3 .reqore-button')[2]);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(7);
    await expect(document.querySelectorAll('.fsm-transition').length).toBe(4);
  },
};

export const StatesCanBeConnected: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await StateIsDeleted.play({ canvasElement, ...rest });

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-transition').length).toBe(4);

    // Fake double click lol
    await _testsClickState('state-1');
    await _testsClickState('state-1');

    await sleep(2000);

    await _testsClickState('state-6');

    await sleep(2000);

    await waitFor(() => expect(document.querySelectorAll('.fsm-transition').length).toBe(5), {
      timeout: 10000,
    });
  },
};

export const StatesCanBeSelected: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });
    await sleep(500);
    await _testsCreateSelectionBox(300, 100, 800, 800, true);
  },
};

export const StatesIsNotRemovedOnCancel: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await expect(document.querySelectorAll('.fsm-state').length).toBe(8);

    await _testsClickState('state-1');

    await sleep(1000);

    await fireEvent.click(document.querySelector('.fsm-state-dialog-cancel'));

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(8);
  },
};

export const StatesIsRemovedIfUnfinished: StoryFSM = {
  play: async ({ canvasElement, ...rest }) => {
    await NewState.play({ canvasElement, ...rest });

    await expect(document.querySelectorAll('.fsm-state').length).toBe(1);

    await fireEvent.click(document.querySelector('.fsm-state-dialog-cancel'));

    await sleep(200);

    await expect(document.querySelectorAll('.fsm-state').length).toBe(0);
  },
};

export const ZoomIn: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await expect(document.querySelectorAll('.fsm-state').length).toBe(8);

    await sleep(1000);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-in'));
    await sleep(100);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-in'));
    await sleep(100);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-in'));

    await sleep(100);
    await fireEvent.wheel(document.querySelector('#fsm-diagram'), { deltaY: -1 });
    await sleep(100);
    await fireEvent.wheel(document.querySelector('#fsm-diagram'), { deltaY: -1 });
    await sleep(100);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await expect(canvas.getAllByText('150% [Reset]')[0]).toBeInTheDocument();
  },
};

export const ZoomOut: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await SwitchesToBuilder.play({ canvasElement, ...rest });

    await expect(document.querySelectorAll('.fsm-state').length).toBe(8);

    await sleep(1000);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-out'));
    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-out'));
    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-zoom-out'));
    await sleep(100);
    await fireEvent.wheel(document.querySelector('#fsm-diagram'), { deltaY: 1 });
    await sleep(100);
    await fireEvent.wheel(document.querySelector('#fsm-diagram'), { deltaY: 1 });
    await sleep(100);

    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await expect(canvas.getAllByText('50% [Reset]')[0]).toBeInTheDocument();
  },
};

export const ZoomReset: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, ...rest }) => {
    const canvas = within(canvasElement);
    await ZoomOut.play({ canvasElement, ...rest });

    await fireEvent.click(document.querySelector('.fsm-zoom-reset'));
    await sleep(100);
    await fireEvent.click(document.querySelector('.fsm-more-actions'));
    await sleep(100);
    await expect(canvas.getAllByText('100% [Reset]')[0]).toBeInTheDocument();
  },
};
