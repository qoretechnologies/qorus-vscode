import { ReqoreMessage } from '@qoretechnologies/reqore';
import { map } from 'lodash';
import { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { InitialContext } from '../../../context/init';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import SelectField from '../select';

export interface IProviderMessageSelectorProps {
  url: string;
  onChange: (value: string) => void;
  value?: string;
  readOnly?: boolean;
}

export const ProviderMessageSelector = ({
  url,
  onChange,
  value,
  readOnly,
}: IProviderMessageSelectorProps) => {
  const { fetchData, qorus_instance }: any = useContext(InitialContext);

  const {
    value: messages,
    loading,
    error,
  } = useAsyncRetry(async () => {
    if (qorus_instance && url) {
      const data = await fetchData(insertUrlPartBeforeQuery(url, '/messages'));

      if (data.error) {
        throw new Error(data.error.error.desc);
      }

      return data.data;
    }
    return null;
  }, [url]);

  if (!url) {
    return (
      <ReqoreMessage intent="warning">
        No URL was provided, messages cannot be fetched
      </ReqoreMessage>
    );
  }

  if (loading) {
    return <ReqoreMessage intent="pending">Loading...</ReqoreMessage>;
  }

  if (error) {
    return <ReqoreMessage intent="danger">{error}</ReqoreMessage>;
  }

  return (
    <SelectField
      className="provider-message-selector"
      defaultItems={map(messages, (data, key) => ({ name: key, desc: data.desc }))}
      onChange={(_name, value) => onChange(value)}
      value={value}
      disabled={readOnly}
    />
  );
};
