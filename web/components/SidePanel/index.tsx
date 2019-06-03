import React, { FunctionComponent } from 'react';
import styled from 'styled-components';

const StyledSidePanel = styled.div`
    width: 250px;
    height: 100%;
    padding-right: 15px;
    border-right: 2px solid #d7d7d7;
    overflow: none;
    display: flex;
    flex-flow: column;
`;

const SidePanel: FunctionComponent = ({ children }) => <StyledSidePanel>{children}</StyledSidePanel>;

export default SidePanel;
