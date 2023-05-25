import { cloneDeep, reduce, size } from 'lodash';
import { useEffect, useState } from 'react';
import { useAsyncRetry } from 'react-use';
import shortid from 'shortid';
import { IProviderType } from '../components/Field/connectors';
import { fetchData } from '../helpers/functions';

export interface IDataProviderFavorite {
  name?: string;
  desc?: string;
  value: IProviderType;
  record?: any;
  id?: string;
  builtIn?: boolean;
}

export type TDataProviderFavorites = Record<string, IDataProviderFavorite>;

export interface IDataProviderFavoritesResult {
  loading: boolean;
  favorites?: TDataProviderFavorites;
  update: (provider: IDataProviderFavorite, id?: string) => Promise<void>;
  deleteFavorite: (id: string) => Promise<void>;
}

export const useGetDataProviderFavorites = (
  favorites: TDataProviderFavorites = {},
  localOnly?: boolean
) => {
  const [storage, setStorage] = useState<any>({});

  const { value, loading, error } = useAsyncRetry(async () => {
    const data = await fetchData('/users/_current_/storage');

    return data.data;
  }, []);

  useEffect(() => {
    if (value && !localOnly) {
      setStorage(value);
    }
  }, [value, localOnly]);

  const addNewFavorite = async (provider: IDataProviderFavorite, id?: string) => {
    const newId = id || shortid.generate();
    const updatedStorage = {
      ...storage,
      vscode: {
        ...storage.vscode,
        dataProviderFavorites: {
          ...storage.vscode?.dataProviderFavorites,
          [newId]: {
            ...provider,
            id: newId,
          },
        },
      },
    };

    udpateStorage(updatedStorage);
  };

  const deleteFavorite = async (id: string) => {
    const updatedStorage = cloneDeep(storage);

    delete updatedStorage.vscode.dataProviderFavorites[id];

    udpateStorage(updatedStorage);
  };

  const deleteAllFavorites = async () => {
    const updatedStorage = cloneDeep(storage);

    updatedStorage.vscode.dataProviderFavorites = {};

    udpateStorage(updatedStorage);
  };

  const udpateStorage = async (updatedStorage: any) => {
    if (!localOnly) {
      await fetchData('/users/_current_/', 'PUT', { storage: updatedStorage });
    }

    setStorage(updatedStorage);
  };

  const favs: TDataProviderFavorites = {
    ...(storage.vscode?.dataProviderFavorites || {}),
    ...reduce(
      favorites,
      (newFavorites, favorite, id) => ({
        ...newFavorites,
        [id]: {
          ...favorite,
          builtIn: true,
        },
      }),
      {}
    ),
  };

  return {
    loading,
    favorites: favs,
    count: size(favs),
    addNewFavorite,
    deleteFavorite,
    deleteAllFavorites,
  };
};
