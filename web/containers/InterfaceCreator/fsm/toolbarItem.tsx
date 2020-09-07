import React from 'react';
import { useDrag } from 'react-dnd';
import { TOOLBAR_ITEM_TYPE } from '.';
import styled, { css } from 'styled-components';

export interface IFSMToolbarItemProps {
    children: any;
    name: string;
    count?: number;
    type: string;
    disabled?: boolean;
}

export const getStateStyle = (type) => {
    switch (type) {
        case 'connector':
            return css`
                transform: skew(15deg);
                span,
                p {
                    transform: skew(-15deg);
                }
            `;
        case 'mapper':
            return null;
        case 'pipeline':
            return css`
                border-radius: 50px;
            `;
        case 'fsm':
            return css`
                border-style: dashed;
            `;
        case 'block':
            return css`
                border-style: dotted;
                border-radius: 10px;
                background: repeating-linear-gradient(-45deg, #fff, #fff 10px, #f3f3f3 10px, #f3f3f3 20px);
            `;
        default:
            return null;
    }
};

const StyledToolbarItem = styled.div<{ type: string; disabled?: boolean }>`
    width: 150px;
    height: 30px;
    border: 1px solid #d7d7d7;
    margin-right: 10px;
    border-radius: 3px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;

    ${({ type }) => getStateStyle(type)}

    &:not(.disabled) {
        &:hover {
            border-color: #a9a9a9;
            cursor: move;
        }
    }

    &.disabled {
        opacity: 0.3;
        pointer-events: none;
    }
`;

const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({ children, count, name, type, disabled }) => {
    const [, drag] = useDrag({
        item: { name, type: TOOLBAR_ITEM_TYPE, stateType: type },
    });

    return (
        <StyledToolbarItem ref={!disabled ? drag : undefined} type={type} className={disabled ? 'disabled' : undefined}>
            <span>
                {children} {count ? `(${count}) ` : ''}
            </span>
        </StyledToolbarItem>
    );
};

export default FSMToolbarItem;
