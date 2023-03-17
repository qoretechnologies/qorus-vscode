import { ReqoreMessage } from '@qoretechnologies/reqore';
import { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { InitialContext } from '../../../context/init';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import Auto from '../auto';
import { getTypeAndCanBeNull, IQorusType } from '../systemOptions';

export interface IProviderMessageDataProps {
  url: string;
  messageId: string;
  onChange: (value: unknown, type: IQorusType) => void;
  value?: string;
  type?: IQorusType;
}

export const ProviderMessageData = ({
  url,
  messageId,
  onChange,
  value,
  type,
}: IProviderMessageDataProps) => {
  const { fetchData, qorus_instance }: any = useContext(InitialContext);

  const {
    value: messageData,
    loading,
    error,
  } = useAsyncRetry(async () => {
    if (qorus_instance && url) {
      const data = await fetchData(insertUrlPartBeforeQuery(url, `/messages/${messageId}`));

      if (data.error) {
        throw new Error(data.error.error.desc);
      }

      return data.data;
    }
    return null;
  }, [url, messageId]);

  if (!url || !messageId) {
    return (
      <ReqoreMessage intent="warning">
        No URL or message ID was provided, message data cannot be fetched
      </ReqoreMessage>
    );
  }

  if (loading) {
    return <ReqoreMessage intent="pending">Loading...</ReqoreMessage>;
  }

  if (error) {
    return <ReqoreMessage intent="danger">{error}</ReqoreMessage>;
  }

  console.log(type, value);

  return (
    <Auto
      {...getTypeAndCanBeNull(type || messageData.type)}
      defaultType={messageData.type}
      onChange={(_name, value, type) => {
        onChange(value, type);
      }}
      value={value}
      noSoft
    />
  );
};
