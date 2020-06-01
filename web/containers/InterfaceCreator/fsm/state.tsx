import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { STATE_ITEM_TYPE, IFSMState } from '.';
import styled from 'styled-components';
import { ButtonGroup, Button } from '@blueprintjs/core';

export interface IFSMStateProps extends IFSMState {
    selected?: boolean;
    onClick: (id: number) => any;
    onEditClick: (id: number) => any;
    onDeleteClick: (id: number) => any;
    id: number;
}

const StyledFSMState = styled.div<{ x: number; y: number; selected: boolean }>`
    left: ${({ x }) => `${x}px`};
    top: ${({ y }) => `${y}px`};
    position: absolute;
    width: 180px;
    height: 50px;
    background-color: #fff;
    z-index: 20;
    border: 1px solid;
    border-color: ${({ selected }) => (selected ? 'blue' : '#a9a9a9')};
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;

    &:hover {
        box-shadow: 0 0 10px 1px #d7d7d7;
    }
`;

const FSMState: React.FC<IFSMStateProps> = ({ position, id, selected, onClick, onEditClick, onDeleteClick, name }) => {
    const [, drag] = useDrag({
        item: { name: 'state', type: STATE_ITEM_TYPE, id },
    });
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, func: (id: number) => any) => {
        event.stopPropagation();

        func(id);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
    };

    return (
        <StyledFSMState
            key={id}
            ref={drag}
            x={position.x}
            y={position.y}
            onClick={(e) => handleClick(e, onClick)}
            selected={selected}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <p>{name}</p>
            {isHovered && (
                <ButtonGroup minimal style={{ position: 'absolute', top: '-30px' }}>
                    <Button icon="edit" intent="warning" onClick={(e) => handleClick(e, onEditClick)} />
                    <Button icon="cross" intent="danger" onClick={(e) => handleClick(e, onDeleteClick)} />
                </ButtonGroup>
            )}
        </StyledFSMState>
    );
};

export default FSMState;
