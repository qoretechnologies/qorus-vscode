import { forEach, reduce, size } from 'lodash';
import { useEffect, useRef } from 'react';
import { calculateValueWithZoom } from '../components/PanElement';
import { DIAGRAM_SIZE, IFSMStates } from '../containers/InterfaceCreator/fsm';
import { getStateBoundingRect } from '../helpers/diagram';

export const useMoveByDragging = (
  selectedStates: string[],
  states: IFSMStates,
  refs: Record<string, HTMLDivElement>,
  onUpdate: (updatedPositions: Record<string, { position: { x: number; y: number } }>) => void,
  zoom: number
) => {
  const timeSinceMouseDown = useRef(0);
  const staticPositions = useRef<Record<string, { x: number; y: number }>>({});

  const handleDragMove = (event) => {
    timeSinceMouseDown.current = 0;

    forEach(selectedStates, (id) => {
      const stateRectData = getStateBoundingRect(id);
      const ref = refs[id];

      staticPositions.current[id].x += calculateValueWithZoom(event.movementX, zoom);
      staticPositions.current[id].y += calculateValueWithZoom(event.movementY, zoom);

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

      ref.style.left = `${staticPositions.current[id].x}px`;
      ref.style.top = `${staticPositions.current[id].y}px`;
    });
  };

  const handleDragStop = (event) => {
    const positionedRefs = reduce(
      selectedStates,
      (newRefs, id) => ({
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

    // if (Date.now() - timeSinceMouseDown.current < 200) {
    //   isLoadingCheck ? undefined : handleClick(event);
    // }

    timeSinceMouseDown.current = 0;

    window.removeEventListener('mousemove', handleDragMove, true);
    window.removeEventListener('mouseup', handleDragStop, true);
  };

  const handleDragStart = (event) => {
    if (event.metaKey) {
      return;
    }

    event.stopPropagation();
    event.preventDefault();

    timeSinceMouseDown.current = Date.now();

    window.addEventListener('mousemove', handleDragMove, true);
    window.addEventListener('mouseup', handleDragStop, true);
  };

  useEffect(() => {
    if (size(selectedStates)) {
      forEach(selectedStates, (id) => {
        staticPositions.current[id] = {
          x: states[id].position.x,
          y: states[id].position.y,
        };
      });

      forEach(refs, (ref, id) => {
        ref.addEventListener('mousedown', handleDragStart, true);
      });
    }

    return () => {
      if (size(selectedStates)) {
        forEach(refs, (ref, id) => {
          ref.removeEventListener('mousedown', handleDragStart, true);
        });

        window.removeEventListener('mousemove', handleDragMove, true);
        window.removeEventListener('mouseup', handleDragStop, true);
      }
    };
  }, [selectedStates]);
};
