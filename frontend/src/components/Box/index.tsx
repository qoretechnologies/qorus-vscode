import React, { FunctionComponent, ReactNode } from 'react';
import styled, { css } from 'styled-components';

export interface IBox {
    children: ReactNode;
    fill: boolean;
    style: { [key: string]: string | number };
}

const StyledBox = styled.div`
    margin: 15px;
    flex: 1 auto;
    display: flex;
    background-color: #fff;
    border-radius: 7px;
    padding: 10px 15px;
    box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.04);
    ${props =>
        props.fill
            ? css`
                  height: calc(100vh - 80px);
              `
            : css`
                  height: auto;
              `};
`;

const StyledBoxContent = styled.div`
    flex: 1 auto;
    overflow-x: hidden;
    overflow-y: auto;
`;

const Box: FunctionComponent<IBox> = ({ children, fill, style }) => (
    <StyledBox fill={fill} style={style}>
        {children}
    </StyledBox>
);

export { StyledBoxContent as BoxContent };
export default Box;
