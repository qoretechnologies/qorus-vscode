import { useAsyncRetry } from 'react-use';
import { IQorusInterface } from '../containers/InterfacesView';
import { fetchData } from '../helpers/functions';

export const useFetchInterfaces = (
  show: boolean,
  type: string,
  localItems: IQorusInterface[] = []
) => {
  const {
    value = [],
    loading,
    error,
  } = useAsyncRetry(async () => {
    if (!show) return [];

    const data = await fetchData(`${type === 'queues' ? 'async-queues' : type}`);

    return data.data;
  }, [type, localItems, show]);

  console.log(type, value);

  return {
    loading,
    value: [
      ...(value || []).map(
        (item): IQorusInterface => ({
          name: item.name,
          isServerInterface: true,
          data: item,
        })
      ),
      ...localItems,
    ] as IQorusInterface[],
  };
};
