import { Button, ButtonGroup, Callout } from '@blueprintjs/core';
import { reduce, size } from 'lodash';
import React, { useContext, useEffect } from 'react';
import { TRecordType } from '.';
import { TTranslator } from '../../../App';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import Spacer from '../../Spacer';
import SubField from '../../SubField';
import Options, { IOptions, IOptionsSchema } from '../systemOptions';

export interface ISearchArgsProps {
  value?: IOptions | IOptions[];
  asList?: boolean;
  type: TRecordType;
  url: string;
  onChange: (name: string, value?: IOptions | IOptions[]) => void;
  hasOperators?: boolean;
}

export const RecordQueryArgs = ({
  value,
  url,
  onChange,
  type,
  hasOperators = true,
  asList,
}: ISearchArgsProps) => {
  const [options, setOptions] = React.useState<any>(undefined);
  const [hasLoaded, setHasLoaded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<any | undefined>(undefined);
  const t: TTranslator = useContext<TTranslator>(TextContext);
  const { fetchData, qorus_instance }: any = useContext(InitialContext);

  useEffect(() => {
    if (qorus_instance) {
      (async () => {
        setHasLoaded(false);
        setError(undefined);
        // Set fields and operators to undefined
        setOptions(undefined);
        // Fetch the fields and operators
        const fieldsData = await fetchData(insertUrlPartBeforeQuery(`/${url}`, `/record`));
        // Set the data
        if (fieldsData.error) {
          setError({ title: fieldsData.error.error.err, desc: fieldsData.error.error.desc });
        }

        setHasLoaded(true);
        setOptions(fieldsData.data);
      })();
    }
  }, [url, qorus_instance]);

  if (!hasLoaded) {
    return <Callout>{t(`LoadingArgs`)}</Callout>;
  }

  if (!size(options)) {
    return <Callout intent="warning">{t(`NoArgs`)}</Callout>;
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

  if (asList) {
    return (
      <>
        {error && <Callout title={error.title}>{error.desc}</Callout>}
        {value &&
          (value as IOptions[]).map((options: IOptions, index: number) => (
            <SubField
              title={`${t('Record')} ${index + 1}`}
              key={index}
              subtle
              onRemove={() => {
                // Filter out the items from value with this index
                onChange(
                  `${type}_args`,
                  ((value || []) as IOptions[]).filter(
                    (_options: IOptions, idx: number) => idx !== index
                  )
                );
              }}
            >
              <Options
                onChange={(name, newOptions?: IOptions) => {
                  const newValue = [...(value as IOptions[])];
                  // Update the field
                  newValue[index] = newOptions;
                  // Update the pairs
                  onChange(name, newValue);
                }}
                name={`${type}_args`}
                value={options}
                operatorsUrl={
                  hasOperators
                    ? insertUrlPartBeforeQuery(url, `/search_operators`, 'context=ui')
                    : undefined
                }
                options={transformedOptions}
                placeholder={t('AddArgument')}
                noValueString={t('NoArgument')}
              />
            </SubField>
          ))}
        <Spacer size={15} />
        <ButtonGroup fill style={{ marginBottom: '10px' }}>
          <Button
            text={t('AddAnotherRecord')}
            icon={'add'}
            onClick={() => onChange(`${type}_args`, [...((value || []) as IOptions[]), {}])}
          />
        </ButtonGroup>
      </>
    );
  }

  return (
    <Options
      onChange={onChange}
      name={`${type}_args`}
      value={value as IOptions}
      operatorsUrl={
        hasOperators ? insertUrlPartBeforeQuery(url, '/search_operators', 'context=ui') : undefined
      }
      options={transformedOptions}
      placeholder={t('AddArgument')}
      noValueString={t('NoArgument')}
    />
  );
};
