import React, { FunctionComponent, ReactNode } from 'react';
import styled from 'styled-components';

const StyledContent = styled.div`
    display: flex;
    flex-flow: column;
    overflow-y: auto;
    flex: 1;

    h3 {
        margin: 0;
        margin-bottom: 15px;
        margin-left: 15px;
    }
`;

export interface IContent {
    children: ReactNode;
    title?: string;
    style?: any;
}

const Content: FunctionComponent<IContent> = ({ children, title, style }) => (
    <StyledContent style={style}>
        {title && <h3>{title}</h3>}
        {children}
    </StyledContent>
);

export default Content;
