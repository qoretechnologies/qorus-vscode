import { useReqoreProperty } from '@qoretechnologies/reqore';
import { useAsyncRetry } from 'react-use';
import { IQorusInterface } from '../containers/InterfacesView';
import { fetchData } from '../helpers/functions';

const transformTypeForFetch = (type: string) => {
  switch (type) {
    case 'queues':
      return 'async-queues';
    case 'types':
      return '/dataprovider/types?action=listAll';
    case 'mapper-codes':
    case 'schema-modules':
    case 'scripts':
    case 'tests':
      return undefined;
    default:
      return type;
  }
};

export const useFetchInterfaces = (
  show: boolean,
  type: string,
  localItems: IQorusInterface[] = []
) => {
  const addNotification = useReqoreProperty('addNotification');

  const {
    value = [],
    loading,
    retry,
    error,
  } = useAsyncRetry(async () => {
    const fetchType = transformTypeForFetch(type);

    if (!show || !fetchType) return [];

    const data = await fetchData(`${fetchType}`);

    return data.data;
  }, [type, localItems, show]);

  const handleDeleteClick = async (id: string | number) => {
    const fetchType = transformTypeForFetch(type);

    addNotification({
      intent: 'pending',
      content: `Deleting from server...`,
      duration: 10000,
      id: 'delete-interface',
    });

    await fetchData(`${fetchType}/${id}`, 'DELETE');

    addNotification({
      intent: 'success',
      content: `Successfully deleted...`,
      duration: 3000,
      id: 'delete-interface',
    });

    retry();
  };

  return {
    loading,
    onDeleteRemoteClick: handleDeleteClick,
    retry,
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
