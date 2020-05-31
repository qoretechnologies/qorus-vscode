import React from 'react';
import { useDrag } from 'react-dnd';
import { TOOLBAR_ITEM_TYPE } from '.';
import styled from 'styled-components';

export interface IFSMToolbarItemProps {
    children: any;
    name: string;
    count?: number;
}

const StyledToolbarItem = styled.div`
    width: 150px;
    height: 30px;
    border: 1px solid #d7d7d7;
    border-radius: 3px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-weight: 500;

    &:hover {
        border-color: #a9a9a9;
        cursor: move;
    }
`;

const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({ children, count }) => {
    const [, drag] = useDrag({
        item: { name, type: TOOLBAR_ITEM_TYPE },
    });

    return (
        <StyledToolbarItem ref={drag}>
            {children} {count ? `(${count}) ` : ''}
        </StyledToolbarItem>
    );
};

export default FSMToolbarItem;
