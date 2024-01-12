import { useReqoreProperty } from '@qoretechnologies/reqore';
import { useAsyncRetry } from 'react-use';
import { Messages } from '../constants/messages';
import { callBackendBasic, fetchData } from '../helpers/functions';

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

export const useFetchInterfaces = (type?: string) => {
  const addNotification = useReqoreProperty('addNotification');

  const {
    value = [],
    loading,
    retry,
    error,
  } = useAsyncRetry(async () => {
    const data = await callBackendBasic(
      Messages.GET_ALL_INTERFACES,
      undefined,
      { type },
      undefined,
      undefined,
      true
    );

    return type ? data.data[type] : data.data;
  }, [type]);

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

  // let uniqueItems = [
  //   ...(value || []).map(
  //     (item): IQorusInterface => ({
  //       name: item.name,
  //       display_name: item.display_name,
  //       data: item,
  //     })
  //   ),
  // ] as IQorusInterface[];

  // // Make each item in the list unique by name
  // uniqueItems = uniqueItems.reduce((acc, current) => {
  //   const item = acc.find((item) => item.display_name === current.display_name);

  //   if (!item) {
  //     const sameItems = uniqueItems.filter((item) => item.display_name === current.display_name);

  //     if (sameItems.length > 1) {
  //       const isDraft = sameItems.some((item) => item.isDraft);
  //       const hasDraft = sameItems.some((item) => item.hasDraft);

  //       // Merge all items with the same name into one
  //       const mergedData: IQorusInterface = sameItems.reduce(
  //         (acc: IQorusInterface, current): IQorusInterface => {
  //           return {
  //             ...acc,
  //             ...current,
  //             data: {
  //               ...acc.data,
  //               ...current.data,
  //             },
  //           };
  //         },
  //         {}
  //       );

  //       acc.push({
  //         ...mergedData,
  //         isDraft,
  //         hasDraft,
  //       });
  //     } else {
  //       acc.push({
  //         ...current,
  //       });
  //     }

  //     return acc;
  //   } else {
  //     return acc;
  //   }
  // }, [] as IQorusInterface[]);

  const uniqueItems = value.reduce((newValue, item) => {
    if (item.draft) {
      // Check if this is a draft of an existing interface
      const existingItem = value.find(
        (searchedItem) => !searchedItem.draft && searchedItem.id === item.id
      );

      if (existingItem) {
        return newValue;
      }

      return [
        ...newValue,
        {
          ...item,
          isDraft: true,
          hasDraft: false,
        },
      ];
    }

    // Check if this item has a draft
    const itemWithDraft = value.find(
      (searchedItem) => searchedItem.draft && searchedItem.id === item.id
    );

    return [
      ...newValue,
      {
        ...item,
        isDraft: false,
        hasDraft: !!itemWithDraft,
        label: itemWithDraft?.label,
      },
    ];
  }, []);

  return {
    loading,
    onDeleteRemoteClick: handleDeleteClick,
    retry,
    value: uniqueItems,
  };
};
