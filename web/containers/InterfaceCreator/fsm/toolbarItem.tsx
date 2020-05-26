import React from 'react';
import { useDrag } from 'react-dnd';

export interface IFSMToolbarItemProps {
    children: any;
    name: string;
}

const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({ children }) => {
    const [, drag] = useDrag({
        item: { name, type: 'item' },
    });

    return (
        <div style={{ width: '150px', height: '30px', border: '1px solid #000' }} ref={drag}>
            {children}
        </div>
    );
};

export default FSMToolbarItem;
