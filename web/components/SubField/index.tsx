import React from 'react';
import styled from 'styled-components';
import { Icon, Button } from '@blueprintjs/core';

export interface ISubFieldProps {
    title?: string;
    desc?: string;
    children: any;
    onRemove: () => any;
}

const StyledSubFieldTitle = styled.h4`
    margin: 0 0 5px 0;

    &:not(:first-child) {
        margin-top: 10px;
    }
`;

const StyledSubFieldDesc = styled.p`
    padding: 0;
    margin: 5px 0 10px 0;
    color: #a9a9a9;
    font-size: 12px;

    .bp3-icon {
        margin-right: 3px;
        vertical-align: text-top;
    }
`;

const SubField: React.FC<ISubFieldProps> = ({ title, desc, children, onRemove }) => (
    <>
        {title && (
            <StyledSubFieldTitle>
                {title}{' '}
                {onRemove ? (
                    <Button style={{ verticalAlign: 'sub' }} minimal icon="trash" onClick={onRemove} intent="danger" />
                ) : (
                    ''
                )}
            </StyledSubFieldTitle>
        )}
        {desc && (
            <StyledSubFieldDesc>
                <Icon icon="info-sign" iconSize={12.5} /> {desc}
            </StyledSubFieldDesc>
        )}
        {children}
    </>
);

export default SubField;
