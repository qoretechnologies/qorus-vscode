import { reduce, size } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { TTranslator } from '../../../App';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import Options, { IOptions, IOptionsSchema } from '../systemOptions';

export interface ISearchArgsProps {
  value?: IOptions;
  url: string;
  onChange: (name: string, value?: IOptions) => void;
}

export const SearchArgs = ({ value, url, onChange }: ISearchArgsProps) => {
  const [options, setOptions] = React.useState<any>(undefined);
  const t: TTranslator = useContext<TTranslator>(TextContext);
  const { fetchData, confirmAction, qorus_instance }: any = useContext(InitialContext);

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
    return <p>{t('LoadingSearchArgs')}</p>;
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
      name="search_args"
      value={value}
      operatorsUrl={`${url}/search_operators`}
      options={transformedOptions}
      placeholder={t('AddSearchArgument')}
      noValueString={t('NoSearchArgument')}
    />
  );
};
