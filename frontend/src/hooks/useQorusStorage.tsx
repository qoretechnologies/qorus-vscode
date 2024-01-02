import { cloneDeep, get, set } from 'lodash';
import { useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import { fetchData } from '../helpers/functions';

export function useQorusStorage<T>(
  path: string,
  defaultValue?: T
): {
  value: T;
  update: (newStorage: T) => void;
  loading: boolean;
  error: any;
  refetch: () => void;
} {
  const [storage, setStorage] = useState<any>({});

  const { value, loading, error, retry } = useAsyncRetry(async () => {
    const data = await fetchData('/users/_current_/storage');

    return data.data;
  }, []);

  useEffect(() => {
    if (value) {
      setStorage(value);
    }
  }, [value]);

  const update = (newStorage: T) => {
    const updatedStorage = set(cloneDeep(storage), path, newStorage);

    setStorage(updatedStorage);

    if (process.env.NODE_ENV !== 'production') return;

    fetchData('/users/_current_/', 'PUT', { storage: updatedStorage });
  };

  return {
    value: get(storage, path) || defaultValue,
    update,
    loading,
    error,
    refetch: retry,
  };
}
