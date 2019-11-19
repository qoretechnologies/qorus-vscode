import React, { FC } from 'react';
import { useDrop } from 'react-dnd';
import { StyledMapperField } from '.';
import size from 'lodash/size';
import AddFieldButton from './add';

export interface IMapperOutputProps {
    onDrop: (inputPath: string, outputPath: string) => any;
    id: number;
    accepts: string[];
    name: string;
    isChild: boolean;
    level: number;
    onClick: any;
    lastChildIndex: number;
    type: any;
    field: any;
    isCustom: boolean;
    path: string;
}

const MapperOutput: FC<IMapperOutputProps> = ({
    onDrop,
    id,
    accepts,
    name,
    isChild,
    level,
    onClick,
    lastChildIndex,
    type,
    field,
    isCustom,
    path,
}) => {
    const [{ canDrop, isDragging }, dropRef] = useDrop({
        accept: 'input',
        drop: item => {
            onDrop(item.id, path);
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
            isChild={isChild}
            level={level}
            childrenCount={lastChildIndex}
        >
            <h4>{name}</h4>
            <p>{`<${accepts.join(',')}>`}</p>
            <AddFieldButton
                field={field}
                isCustom={isCustom}
                canManageFields={type.can_manage_fields}
                onClick={onClick}
            />
        </StyledMapperField>
    );
};

export default MapperOutput;
