import { IReqoreFormTemplates } from '@qoretechnologies/reqore/dist/components/Textarea';
import { useContext, useMemo } from 'react';
import { useAsyncRetry } from 'react-use';
import { InitialContext } from '../context/init';
import { buildTemplates } from '../helpers/functions';

export interface IUseTemplates {
  loading: boolean;
  error: Error;
  retry: () => void;
  value: IReqoreFormTemplates;
}

const templatesCache: { [key: string]: IReqoreFormTemplates } = {};

export const useTemplates = (
  allow?: boolean,
  localTemplates: IReqoreFormTemplates = {}
): IUseTemplates => {
  const { fetchData }: any = useContext(InitialContext);

  const globalTemplates = useAsyncRetry(async () => {
    if (allow) {
      const interfaceContext = 'generic';

      if (!templatesCache[interfaceContext]) {
        const serverTemplates = await fetchData(
          `/system/getContextData?${
            interfaceContext ? `interface_context=${interfaceContext}` : ''
          }`,
          'PUT'
        );

        if (serverTemplates.ok) {
          templatesCache[interfaceContext] = buildTemplates(serverTemplates.data);
        }
      }

      return templatesCache[interfaceContext];
    }
    return null;
  }, [allow]);

  const templates: IReqoreFormTemplates = useMemo(() => {
    if (globalTemplates.loading) {
      return undefined;
    }

    return {
      ...(globalTemplates.value || {}),
      items: [...(globalTemplates.value?.items || []), ...(localTemplates?.items || [])],
    };
  }, [globalTemplates, localTemplates]);

  return {
    loading: globalTemplates.loading,
    error: globalTemplates.error,
    retry: globalTemplates.retry,
    value: templates,
  };
};
