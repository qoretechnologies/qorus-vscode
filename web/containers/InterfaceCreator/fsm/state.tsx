import React, { useState } from 'react';
import { useDrag } from 'react-dnd';
import { STATE_ITEM_TYPE, IFSMState } from '.';
import styled, { css } from 'styled-components';
import { ButtonGroup, Button } from '@blueprintjs/core';

export interface IFSMStateProps extends IFSMState {
    selected?: boolean;
    onClick: (id: string) => any;
    onEditClick: (id: string) => any;
    onDeleteClick: (id: string) => any;
    id: string;
}

const StyledFSMState = styled.div<{
    x: number;
    y: number;
    selected: boolean;
    initial: boolean;
    final: boolean;
    type: 'state' | 'fsm';
}>`
    left: ${({ x }) => `${x}px`};
    top: ${({ y }) => `${y}px`};
    position: absolute;
    width: 180px;
    height: 50px;
    background-color: #fff;
    z-index: 20;
    border: 2px solid;

    ${({ selected, initial, final, type }) => {
        let color: string = '#a9a9a9';

        if (selected) {
            color = '#277fba';
        } else if (final) {
            color = '#81358a';
        } else if (initial) {
            color = '#7fba27';
        }

        return css`
            border-color: ${color};
            border-style: ${type === 'state' ? 'solid' : 'dashed'};

            &:hover {
                box-shadow: 0 0 5px 0px ${color};
            }
        `;
    }};

    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
`;

const StyledStateName = styled.p`
    padding: 0;
    margin: 0;
    font-weight: 500;
`;

const StyledStateAction = styled.p`
    padding: 0;
    margin: 0;
    color: #a9a9a9;
    font-size: 12px;
`;

const FSMState: React.FC<IFSMStateProps> = ({
    position,
    id,
    selected,
    onClick,
    onEditClick,
    onDeleteClick,
    name,
    action,
    initial,
    final,
    type,
}) => {
    const [, drag] = useDrag({
        item: { name: 'state', type: STATE_ITEM_TYPE, id },
    });
    const [isHovered, setIsHovered] = useState<boolean>(false);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, func: (id: string) => any) => {
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
            initial={initial}
            final={final}
            type={type}
        >
            <StyledStateName>{name}</StyledStateName>
            {action && <StyledStateAction>{action.type}</StyledStateAction>}
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
