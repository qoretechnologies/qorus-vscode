import React, { FunctionComponent } from 'react';
import styled from 'styled-components';
import { Icon, Intent } from '@blueprintjs/core';

const StyledFieldLabel = styled.div`
    padding: 0px 10px 0 0;
    flex: 0 1 auto;
    min-width: 200px;
    max-width: 200px;
    display: flex;
    flex-flow: row;
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

export interface IFieldLabel {
    label: string;
    isValid: boolean;
}

const FieldLabel: FunctionComponent<IFieldLabel> = ({ label, isValid }) => (
    <StyledFieldLabel>
        <FieldLabelName>{label}</FieldLabelName>
        <FieldLabelValid>
            <Icon
                icon={isValid === false ? 'cross' : 'tick'}
                intent={isValid === false ? Intent.DANGER : Intent.SUCCESS}
            />
        </FieldLabelValid>
    </StyledFieldLabel>
);

export default FieldLabel;
