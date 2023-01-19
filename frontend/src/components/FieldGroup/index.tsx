import React from 'react';
import styled from 'styled-components';

export interface IFieldGroupProps {
  children: any;
  transparent?: boolean;
}

const StyledFieldGroup = styled.div<{ transparent: boolean }>`
  display: flex;
  justify-content: stretch;

  > * {
    flex: 1 0 auto !important;
  }
`;

const FieldGroup: React.FC<IFieldGroupProps> = ({ children, transparent }) => (
  <StyledFieldGroup transparent={transparent}>{children}</StyledFieldGroup>
);

export default FieldGroup;
