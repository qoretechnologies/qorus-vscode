import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { StyledMapperField } from '.';

export interface IMapperInputProps {
    id: number;
}

const MapperInput: FC<IMapperInputProps> = ({ id }) => {
    const [{ opacity }, dragRef] = useDrag({
        item: { type: 'input', name: 'test', id },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.2 : 1,
        }),
    });

    return <StyledMapperField ref={dragRef} style={{ opacity }} />;
};

export default MapperInput;
