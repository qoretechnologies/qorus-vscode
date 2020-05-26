import React, { useState } from 'react';
import { useDrag } from 'react-dnd';

export interface IFSMStateProps {
    x: number;
    y: number;
    id: number;
}

const FSMState: React.FC<IFSMStateProps> = ({ x, y, id }) => {
    const [, drag] = useDrag({
        item: { name: 'state', type: 'state', id },
    });

    return (
        <div
            ref={drag}
            style={{
                left: `${x}px`,
                top: `${y}px`,
                position: 'absolute',
                width: '150px',
                height: '30px',
                backgroundColor: '#fff',
                zIndex: 9999,
            }}
        />
    );
};

export default FSMState;
