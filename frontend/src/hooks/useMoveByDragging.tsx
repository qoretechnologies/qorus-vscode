import EventEmitter from 'events';
import { find, forEach, reduce, size } from 'lodash';
import { useEffect, useRef } from 'react';
import { calculateValueWithZoom } from '../components/PanElement';
import { DIAGRAM_SIZE, IFSMStates, TFSMSelectedStates } from '../containers/InterfaceCreator/fsm';
import { getStateBoundingRect } from '../helpers/diagram';

export const Emitter = new EventEmitter();

export const useMoveByDragging = (
  selectedStates: TFSMSelectedStates,
  states: IFSMStates,
  refs: Record<string, HTMLDivElement>,
  onUpdate: (updatedPositions: Record<string, { position: { x: number; y: number } }>) => void,
  onStart?: () => void,
  onFinish?: (deselect?: boolean) => void,
  zoom?: number
) => {
  const staticPositions = useRef<Record<string, { x: number; y: number }>>({});

  const moveEntities = (x: number, y: number) => {
    forEach(selectedStates, (stateData, id) => {
      const stateRectData = getStateBoundingRect(id);
      const ref = refs[id];

      staticPositions.current[id].x += calculateValueWithZoom(x, zoom);
      staticPositions.current[id].y += calculateValueWithZoom(y, zoom);

      if (staticPositions.current[id].x < 0) {
        staticPositions.current[id].x = 0;
      }

      if (staticPositions.current[id].y < 0) {
        staticPositions.current[id].y = 0;
      }

      if (staticPositions.current[id].x > DIAGRAM_SIZE - stateRectData.width) {
        staticPositions.current[id].x = DIAGRAM_SIZE - stateRectData.width;
      }

      if (staticPositions.current[id].y > DIAGRAM_SIZE - stateRectData.height) {
        staticPositions.current[id].y = DIAGRAM_SIZE - stateRectData.height;
      }
    });

    const positionedRefs = reduce(
      selectedStates,
      (newRefs, _stateData, id) => ({
        ...newRefs,
        [id]: {
          position: {
            x: staticPositions.current[id].x,
            y: staticPositions.current[id].y,
          },
        },
      }),
      {}
    );

    onUpdate(positionedRefs);
  };

  const handleDragMove = (event) => {
    const x = event.movementX;
    const y = event.movementY;

    if (!x && !y) {
      return;
    }

    moveEntities(x, y);
  };

  const handleDragStop = () => {
    onFinish?.();

    window.removeEventListener('mousemove', handleDragMove, true);
    window.removeEventListener('mouseup', handleDragStop, true);
  };

  const handleSingleDragStop = () => {
    const positionedRefs = reduce(
      selectedStates,
      (newRefs, _stateData, id) => ({
        ...newRefs,
        [id]: {
          position: {
            x: staticPositions.current[id].x,
            y: staticPositions.current[id].y,
          },
        },
      }),
      {}
    );

    onUpdate(positionedRefs);
    onFinish(true);

    window.removeEventListener('mousemove', handleDragMove, true);
    window.removeEventListener('mouseup', handleSingleDragStop, true);

    forEach(refs, (ref, id) => {
      // Check if this state already had a mousedown
      if (selectedStates[id]?.fromMouseDown) {
        ref.removeEventListener('mouseup', handleSingleDragStop, true);
      }
    });
  };

  const handleDragStart = (event) => {
    if (event.shiftKey) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    onStart?.();

    window.removeEventListener('mousemove', handleDragMove, true);
    window.addEventListener('mousemove', handleDragMove, true);
    window.addEventListener('mouseup', handleDragStop, true);
  };

  useEffect(() => {
    if (size(selectedStates)) {
      forEach(selectedStates, (stateData, id) => {
        const state = find(states, (_state, key) => key === id);

        if (!state) {
          return;
        }

        staticPositions.current[id] = {
          x: state.position.x,
          y: state.position.y,
        };
      });

      Emitter.on('drag-area-move', ({ scrollLeft, scrollTop, scrollRight, scrollBottom }) => {
        if (scrollLeft) {
          moveEntities(-10, 0);
        }

        if (scrollTop) {
          moveEntities(0, -10);
        }

        if (scrollRight) {
          moveEntities(10, 0);
        }

        if (scrollBottom) {
          moveEntities(0, 10);
        }
      });

      forEach(selectedStates, (state, id) => {
        // Check if this state already had a mousedown
        if (state?.fromMouseDown) {
          onStart?.();

          window.removeEventListener('mousemove', handleDragMove, true);
          window.addEventListener('mousemove', handleDragMove, true);
          refs[id].addEventListener('mouseup', handleSingleDragStop, true);
          window.removeEventListener('mouseup', handleDragStop, true);
          window.addEventListener('mouseup', handleSingleDragStop, true);
        } else {
          refs[id].addEventListener('mousedown', handleDragStart, true);
        }
      });
    } else {
      Emitter.removeAllListeners('drag-area-move');
    }

    return () => {
      if (size(selectedStates)) {
        Emitter.removeAllListeners('drag-area-move');

        forEach(refs, (ref, id) => {
          ref.removeEventListener('mousedown', handleDragStart, true);
        });

        window.removeEventListener('mousemove', handleDragMove, true);
        window.removeEventListener('mouseup', handleDragStop, true);
      }
    };
  }, [JSON.stringify(selectedStates)]);
};
