import { useCallback, useEffect, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';

export const DragSelectArea = ({ element, onFinish }) => {
  const [isParentActive, setIsParentActive] = useState(false);
  const [initialMousePosition, setInitialMousePosition] = useState(undefined);
  const [currentMousePosition, setCurrentMousePosition] = useState(undefined);
  const [isSelecting, setIsSelecting] = useState(false);

  const handleSetParentActive = useCallback(() => {
    setIsParentActive(true);
  }, [isParentActive, element]);

  const handleSetParentInActive = useCallback(() => {
    if (!initialMousePosition) {
      setIsParentActive(false);
    }
  }, [isParentActive, element, initialMousePosition]);

  const handleSelectStop = (event) => {
    event.preventDefault();

    element.style.cursor = 'move';

    setIsSelecting(false);

    element.removeEventListener('mousemove', handleSelectMove, true);
  };

  const handleSelectStart = (event) => {
    if (event.shiftKey) {
      event.preventDefault();

      // Set the cursor to crosshair to indicate that we're ready to select
      // multiple elements.
      element.style.cursor = 'crosshair';

      const { clientX, clientY } = event;
      const { left, top } = element.getBoundingClientRect();

      setIsSelecting(true);
      setInitialMousePosition({ x: clientX - left, y: clientY - top });

      element.addEventListener('mousemove', handleSelectMove, true);
    }
  };

  const handleSelectMove = (event) => {
    event.stopPropagation();
    event.preventDefault();

    let { clientX, clientY } = event;
    const { left, top } = element.getBoundingClientRect();

    setCurrentMousePosition({ x: clientX - left, y: clientY - top });
  };

  useEffect(() => {
    element?.addEventListener('mouseover', handleSetParentActive, true);
    element?.addEventListener('mouseleave', handleSetParentInActive, true);

    return () => {
      element?.removeEventListener('mouseover', handleSetParentActive, true);
      element?.removeEventListener('mouseleave', handleSetParentInActive, true);
    };
  }, [element, isParentActive, initialMousePosition]);

  useUpdateEffect(() => {
    if (!isSelecting && initialMousePosition && currentMousePosition) {
      onFinish?.({
        startX: initialMousePosition?.x,
        startY: initialMousePosition?.y,
        endX: currentMousePosition?.x,
        endY: currentMousePosition?.y,
      });

      setInitialMousePosition(undefined);
      setCurrentMousePosition(undefined);
    }
  }, [isSelecting, initialMousePosition, currentMousePosition]);

  useUpdateEffect(() => {
    console.log(isParentActive);
    if (element) {
      if (isParentActive) {
        element.addEventListener('mousedown', handleSelectStart, true);
        element.addEventListener('mouseup', handleSelectStop, true);
      } else {
        element.removeEventListener('mousemove', handleSelectMove, true);
        element.removeEventListener('mousedown', handleSelectStart, true);
        element.removeEventListener('mouseup', handleSelectStop, true);
      }
    }

    return () => {
      if (element) {
        element.style.cursor = 'move';
        element.removeEventListener('mousemove', handleSelectMove, true);
        element.removeEventListener('mousedown', handleSelectStart, true);
        element.removeEventListener('mouseup', handleSelectStop, true);
      }
    };
  }, [isParentActive, element]);

  useUnmount(() => {
    if (element) {
      element.style.cursor = 'initial';
      element.removeEventListener('mousemove', handleSelectMove, true);
      element.removeEventListener('mousedown', handleSelectStart, true);
      element.removeEventListener('mouseup', handleSelectStop, true);
      element.removeEventListener('mouseover', handleSetParentActive);
      element.removeEventListener('mouseleave', handleSetParentInActive);
    }
  });

  if (!initialMousePosition || !currentMousePosition || !isSelecting) {
    return null;
  }

  return (
    <svg
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 100 }}
    >
      <polygon
        points={`${initialMousePosition.x},${initialMousePosition.y} ${currentMousePosition.x},${initialMousePosition.y} ${currentMousePosition.x},${currentMousePosition.y} ${initialMousePosition.x},${currentMousePosition.y}`}
        fill="#ffed91"
        fillOpacity={0.2}
        stroke="#ffed91"
        strokeWidth={1}
        strokeDasharray={2}
      />
    </svg>
  );
};
