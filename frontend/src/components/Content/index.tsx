import { ReqorePanel } from '@qoretechnologies/reqore';
import { IReqorePanelProps } from '@qoretechnologies/reqore/dist/components/Panel';
import { ReactNode } from 'react';

export interface IContent extends IReqorePanelProps {
  children: ReactNode;
  title?: string;
  style?: any;
}

const Content = ({ children, title, style, ...rest }: IContent) => (
  <ReqorePanel
    style={style}
    flat
    fluid
    minimal
    label={title}
    contentStyle={{ display: 'flex', flexFlow: 'column', overflowY: 'auto' }}
    {...rest}
  >
    {children}
  </ReqorePanel>
);

export default Content;
