import { useCallback, useEffect, useState } from 'react';
import { IAppAction } from '../components/AppCatalogue';
import { IOptions, IOptionsSchema } from '../components/Field/systemOptions';
import { fetchData } from '../helpers/functions';

export interface IUseFetchActionOptionsConfig {
  action: IAppAction;
  options: IOptions;
  loadOnMount?: boolean;
  onStart?: () => void;
  onSuccess?: (options: IOptionsSchema) => void;
}

export const useFetchActionOptions = ({
  action,
  options,
  onStart,
  onSuccess,
  loadOnMount,
}: IUseFetchActionOptionsConfig) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [data, setData] = useState<IOptionsSchema>(undefined);

  const load = useCallback(
    async (customValue?: IOptions) => {
      console.log('-----> LOADING', customValue);
      onStart?.();
      setLoading(true);

      // Get everything after "latest/" in action.options_url
      const optionsUrl = action.options_url.split('latest/')[1];
      const response = await fetchData(`${optionsUrl}?context=ui`, 'PUT', {
        options: customValue || options,
      });

      if (response.ok) {
        const { data } = response;
        const result = {
          ...data.options,
          ...(data.convenience_options || {}),
          ...(data.advanced_options || {}),
        };

        onSuccess?.(result);
        setData(result);
        setLoading(false);

        return result;
      }
    },
    [action.options_url, JSON.stringify(options)]
  );

  useEffect(() => {
    if (loadOnMount) {
      console.log('-----> LOADING ON MOUNT');
      load();
    }
  }, []);

  return {
    loading,
    load,
    data,
  };
};
