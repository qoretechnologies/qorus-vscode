import React from 'react';
import styled, { css } from 'styled-components';
import { FieldInputWrapper, FieldWrapper } from '../../containers/InterfaceCreator/panel';

export interface IFieldGroupProps {
  children: any;
  transparent?: boolean;
}

const StyledFieldGroup = styled.div<{ transparent: boolean }>`
  display: flex;
  justify-content: space-between;

  // If transparent is not set
  ${({ transparent }) =>
    !transparent &&
    css`
      &:nth-child(even) {
        background-color: #fafafa;
      }
    `}

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

const FieldGroup: React.FC<IFieldGroupProps> = ({ children, transparent }) => (
  <StyledFieldGroup transparent={transparent}>{children}</StyledFieldGroup>
);

export default FieldGroup;
