import React, { FC } from 'react';
import { useDrag } from 'react-dnd';
import { StyledMapperField } from '.';
import AddFieldButton from './add';
import styled from 'styled-components';

export interface IMapperInputProps {
    id: number;
    types: string[];
    name: string;
    isChild: boolean;
    level: number;
    lastChildIndex: number;
    onClick: any;
    type: any;
    field: any;
    isCustom: boolean;
    path: string;
}

const StyledDragHandle = styled.div`
    width: 100%;
    height: 100%;
`;

const MapperInput: FC<IMapperInputProps> = ({
    id,
    field,
    types,
    name,
    isChild,
    level,
    isCustom,
    lastChildIndex,
    onClick,
    type,
    path,
}) => {
    const [{ opacity }, dragRef] = useDrag({
        item: { type: 'input', types, id: path },
        collect: monitor => ({
            opacity: monitor.isDragging() ? 0.2 : 1,
        }),
    });

    return (
        <StyledMapperField style={{ opacity }} input isChild={isChild} level={level} childrenCount={lastChildIndex}>
            <StyledDragHandle ref={dragRef} style={{ opacity }}>
                <h4>{name}</h4>
                <p>{`<${types.join(',')}>`}</p>
            </StyledDragHandle>
            <AddFieldButton
                field={field}
                isCustom={isCustom}
                canManageFields={type.can_manage_fields}
                onClick={onClick}
            />
        </StyledMapperField>
    );
};

export default MapperInput;
