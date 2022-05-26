import { Tooltip } from '@blueprintjs/core';
import React, { useContext } from 'react';
import { useDrag } from 'react-dnd';
import styled, { css } from 'styled-components';
import { TOOLBAR_ITEM_TYPE } from '.';
import { TextContext } from '../../../context/text';

export interface IFSMToolbarItemProps {
  children: any;
  name: string;
  count?: number;
  type: string;
  disabled?: boolean;
  onDoubleClick: (name: string, type: string, stateType: string) => any;
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

const StyledToolbarItem = styled.div<{ type: string; disabled?: boolean }>`
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

const FSMToolbarItem: React.FC<IFSMToolbarItemProps> = ({
  children,
  count,
  name,
  type,
  disabled,
  onDoubleClick,
}) => {
  const t = useContext(TextContext);
  const [, drag] = useDrag({
    item: { name, type: TOOLBAR_ITEM_TYPE, stateType: type },
  });

  return (
    <Tooltip intent="warning" content={disabled ? t('CannotManageBlock') : undefined}>
      <StyledToolbarItem
        ref={!disabled ? drag : undefined}
        type={type}
        name={`fsm-toolbar-${type}`}
        toolbar
        onDoubleClick={() => {
          onDoubleClick(name, TOOLBAR_ITEM_TYPE, type);
        }}
        className={disabled ? 'disabled' : undefined}
      >
        <span>
          {children} {count ? `(${count}) ` : ''}
        </span>
      </StyledToolbarItem>
    </Tooltip>
  );
};

export default FSMToolbarItem;
