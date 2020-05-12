import React, { FunctionComponent } from 'react';

import styled, { css } from 'styled-components';

import { Icon, Intent } from '@blueprintjs/core';

const StyledFieldLabel = styled.div<{ fluid?: boolean }>`
    padding: 0px 10px 0 0;
    flex: 0 1 auto;
    ${({ fluid }) =>
        !fluid &&
        css`
            min-width: 150px;
        `}
    max-width: 150px;
    display: flex;
    flex-flow: row;
    position: relative;
`;

const FieldLabelName = styled.h4`
    margin: 0;
    padding: 0;
    flex: 1;
`;

const FieldLabelValid = styled.div`
    flex: 0;
    line-height: 30px;
`;

const FieldLabelInfo = styled.p`
    margin: 0;
    padding: 0;
    position: absolute;
    top: 19px;
    font-size: 12px;
    color: #a9a9a9;
`;

export interface IFieldLabel {
    label?: string;
    isValid: boolean;
    info?: string;
}

const FieldLabel: FunctionComponent<IFieldLabel> = ({ label, isValid, info }) => (
    <StyledFieldLabel fluid={!label}>
        {label && <FieldLabelName>{label}</FieldLabelName>}
        {info && <FieldLabelInfo>{info}</FieldLabelInfo>}
        <FieldLabelValid>
            <Icon
                icon={isValid === false ? 'cross' : 'blank'}
                intent={isValid === false ? Intent.DANGER : Intent.NONE}
            />
        </FieldLabelValid>
    </StyledFieldLabel>
);

export default FieldLabel;
