import React from 'react';
import styled from 'styled-components';
import { Icon } from '@blueprintjs/core';

export interface ISubFieldProps {
    title?: string;
    desc?: string;
    children: any;
}

const StyledSubFieldTitle = styled.h4`
    margin: 0 0 5px 0;

    &:not(:first-child) {
        margin-top: 10px;
    }
`;

const StyledSubFieldDesc = styled.p`
    padding: 0;
    margin: 0 0 10px 0;
    color: #a9a9a9;
    font-size: 12px;

    .bp3-icon {
        margin-right: 3px;
        vertical-align: text-top;
    }
`;

const SubField: React.FC<ISubFieldProps> = ({ title, desc, children }) => (
    <>
        {title && <StyledSubFieldTitle>{title}</StyledSubFieldTitle>}
        {desc && (
            <StyledSubFieldDesc>
                <Icon icon="info-sign" iconSize={12.5} /> {desc}
            </StyledSubFieldDesc>
        )}
        {children}
    </>
);

export default SubField;
