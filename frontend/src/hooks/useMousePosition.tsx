import { useEffect, useState } from 'react';

export const useMousePosition = (): { x: number; y: number } => {
  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: undefined,
    y: undefined,
  });
  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('drag', updateMousePosition);
    return () => {
      window.removeEventListener('drag', updateMousePosition);
    };
  }, []);
  return mousePosition;
};
