import React from 'react';
import { ElementPan } from '../../../components/PanElement';

export interface IFSMDiagramWrapperProps {
    isHoldingShiftKey?: boolean;
    wrapperDimensions: { width: number; height: number };
    setPan: (x: number, y: number) => void;
    children: any;
}

const FSMDiagramWrapper: React.FC<IFSMDiagramWrapperProps> = ({
    isHoldingShiftKey,
    wrapperDimensions,
    children,
    setPan,
}) => (
    <ElementPan
        key={JSON.stringify(wrapperDimensions)}
        width="100%"
        height="100%"
        startX={1000 - wrapperDimensions.width / 2}
        startY={1000 - wrapperDimensions.height / 2}
        onPan={({ x, y }) => setPan(x, y)}
        enableDragging={isHoldingShiftKey}
    >
        {children}
    </ElementPan>
);

export default FSMDiagramWrapper;
