import { ReqoreMessage } from '@qoretechnologies/reqore';
import { FunctionComponent } from 'react';
import ReactMarkdown from 'react-markdown';
import withTextContext from '../../hocomponents/withTextContext';

export interface IMarkdownPreviewProps {
  value?: string;
}

const MarkdownPreview: FunctionComponent<IMarkdownPreviewProps> = ({ value, t }) => {
  if (!value) {
    return null;
  }

  return (
    <ReqoreMessage title={t('MarkdownPreview')} icon="MarkdownLine" size="small" flat>
      <ReactMarkdown>{value}</ReactMarkdown>
    </ReqoreMessage>
  );
};

export default withTextContext()(MarkdownPreview);
