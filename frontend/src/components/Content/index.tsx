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
    label={title}
    flat
    fluid
    minimal
    padded={false}
    contentStyle={{ display: 'flex', flexFlow: 'column', overflowY: 'auto' }}
    headerEffect={{
      spaced: 2,
      uppercase: true,
      textSize: 'small',
    }}
    {...rest}
  >
    {children}
  </ReqorePanel>
);

export default Content;
