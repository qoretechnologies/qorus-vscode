import { useDragLayer } from 'react-dnd';
import styled from 'styled-components';
import { useMousePosition } from '../../../hooks/useMousePosition';
import FSMState from './state';

export const StyledDragLayer = styled.div`
  position: fixed;
  pointer-events: none;
  z-index: 100;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
`;

export const CustomDragLayer = ({ zoom, states }) => {
  const { itemType, isDragging, item, initialOffset, currentOffset } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialOffset: monitor.getInitialSourceClientOffset(),
    currentOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
    ...monitor,
  }));

  const { x, y } = useMousePosition();

  if (!isDragging || !x || !y) {
    return null;
  }

  return (
    <StyledDragLayer>
      <div
        style={{
          position: 'absolute',
          left: x,
          top: y,
          pointerEvents: 'none',
        }}
      >
        <FSMState
          type={item?.name === 'block' ? 'block' : item?.stateType}
          id={item.id}
          isStatic
          position={{ x: 0, y: 0 }}
        />
      </div>
    </StyledDragLayer>
  );
};
