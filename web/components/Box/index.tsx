import React, { FunctionComponent, ReactNode } from 'react';
import styled from 'styled-components';

export interface IBox {
    children: ReactNode;
}

const StyledBox = styled.div`
    margin: 15px;
    flex: 1 auto;
    background-color: #fff;
    border-radius: 7px;
    padding: 10px 15px;
`;

const StyledBoxContent = styled.div`
    flex: 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
`;

const Box: FunctionComponent<IBox> = ({ children }) => <StyledBox>{children}</StyledBox>;

export { StyledBoxContent as BoxContent };
export default Box;
