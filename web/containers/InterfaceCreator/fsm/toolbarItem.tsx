import React from 'react';
import { useDrag } from 'react-dnd';
import { TOOLBAR_ITEM_TYPE } from '.';
import styled, { css } from 'styled-components';

export interface IFSMToolbarItemProps {
    children: any;
    name: string;
    count?: number;
    type: string;
}

const StyledToolbarItem = styled.div<{ type: string }>`
    width: 150px;
    height: 30px;
    border: 1px solid #d7d7d7;
    margin-right: 10px;
    border-radius: 3px;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;

    ${({ type }) => {
        switch (type) {
            case 'connector':
                return css`
                    transform: skew(15deg);
                    span {
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
            default:
                return null;
        }
    }}

    &:hover {
        border-color: #a9a9a9;
        cursor: move;
    }
`;

const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({ children, count, name, type }) => {
    const [, drag] = useDrag({
        item: { name, type: TOOLBAR_ITEM_TYPE, stateType: type },
    });

    return (
        <StyledToolbarItem ref={drag} type={type}>
            <span>{children} {count ? `(${count}) ` : ''}</span>
        </StyledToolbarItem>
    );
};

export default FSMToolbarItem;
