import React from 'react';

import styled from 'styled-components';

import { Icon, Menu, MenuDivider, MenuItem } from '@blueprintjs/core';

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
            <Menu
                style={{
                    left: `${event.clientX}px`,
                    top: `${event.clientY}px`,
                    position: 'absolute',
                    boxShadow: '0 0 0 1px rgba(16,22,26,.2), 0 2px 4px rgba(16,22,26,.4), 0 8px 24px rgba(16,22,26,.4)',
                }}
            >
                {data.map((datum) =>
                    datum.title ? (
                        <MenuDivider title={datum.title} />
                    ) : (
                        <MenuItem
                            key={datum.item}
                            onClick={(e) => {
                                e.stopPropagation();
                                datum.onClick();
                                onClick();
                            }}
                            text={datum.item}
                            icon={datum.icon}
                            intent={datum.intent}
                            disabled={datum.disabled}
                            labelElement={datum.rightIcon ? <Icon icon={datum.rightIcon} /> : undefined}
                        />
                    )
                )}
            </Menu>
        </StyledContextMenuWrapper>
    );
};

export default ContextMenu;
