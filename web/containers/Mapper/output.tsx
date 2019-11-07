import React, { FC } from 'react';
import { useDrop } from 'react-dnd';
import { StyledMapperField } from '.';

export interface IMapperOutputProps {
    onDrop: (inputId: number, outputId: number) => any;
    id: number;
}

const MapperOutput: FC<IMapperOutputProps> = ({ onDrop, id }) => {
    const [{ canDrop }, dropRef] = useDrop({
        accept: 'input',
        drop: item => {
            onDrop(item.id, id);
        },
        collect: monitor => ({
            canDrop: monitor.canDrop(),
        }),
    });

    return <StyledMapperField ref={dropRef} style={{ backgroundColor: canDrop ? '#d7d7d7' : 'transparent' }} />;
};

export default MapperOutput;
