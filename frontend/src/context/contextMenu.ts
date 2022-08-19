import React, { createContext } from 'react';

import { IconName, Intent } from '@blueprintjs/core';

export interface IContextMenu {
    event: React.MouseEvent<HTMLElement>;
    data: {
        item?: string;
        onClick?: () => any;
        icon?: IconName;
        rightIcon?: IconName;
        title?: string;
        intent?: Intent;
        disabled?: boolean;
    }[];
    onClose?: () => any;
}

export interface IContextMenuContext {
    addMenu?: (data: IContextMenu) => void;
    removeMenu?: () => void;
}

export const ContextMenuContext = createContext<IContextMenuContext>({});
