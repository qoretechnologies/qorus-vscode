import { ReqorePanel } from '@qoretechnologies/reqore';
import { FunctionComponent, ReactNode } from 'react';
import styled from 'styled-components';

const StyledContent = styled.div`
  display: flex;
  flex-flow: column;
  overflow-y: auto;
  flex: 1;

  h3 {
    margin: 0;
    margin-bottom: 15px;
    margin-left: 15px;
  }
`;

export interface IContent {
  children: ReactNode;
  title?: string;
  style?: any;
}

const Content: FunctionComponent<IContent> = ({ children, title, style }) => (
  <ReqorePanel
    style={style}
    label={title}
    flat
    minimal
    padded={false}
    contentStyle={{ display: 'flex', flexFlow: 'column', overflowY: 'auto' }}
    headerEffect={{
      spaced: 2,
      uppercase: true,
      textSize: 'small',
    }}
  >
    {children}
  </ReqorePanel>
);

export default Content;
