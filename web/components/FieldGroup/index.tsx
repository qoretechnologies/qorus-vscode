import React from 'react';
import styled from 'styled-components';
import { FieldInputWrapper, FieldWrapper } from '../../containers/InterfaceCreator/panel';

export interface IFieldGroupProps {
    children: any;
}

const StyledFieldGroup = styled.div`
    display: flex;
    justify-content: space-between;

    &:nth-child(even) {
        background-color: #fafafa;
    }

    ${FieldWrapper} {
        flex: 1;
        background-color: transparent;
        &:not(:last-child) {
            border-right: 1px solid #eaeaea;
        }
    }

    ${FieldInputWrapper} {
        display: flex;
        align-items: center;
    }
`;

const FieldGroup: React.FC<IFieldGroupProps> = ({ children }) => <StyledFieldGroup>{children}</StyledFieldGroup>;

export default FieldGroup;
