import { useEffect, useState } from 'react';
import { ITypeComparatorData, fetchData, getStateProvider } from '../helpers/functions';

export const useGetInputOutputType = (
  inputProvider: ITypeComparatorData,
  outputProvider: ITypeComparatorData
): { inputType: { [key: string]: any }; outputType: { [key: string]: any } } => {
  const [inputType, setInputType] = useState<{ [key: string]: any }>(undefined);
  const [outputType, setOutputType] = useState<{ [key: string]: any }>(undefined);

  useEffect(() => {
    if (inputProvider || outputProvider) {
      setInputType(undefined);
      setOutputType(undefined);

      (async () => {
        const input = await getStateProvider(inputProvider, 'input');

        if (inputProvider) {
          const inputTypeData = await fetchData('/dataprovider/type', 'PUT', {
            type: input,
          });
          if (!inputTypeData.error) {
            setInputType(inputTypeData.data);
          } else {
            setInputType({});
          }
        } else {
          setInputType({});
        }

        const output = await getStateProvider(outputProvider, 'output');

        if (outputProvider) {
          const outputTypeData = await fetchData('/dataprovider/type', 'PUT', {
            type: output,
          });

          if (!outputTypeData.error) {
            setOutputType(outputTypeData.data);
          } else {
            setOutputType({});
          }
        } else {
          setOutputType({});
        }
      })();
    } else {
      setInputType({});
      setOutputType({});
    }
  }, [JSON.stringify(inputProvider), JSON.stringify(outputProvider)]);

  return { inputType, outputType };
};
