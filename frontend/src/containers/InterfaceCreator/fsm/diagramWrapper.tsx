import React, { useContext } from 'react';

import { ElementPan } from '../../../components/PanElement';
import { TextContext } from '../../../context/text';

export interface IFSMDiagramWrapperProps {
  wrapperDimensions: { width: number; height: number };
  setPan: (x: number, y: number) => void;
  children: any;
  zoom: number;
  zoomIn: () => void;
  zoomOut: () => void;
  setShowStateIds: (show: boolean) => void;
  showStateIds: boolean;
}

const FSMDiagramWrapper: React.FC<IFSMDiagramWrapperProps> = ({
  wrapperDimensions,
  children,
  setPan,
  zoom,
  ...rest
}) => {
  const t = useContext(TextContext);

  return (
    <ElementPan
      key={JSON.stringify(wrapperDimensions)}
      width="100%"
      height="100%"
      startX={0}
      startY={0}
      onPan={({ x, y }) => setPan(x, y)}
      enableDragging
      zoom={zoom}
      {...rest}
      t={t}
    >
      {children}
    </ElementPan>
  );
};

export default FSMDiagramWrapper;
