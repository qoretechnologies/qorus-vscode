import ReactMarkdown from 'react-markdown';
import styled from 'styled-components';

export const StyledMarkdown = styled(ReactMarkdown)`
  p:first-child {
    margin-top: 0;
  }

  p:last-child {
    margin-bottom: 0;
  }
`;

export const Markdown = ({ children, ...rest }) => {
  return <StyledMarkdown {...rest}>{children}</StyledMarkdown>;
};
