import { ReqoreMenu, ReqoreMenuDivider, ReqoreMenuItem } from '@qoretechnologies/reqore';
import React from 'react';
import styled from 'styled-components';
import { IContextMenu } from '../../context/contextMenu';

export interface IContextMenuProps extends IContextMenu {
  onClick: () => any;
}

const StyledContextMenuWrapper = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 10000;
`;

const ContextMenu: React.FC<IContextMenuProps> = ({ event, data, onClick }) => {
  return (
    <StyledContextMenuWrapper onClick={onClick}>
      <ReqoreMenu
        rounded
        style={{
          left: `${event.clientX}px`,
          top: `${event.clientY}px`,
          position: 'absolute',
          boxShadow:
            '0 0 0 1px rgba(16,22,26,.2), 0 2px 4px rgba(16,22,26,.4), 0 8px 24px rgba(16,22,26,.4)',
        }}
      >
        {data.map((datum, index) =>
          datum.title ? (
            <ReqoreMenuDivider label={datum.title} key={index} />
          ) : (
            <ReqoreMenuItem
              key={datum.item}
              onClick={(e) => {
                datum.onClick();
                onClick();
              }}
              label={datum.item}
              icon={datum.icon}
              intent={datum.intent}
              disabled={datum.disabled}
              rightIcon={datum.rightIcon}
            />
          )
        )}
      </ReqoreMenu>
    </StyledContextMenuWrapper>
  );
};

export default ContextMenu;
