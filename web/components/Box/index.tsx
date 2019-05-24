import React, { FunctionComponent, ReactNode } from 'react';
import styled, { css } from 'styled-components';

export interface IBox {
    children: ReactNode;
    fill: boolean;
}

const StyledBox = styled.div`
    margin: 15px;
    flex: 1 auto;
    display: flex;
    background-color: #fff;
    border-radius: 7px;
    padding: 10px 15px;
    ${props =>
        props.fill
            ? css`
                  height: 100%;
              `
            : css`
                  height: auto;
              `}
`;

const StyledBoxContent = styled.div`
    flex: 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
`;

const Box: FunctionComponent<IBox> = ({ children, fill }) => <StyledBox fill>{children}</StyledBox>;

export { StyledBoxContent as BoxContent };
export default Box;
