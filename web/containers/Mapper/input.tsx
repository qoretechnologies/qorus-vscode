import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { StyledMapperField } from '.';

export interface IMapperInputProps {
    id: number;
    types: string[];
    name: string;
}

const MapperInput: FC<IMapperInputProps> = ({ id, types, name }) => {
    console.log(types);
    const [{ opacity }, dragRef] = useDrag({
        item: { type: 'input', types, id },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.2 : 1,
        }),
    });

    return (
        <StyledMapperField ref={dragRef} style={{ opacity }}>
            <h4>{name}</h4>
            <p>{`<${types.join(',')}>`}</p>
        </StyledMapperField>
    );
};

export default MapperInput;
