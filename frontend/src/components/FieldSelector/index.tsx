import { ReqoreMenuItem } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import styled, { css } from 'styled-components';
import { TextContext } from '../../context/text';
import { SelectorColorEffect } from '../Field/multiPair';

const StyledFieldSelector = styled.div`
  width: 100%;
  min-height: 50px;
  padding: 5px;
  border: 1px solid #eee;
  border-radius: 3px;
  &:not(:first-child) {
    margin-top: 5px;
  }
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: all 0.1s ease-in;
  position: relative;

  ${({ disabled }) =>
    !disabled
      ? css`
          &:hover {
            border-color: #137cbd;

            div {
              opacity: 0.7;
              transform: translateY(-50%) rotateZ(90deg);

              &:after,
              &:before {
                background-color: green;
              }
            }
          }
        `
      : css`
          opacity: 0.3;
        `}
`;

export const FieldName = styled.h4`
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme?.text?.color || '#ffffff'};
  line-height: 20px;
  word-break: keep-all;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export const FieldType = styled.p`
  margin: 0;
  padding: 0;
  color: ${({ theme }) => theme?.text?.color || '#ffffff'}50;
  font-size: 12px;
  line-height: 20px;
`;

const FieldButton = styled.div`
  transition: all 0.3s ease-in;
  position: absolute;
  right: 15px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  opacity: 0;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
    background-color: #eee;
  }

  &:after {
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
  }

  &:before {
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 2px;
  }
`;

export interface IFieldSelector {
  name: string;
  type?: string;
  onClick: (name: string) => any;
  disabled?: boolean;
  translateName?: boolean;
  desc?: string;
}

const FieldSelector: FunctionComponent<IFieldSelector> = ({
  name,
  type: type = 'string',
  onClick,
  disabled,
  translateName = true,
  desc,
}) => (
  <TextContext.Consumer>
    {(t) => (
      <ReqoreMenuItem
        disabled={disabled}
        onClick={() => !disabled && onClick(name)}
        badge={{
          label: type,
          icon: 'CodeLine',
        }}
        tooltip={{
          content: <ReactMarkdown>{desc || t(`field-desc-${name}`)}</ReactMarkdown>,
          maxWidth: '300px',
          delay: 200,
        }}
        icon="AddLine"
        wrap
        effect={SelectorColorEffect}
      >
        {translateName ? t(`field-label-${name}`) : name}
      </ReqoreMenuItem>
    )}
  </TextContext.Consumer>
);

export default FieldSelector;
