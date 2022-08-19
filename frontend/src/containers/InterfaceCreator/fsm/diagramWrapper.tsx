import React, { useContext } from 'react';

import { ElementPan } from '../../../components/PanElement';
import { TextContext } from '../../../context/text';

export interface IFSMDiagramWrapperProps {
    isHoldingShiftKey?: boolean;
    wrapperDimensions: { width: number; height: number };
    setPan: (x: number, y: number) => void;
    children: any;
    zoom: number;
}

const FSMDiagramWrapper: React.FC<IFSMDiagramWrapperProps> = ({
    isHoldingShiftKey,
    wrapperDimensions,
    children,
    setPan,
    zoom,
    items,
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
            enableDragging={isHoldingShiftKey}
            zoom={zoom}
            items={items}
            t={t}
        >
            {children}
        </ElementPan>
    );
};

export default FSMDiagramWrapper;
