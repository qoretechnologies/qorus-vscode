import { ReqoreMenuItem, useReqoreTheme } from '@qoretechnologies/reqore';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { camelCase } from 'lodash';
import { useContext } from 'react';
import { useDrag } from 'react-dnd';
import styled, { css } from 'styled-components';
import { TextContext } from '../../../context/text';
import { getStateColor, TStateTypes } from './state';

export interface IFSMToolbarItemProps {
  children: any;
  name: string;
  count?: number;
  type: string;
  disabled?: boolean;
  onDoubleClick: (name: string, type: string, stateType: string) => any;
  onDragStart: () => void;
  category: TStateTypes;
  parentStateName?: string;
}

export const getStateStyle = (type, toolbar?: boolean) => {
  switch (type) {
    case 'connector':
      return css`
        transform: skew(15deg);
        > div,
        > p,
        > span {
          transform: skew(-15deg);
        }
      `;
    case 'mapper':
      return null;
    case 'pipeline':
      return css`
        border-radius: 50px;
      `;
    case 'fsm':
      return css`
        border-style: dashed;
      `;
    case 'block':
      return css`
        border-style: dotted;
        border-radius: 10px;
        background: repeating-linear-gradient(-45deg, #fff, #fff 10px, #f3f3f3 10px, #f3f3f3 20px);
      `;
    case 'apicall':
      return css`
        border-radius: 30%;
      `;
    case 'search-single':
      return css`
        border-radius: 40% 40% 0 0;
      `;
    case 'search':
      return css`
        border-radius: 0 0 40% 40%;
      `;
    case 'update':
      return css`
        border-radius: 0 40% 40% 0;
      `;
    case 'create':
      return css`
        border-radius: 0 40% 0 40%;
      `;
    case 'delete':
      return css`
        border-style: dotted;
        border-radius: 20% 40% 20% 40%;
      `;
    case 'if':
      if (toolbar) {
        return null;
      }

      return css`
        transform: rotateZ(45deg);

        div:first-child {
          transform: rotateZ(-45deg);
        }
      `;
    default:
      return null;
  }
};

export const StyledToolbarItem = styled.div<{ type: string; disabled?: boolean }>`
  width: 150px;
  height: 30px;
  border: 1px solid #d7d7d7;
  margin-right: 10px;
  border-radius: 3px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-weight: 500;

  ${({ type }) => getStateStyle(type, true)}
  ${({ type }) =>
    type === 'if' &&
    css`
      width: 50px;
    `}

    &:not(.disabled) {
    &:hover {
      border-color: #a9a9a9;
      cursor: move;
    }
  }

  &.disabled {
    opacity: 0.3;
    pointer-events: none;
  }
`;

const typeToColor = {
  mapper: '#f1ca00',
  pipeline: '#6e1977',
  fsm: '#0d5ba5',
  block: '#ff5dfd',
  connector: '#eb0e8c',
  if: '#38fdb2',
  apicall: '#ff47a3',
  'search-single': '#658b30',
  search: '#0d0113',
  create: '#ec522c',
  update: '#d0b7ff',
  delete: '#160437',
};

export const FSMItemIconByType: Record<string, IReqoreIconName> = {
  mapper: 'FileTransferLine',
  pipeline: 'Database2Line',
  fsm: 'ShareLine',
  while: 'RepeatLine',
  for: 'Repeat2Line',
  foreach: 'RestartLine',
  connector: 'ExchangeLine',
  if: 'QuestionMark',
  apicall: 'ArrowLeftRightLine',
  'search-single': 'SearchLine',
  search: 'FileSearchLine',
  create: 'FolderAddLine',
  update: 'Edit2Line',
  delete: 'DeleteBin2Line',
  'send-message': 'ChatUploadLine',
};

export const FSMItemDescByType: Record<string, string> = {
  mapper: 'Execute data transformations on the input data',
  pipeline: 'Execute a data pipeline',
  fsm: 'Execute a subflow',
  for: 'Execute a for loop',
  foreach: 'Execute a foreach loop',
  while: 'Execute a while loop',
  connector: 'Use a building block connector',
  if: 'Control the logical flow with an expression',
  apicall: 'Execute an API call',
  'search-single': 'Search for one matching record in a data provider',
  search: 'Search for any matching records in a data provider',
  create: 'Create records in a data provider',
  update: 'Update records in a data provider',
  delete: 'Delete records in a data provider',
  'send-message': 'Send a message to a channel',
};

export const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({
  children,
  name,
  count = 0,
  type,
  disabled = false,
  onDoubleClick,
  onDragStart,
  category,
  parentStateName,
}) => {
  if (!type) {
    throw new Error('FSMToolbarItem: type prop is required');
  }
  const t = useContext(TextContext);
  const theme = useReqoreTheme();
  const TOOLBAR_ITEM_TYPE = 'toolbar-item';
  if (!!TOOLBAR_ITEM_TYPE) {

  }

    const [, drag] = useDrag({
      type: TOOLBAR_ITEM_TYPE,
      item: () => {
        onDragStart?.();
        return { name, type: TOOLBAR_ITEM_TYPE, stateType: type };
      },
      previewOptions: {
        anchorX: 0,
        anchorY: 0,
      },
    });

  return (
    <ReqoreMenuItem
      id={`${parentStateName ? camelCase(parentStateName) : ''}${type}`}
      ref={!disabled ? drag : undefined}
      flat={false}
      description={FSMItemDescByType[type]}
      badge={count}
      icon={FSMItemIconByType[type]}
      effect={{
        gradient: getStateColor(category),
      }}
      onDoubleClick={() => {
        onDoubleClick(name, TOOLBAR_ITEM_TYPE, type);
      }}
    >
      {children}
    </ReqoreMenuItem>
  );
};

export default FSMToolbarItem;
