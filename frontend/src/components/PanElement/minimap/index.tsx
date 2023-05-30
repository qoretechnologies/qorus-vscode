import React, { useEffect, useRef, useState } from 'react';

import { ReqoreEffect } from '@qoretechnologies/reqore/dist/components/Effect';
import map from 'lodash/map';
import useMount from 'react-use/lib/useMount';
import ResizeObserver from 'resize-observer-polyfill';
import styled, { css } from 'styled-components';
import { calculateValueWithZoom } from '..';
import { getStateCategory, getStateColor } from '../../../containers/InterfaceCreator/fsm/state';
import { getStateBoundingRect } from '../../../helpers/diagram';

const StyledMinimapWrapper = styled.div<{ show: boolean }>`
  width: 200px;
  height: ${({ show }) => (show ? '200px' : '0px')};
  transition: height 0.2s ease-in-out;
  position: relative;
  z-index: 100;
  cursor: no-drop;
`;

const StyledMinimapView = styled.div<{ height: number; width: number; zoom: number }>`
  ${({ width, height, zoom }) => css`
    width: ${calculateValueWithZoom(width, zoom) / 20}px;
    height: ${calculateValueWithZoom(height, zoom) / 20}px;
    box-shadow: inset 1px 1px 0 0 #277fba, inset -1px -1px 0 0 #277fba,
      inset 1px 1px 3px -1px #277fba, inset -1px -1px 3px -1px #277fba;
    position: absolute;
  `}

  border-radius: 4px;
  transition: box-shadow 0.2s linear;

  &:hover,
  &:active,
  &:focus {
    cursor: move;
    box-shadow: inset 1px 1px 0 0 #277fba, inset -1px -1px 0 0 #277fba,
      inset 1px 1px 6px -1px #277fba, inset -1px -1px 6px -1px #277fba;
  }
`;

export interface IFSMMinimapProps {
  x: number;
  y: number;
  items?: { y: number; x: number }[];
  onDrag: (x: number, y: number) => void;
  show: boolean;
  panElementId: string;
  zoom: number;
}

const staticPosition = { x: null, y: null };

const Minimap: React.FC<IFSMMinimapProps> = ({ items, x, y, onDrag, show, panElementId, zoom }) => {
  const viewRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{ x: number; y: number }>({ x, y });
  const [wrapperSize, setWrapperSize] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });

  useMount(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      window.requestAnimationFrame(() => {
        if (!Array.isArray(entries) || !entries.length) {
          return;
        }

        adjustWrapperSize();
      });
    });

    resizeObserver.observe(document.querySelector(`#panElement${panElementId}`));

    staticPosition.x = x || 0;
    staticPosition.y = y || 0;

    return () => {
      resizeObserver.unobserve(document.querySelector(`#panElement${panElementId}`));
    };
  });

  useEffect(() => {
    adjustWrapperSize();
  }, [zoom]);

  const adjustWrapperSize = () => {
    const el = document.querySelector(`#panElement${panElementId}`);

    if (el) {
      let { width, height } = el.getBoundingClientRect();

      setWrapperSize({
        width,
        height,
      });
    }
  };

  useEffect(() => {
    const modifiedX = calculateValueWithZoom(x, zoom) / 20;
    const modifiedY = calculateValueWithZoom(y, zoom) / 20;

    setPosition({ x: modifiedX, y: modifiedY });
    staticPosition.x = modifiedX;
    staticPosition.y = modifiedY;
  }, [x, y, zoom]);

  const onDragStart = (e) => {
    e.persist();
    e.preventDefault();
    e.stopPropagation();

    window.addEventListener('mouseup', onDragStop);
    window.addEventListener('mousemove', onDragMove);
  };

  const onDragMove = (e) => {
    const { width: viewWidth, height: viewHeight } = viewRef.current.getBoundingClientRect();

    staticPosition.x += calculateValueWithZoom(e.movementX, zoom);
    staticPosition.y += calculateValueWithZoom(e.movementY, zoom);

    if (staticPosition.x < 0) {
      staticPosition.x = 0;
    }

    if (staticPosition.y < 0) {
      staticPosition.y = 0;
    }

    const widthDifference = 200 - viewWidth;

    if (staticPosition.x > widthDifference) {
      staticPosition.x = widthDifference;
    }

    const heightDifference = 200 - viewHeight;

    if (staticPosition.y > heightDifference) {
      staticPosition.y = heightDifference;
    }

    viewRef.current.style.top = `${staticPosition.y}px`;
    viewRef.current.style.left = `${staticPosition.x}px`;

    onDrag(e.movementX * 20, e.movementY * 20);
  };

  const onDragStop = () => {
    window.removeEventListener('mouseup', onDragStop);
    window.removeEventListener('mousemove', onDragMove);
  };

  const renderMinimapItem = (item, index) => {
    const { x, y } = item;
    let { width, height } = getStateBoundingRect(item.id);

    return (
      <ReqoreEffect
        key={index}
        style={{
          left: `${x / 20}px`,
          top: `${y / 20}px`,
          width: `${width / 20}px`,
          height: `${height / 20}px`,
          position: 'absolute',
        }}
        effect={{
          gradient: getStateColor(getStateCategory(item.type)),
        }}
        as="div"
      />
    );
  };

  return (
    <StyledMinimapWrapper draggable show={show}>
      {show && (
        <>
          {map(items, renderMinimapItem)}
          <StyledMinimapView
            width={wrapperSize.width}
            height={wrapperSize.height}
            zoom={zoom}
            style={{
              top: `${position.y}px`,
              left: `${position.x}px`,
            }}
            ref={viewRef}
            onMouseDown={onDragStart}
          />
        </>
      )}
    </StyledMinimapWrapper>
  );
};

export default Minimap;
