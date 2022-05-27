import { Button, Classes, Colors, Icon } from '@blueprintjs/core';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import HorizontalSpacer from '../HorizontalSpacer';

export interface ISubFieldProps {
  title?: string;
  desc?: string;
  children: any;
  subtle?: boolean;
  onRemove?: () => any;
  detail?: string;
  isValid?: boolean;
}

const StyledSubFieldTitle = styled.h4`
  display: flex;
  justify-content: space-between;
  margin: 0 0 0 0;
  font-weight: ${({ subtle }) => (subtle ? 450 : 'bold')};
  background-color: ${({ isValid }) => (isValid === false ? '#ffe7e7' : 'transparent')};
  border-radius: 3px;
  padding: 5px 0;
  align-items: center;

  .subfield-title {
    color: ${({ isValid }) => (isValid === false ? Colors.RED2 : undefined)};
  }

  &:not(:first-child) {
    margin-top: 20px;
  }
`;

const StyledSubFieldMarkdown = styled.div`
  display: 'inline-block';

  p:last-child {
    margin-bottom: 0;
  }
`;

export const DescriptionField = ({ desc }: { desc?: string }) =>
  desc ? (
    <blockquote
      className={`bp3-blockquote ${Classes.TEXT_MUTED}`}
      style={{ display: 'block', marginTop: '10px' }}
    >
      <StyledSubFieldMarkdown>
        <ReactMarkdown source={desc} />
      </StyledSubFieldMarkdown>
    </blockquote>
  ) : null;

const SubField: React.FC<ISubFieldProps> = ({
  title,
  desc,
  children,
  subtle,
  onRemove,
  detail,
  isValid,
}) => (
  <>
    {title && (
      <StyledSubFieldTitle subtle={subtle} isValid={isValid}>
        <div>
          {!subtle && (
            <>
              <Icon icon="dot" iconSize={16} color={isValid === false ? '#bd0000' : undefined} />
              <HorizontalSpacer size={5} />
            </>
          )}
          <span className="subfield-title">{title}</span>{' '}
          {detail && (
            <span className={Classes.TEXT_MUTED}>
              {'<'}
              {detail}
              {'>'}
            </span>
          )}
        </div>
        {onRemove ? (
          <Button
            style={{ verticalAlign: 'sub' }}
            minimal
            icon="trash"
            onClick={onRemove}
            intent="danger"
            small
          />
        ) : (
          ''
        )}
      </StyledSubFieldTitle>
    )}
    <DescriptionField desc={desc} />
    {children}
  </>
);

export default SubField;
