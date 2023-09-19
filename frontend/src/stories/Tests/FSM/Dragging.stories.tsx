import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import fsm from '../../Data/fsm.json';
import { StoryMeta } from '../../types';
import { _testsCreateSelectionBox, _testsSelectState, sleep } from '../utils';
import { AutoAlign, SwitchesToBuilder, ZoomIn, ZoomOut } from './Basic.stories';

const meta = {
  component: FSMView,
  title: 'Tests/FSM/Drag and drop',
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

export const StateCanBeDraggedAndDropped: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, zoomIn, zoomOut, ...rest }) => {
    const coeficient = zoomIn ? 1.5 : zoomOut ? 0.7 : 1;
    if (zoomIn) {
      await ZoomIn.play({ canvasElement, ...rest });
    } else if (zoomOut) {
      await ZoomOut.play({ canvasElement, ...rest });
    } else {
      await SwitchesToBuilder.play({ canvasElement, ...rest });
    }

    await fireEvent.mouseDown(document.querySelector('#state-2'));

    await sleep(500);

    await fireEvent.mouseMove(document.querySelector('#state-2'), {
      movementX: 500 * coeficient,
      movementY: 50 * coeficient,
    });

    await fireEvent.mouseUp(document.querySelector('#state-2'));

    await sleep(500);

    await fireEvent.mouseDown(document.querySelector('#state-7'));

    await sleep(500);

    await fireEvent.mouseMove(document.querySelector('#state-7'), {
      movementY: 400 * coeficient,
      movementX: 50 * coeficient,
    });

    await fireEvent.mouseUp(document.querySelector('#state-2'));
  },
};

export const StateCanBeDraggedAndDroppedWithZoomIn: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, zoomIn, zoomOut, ...rest }) => {
    await StateCanBeDraggedAndDropped.play({ canvasElement, zoomIn: true, ...rest });
  },
};

export const StateCanBeDraggedAndDroppedWithZoomOut: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, zoomIn, zoomOut, ...rest }) => {
    await StateCanBeDraggedAndDropped.play({ canvasElement, zoomOut: true, ...rest });
  },
};

export const MultipleStatesCanBeDraggedAndDropped: StoryFSM = {
  args: {
    fsm,
  },
  play: async ({ canvasElement, zoomIn, zoomOut, ...rest }) => {
    await AutoAlign.play({ canvasElement, ...rest });

    // Select some states
    await _testsSelectState('state-3');

    await sleep(500);

    await _testsCreateSelectionBox(600, 300, 600, 600, true);

    await sleep(500);

    await fireEvent.mouseDown(document.querySelector('#state-3'));

    await sleep(500);

    for await (const _ of Array(Math.round(window.innerHeight / 10)).keys()) {
      const { left, top } = document.querySelector('#state-3').getBoundingClientRect();

      if (top > window.innerHeight - 100) {
        break;
      }

      await sleep(16.67);

      await fireEvent.mouseMove(document.querySelector('#state-3'), {
        clientX: left,
        clientY: top,
        movementX: 10,
        movementY: 30,
      });
    }

    await sleep(1000);

    await fireEvent.mouseMove(document.querySelector('#state-3'), {
      movementX: 0,
      movementY: -300,
    });

    await sleep(100);

    await fireEvent.mouseUp(document.querySelector('#state-3'));

    await sleep(100);

    await fireEvent.mouseDown(document.querySelector('#fsm-states-wrapper'));
    await fireEvent.mouseUp(document.querySelector('#fsm-states-wrapper'));
  },
};
