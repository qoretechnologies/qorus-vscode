import { StoryObj } from '@storybook/react';
import { fireEvent } from '@storybook/testing-library';
import FSMView from '../../../containers/InterfaceCreator/fsm';
import fsm from '../../Data/fsm.json';
import { StoryMeta } from '../../types';
import { sleep } from '../utils';
import { SwitchesToBuilder, ZoomIn, ZoomOut } from './Basic.stories';

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

    await fireEvent.dragStart(document.querySelector('#state-2'));

    await sleep(500);

    await fireEvent.drop(document.querySelector('#state-2'), {
      clientX: 1000 * coeficient,
      clientY: 150 * coeficient,
    });

    await sleep(500);

    await fireEvent.dragStart(document.querySelector('#state-7'));

    await sleep(500);

    await fireEvent.drop(document.querySelector('#state-2'), {
      clientY: 700 * coeficient,
      clientX: 450 * coeficient,
    });
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
