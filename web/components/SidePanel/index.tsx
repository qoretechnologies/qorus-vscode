import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const StyledSidePanel = styled.div`
    width: 250px;
    padding: 0 15px;

    &:first-child {
        padding-left: 0;
    }

    border-right: 1px solid #eee;
    overflow: none;
    display: flex;
    flex-flow: column;

    h3 {
        margin: 0;
        margin-bottom: 15px;
    }
`;

const SidePanel: FunctionComponent = ({ children, title }) => (
    <StyledSidePanel>
        {title && <h3>{title}</h3>}
        {children}
    </StyledSidePanel>
);

export default SidePanel;
