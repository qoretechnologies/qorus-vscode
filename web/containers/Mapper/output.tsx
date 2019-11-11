import React, { FC } from 'react';
import { useDrop } from 'react-dnd';
import { StyledMapperField } from '.';
import size from 'lodash/size';

export interface IMapperOutputProps {
    onDrop: (inputId: number, outputId: number) => any;
    id: number;
    accepts: string[];
    name: string;
}

const MapperOutput: FC<IMapperOutputProps> = ({ onDrop, id, accepts, name }) => {
    const [{ canDrop, isDragging }, dropRef] = useDrop({
        accept: 'input',
        drop: item => {
            onDrop(item.id, id);
        },
        canDrop: item => {
            if (size(item.types) <= size(accepts) && accepts.some((type: string) => item.types.includes(type))) {
                return true;
            }
            return false;
        },
        collect: monitor => ({
            isDragging: !!monitor.getItem(),
            canDrop: monitor.canDrop(),
        }),
    });

    return (
        <StyledMapperField
            ref={dropRef}
            style={{
                opacity: isDragging ? (canDrop ? 1 : 0.3) : 1,
                transform: canDrop ? 'translateX(-35px)' : 'translateX(0)',
                borderColor: canDrop ? '#137cbd' : '#d7d7d7',
            }}
        >
            <h4>{name}</h4>
            <p>{`<${accepts.join(',')}>`}</p>
        </StyledMapperField>
    );
};

export default MapperOutput;
