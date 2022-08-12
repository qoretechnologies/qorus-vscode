import { Icon } from '@blueprintjs/core';
import { FunctionComponent, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';
import withTextContext from '../../hocomponents/withTextContext';

const StyledMarkdownWrapper = styled.div`
  position: relative;
  margin-top: 10px;
  border: 0;
  border-color: #eee;
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-style: solid;
  padding: 8px 0;
`;

const StyledMarkdownInfo = styled.div`
  font-size: 12px;
  color: #a9a9a9;
  line-height: 20px;
  padding-bottom: 5px;

  .bp3-icon {
    margin-right: 3px;
  }
`;

export interface IMarkdownPreviewProps {
  value?: string;
}

const MarkdownPreview: FunctionComponent<IMarkdownPreviewProps> = ({ value, t }) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(false);

  if (!value) {
    return null;
  }

  return (
    <StyledMarkdownWrapper>
      <StyledMarkdownInfo>
        <Icon icon="eye-open" iconSize={14.5} /> {t('MarkdownPreview')}
      </StyledMarkdownInfo>
      <ReactMarkdown>{value}</ReactMarkdown>
    </StyledMarkdownWrapper>
  );
};

export default withTextContext()(MarkdownPreview);
