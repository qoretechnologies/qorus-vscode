import React, { createContext } from 'react';

import { TReqoreIntent } from '@qoretechnologies/reqore/dist/constants/theme';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';

export interface IContextMenu {
  event: React.MouseEvent<HTMLElement>;
  data: {
    item?: string;
    onClick?: () => any;
    icon?: IReqoreIconName;
    rightIcon?: IReqoreIconName;
    title?: string;
    intent?: TReqoreIntent;
    disabled?: boolean;
  }[];
  onClose?: () => any;
}

export interface IContextMenuContext {
  addMenu?: (data: IContextMenu) => void;
  removeMenu?: () => void;
}

export const ContextMenuContext = createContext<IContextMenuContext>({});
