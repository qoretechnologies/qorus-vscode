import React, { useContext, useRef, useState } from 'react';
import { TTranslator } from '../../../App';
import { TextContext } from '../../../context/text';
import PanElement from 'react-element-pan';
import { useDrop, XYCoord } from 'react-dnd';
import FSMToolbarItem from './toolbarItem';
import useMount from 'react-use/lib/useMount';
import FSMState from './state';

export interface IFSMViewProps {
    t: TTranslator;
}

let currentXPan: number;
let currentYPan: number;

const FSMView: React.FC<IFSMViewProps> = () => {
    const t = useContext(TextContext);
    const wrapperRef = useRef(null);
    const [boxes, setBoxes] = useState<any[]>([]);
    const [wrapperDimensions, setWrapperDimensions] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [, drop] = useDrop({
        accept: ['item', 'state'],
        drop: (item, monitor) => {
            if (item.type === 'item') {
                const { x, y } = monitor.getClientOffset();
                setBoxes((cur) => [...cur, { x: x + currentXPan - 153, y: y + currentYPan - 181 }]);
            } else if (item.type === 'state') {
                moveItem(item.id, monitor.getDifferenceFromInitialOffset());
            }
        },
    });

    const moveItem: (id: number, coords: XYCoord) => void = (id, coords) => {
        setBoxes((cur) => {
            const newBoxes = [...cur];

            newBoxes[id].x += coords.x;
            newBoxes[id].y += coords.y;

            return newBoxes;
        });
    };

    useMount(() => {
        const { width, height } = wrapperRef.current.getBoundingClientRect();
        setWrapperDimensions({ width, height });
        currentXPan = 1000 - wrapperDimensions.width / 2;
        currentYPan = 1000 - wrapperDimensions.height / 2;
    });

    console.log(currentXPan, currentYPan);
    console.log(boxes);

    return (
        <>
            <div>
                <FSMToolbarItem name="state"> State </FSMToolbarItem>
            </div>
            <div style={{ width: '100%', height: '100%' }} ref={wrapperRef}>
                <div
                    key={JSON.stringify(wrapperDimensions)}
                    width="100%"
                    height="100%"
                    startX={1000 - wrapperDimensions.width / 2}
                    startY={1000 - wrapperDimensions.height / 2}
                    onPan={({ x, y }) => {
                        currentXPan = x;
                        currentYPan = y;
                    }}
                >
                    <div
                        ref={drop}
                        style={{
                            width: '2000px',
                            height: '2000px',
                            backgroundImage: 'linear-gradient(to right bottom, #d7d7d7, #000)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            position: 'relative',
                        }}
                    >
                        {boxes.map((box, index) => (
                            <FSMState key={index} id={index} x={box.x} y={box.y} />
                        ))}
                        <svg height="100%" width="100%" style={{ position: 'absolute' }}></svg>
                    </div>
                </div>
            </div>
        </>
    );
};

export default FSMView;
