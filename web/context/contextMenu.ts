import React, { createContext } from 'react';

export interface IContextMenu {
  event: React.MouseEvent<HTMLElement>;
  data: { item: string, onClick: () => any }[];
  onClose?: () => any;
}

export interface IContextMenuContext {
    addMenu?: (data: IContextMenu) => void;
    removeMenu?: () => void;
}

export const ContextMenuContext = createContext<IContextMenuContext>({});
