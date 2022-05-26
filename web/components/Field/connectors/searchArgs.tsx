import { reduce, size } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { TTranslator } from '../../../App';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import Options, { IOptions, IOptionsSchema } from '../systemOptions';

export interface ISearchArgsProps {
  value?: IOptions;
  type: 'search' | 'update' | 'create' | 'delete';
  url: string;
  onChange: (name: string, value?: IOptions) => void;
  hasOperators?: boolean;
}

export const RecordQueryArgs = ({
  value,
  url,
  onChange,
  type,
  hasOperators = true,
}: ISearchArgsProps) => {
  const [options, setOptions] = React.useState<any>(undefined);
  const t: TTranslator = useContext<TTranslator>(TextContext);
  const { fetchData, qorus_instance }: any = useContext(InitialContext);

  useEffect(() => {
    if (qorus_instance) {
      (async () => {
        // Set fields and operators to undefined
        setOptions(undefined);
        // Fetch the fields and operators
        const fieldsData = await fetchData(`/${url}/record`);
        // Set the data
        setOptions(fieldsData.data);
      })();
    }
  }, [url, qorus_instance]);

  if (!size(options)) {
    return <p>{t(`LoadingArgs`)}</p>;
  }

  const transformedOptions: IOptionsSchema =
    options &&
    reduce(
      options,
      (newOptions: IOptionsSchema, optionData, optionName): IOptionsSchema => ({
        ...newOptions,
        [optionName]: {
          type: optionData.type.base_type,
          desc: optionData.desc,
        },
      }),
      {}
    );

  return (
    <Options
      onChange={onChange}
      name={`${type}_args`}
      value={value}
      operatorsUrl={hasOperators ? `${url}/search_operators?context=ui` : undefined}
      options={transformedOptions}
      placeholder={t('AddArgument')}
      noValueString={t('NoArgument')}
    />
  );
};
