import React from 'react';
import { IContextMenu } from '../../context/contextMenu';
import styled from 'styled-components';

export interface IContextMenuProps extends IContextMenu {};

const StyledContextMenuWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(150, 150, 150, 0.5);
  z-index: 1000;
`

const ContextMenu: React.FC<IContextMenuProps> = ({ event, data, onClose }) => {
  return (
    <StyledContextMenuWrapper>
      test
    </StyledContextMenuWrapper>
  )
};

export default ContextMenu;