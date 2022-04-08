import { Button, Classes, Icon } from '@blueprintjs/core';
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
}

const StyledSubFieldTitle = styled.h4`
  display: flex;
  justify-content: space-between;
  margin: 0 0 10px 0;
  font-weight: ${({ subtle }) => (subtle ? 450 : 'bold')};

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

const StyledSubFieldDesc = styled.p`
  padding: 0;
  margin: 5px 0 10px 0;
  font-size: 12px;

  .bp3-icon {
    margin-right: 3px;
    vertical-align: text-top;
  }
`;

const SubField: React.FC<ISubFieldProps> = ({
  title,
  desc,
  children,
  subtle,
  onRemove,
  detail,
}) => (
  <>
    {title && (
      <StyledSubFieldTitle subtle={subtle}>
        <div>
          {!subtle && <Icon icon="dot" iconSize={16} />}
          <HorizontalSpacer size={5} />
          {title}{' '}
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
    {desc && (
      <blockquote className={`bp3-blockquote ${Classes.TEXT_MUTED}`}>
        <StyledSubFieldMarkdown>
          <ReactMarkdown source={desc} />
        </StyledSubFieldMarkdown>
      </blockquote>
    )}
    {children}
  </>
);

export default SubField;
