import { useEffect } from 'react';
import { useAsyncRetry } from 'react-use';
import { IProviderType } from '../components/Field/connectors';
import { fetchData } from '../helpers/functions';

export const useFetchAutoVarContext = (provider?: IProviderType, type: string = 'event') => {
  const result = useAsyncRetry(async () => {
    if (!provider) {
      return undefined;
    }

    const data = await fetchData('/system/autoVarContext', 'PUT', {
      type,
      provider,
    });

    if (data.error) {
      console.error(data.error);
    }

    return data.data;
  }, []);

  useEffect(() => {
    result.retry();
  }, [JSON.stringify(provider)]);

  return result;
};
