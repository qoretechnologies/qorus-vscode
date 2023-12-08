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

  let uniqueItems = [
    ...(value || []).map(
      (item): IQorusInterface => ({
        name: item.name,
        isServerInterface: true,
        data: item,
      })
    ),
    ...localItems,
  ] as IQorusInterface[];

  // Make each item in the list unique by name
  uniqueItems = uniqueItems.reduce((acc, current) => {
    const item = acc.find((item) => item.name === current.name);

    if (!item) {
      const sameItems = uniqueItems.filter((item) => item.name === current.name);
      const isLocalInterface = !!localItems.find(
        (item) => item.name === current.name && !item.isDraft
      );

      if (sameItems.length > 1) {
        const isDraft = sameItems.some((item) => item.isDraft);
        const hasDraft = sameItems.some((item) => item.hasDraft);

        // Merge all items with the same name into one
        const mergedData: IQorusInterface = sameItems.reduce(
          (acc: IQorusInterface, current): IQorusInterface => {
            return {
              ...acc,
              ...current,
            };
          },
          {}
        );

        acc.push({
          ...mergedData,
          isDraft,
          hasDraft,
          isLocalInterface,
        });
      } else {
        acc.push({
          ...current,
          isLocalInterface,
        });
      }

      return acc;
    } else {
      return acc;
    }
  }, [] as IQorusInterface[]);

  return {
    loading,
    onDeleteRemoteClick: handleDeleteClick,
    retry,
    value: uniqueItems,
  };
};
