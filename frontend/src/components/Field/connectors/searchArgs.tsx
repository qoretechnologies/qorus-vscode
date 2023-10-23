import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreTabs,
  ReqoreTabsContent,
} from '@qoretechnologies/reqore';
import jsyaml from 'js-yaml';
import { reduce, size } from 'lodash';
import React, { useContext } from 'react';
import { useDebounce, useUpdateEffect } from 'react-use';
import { TRecordType } from '.';
import { TTranslator } from '../../../App';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import { maybeParseYaml, validateField } from '../../../helpers/validations';
import Spacer from '../../Spacer';
import SubField from '../../SubField';
import LongStringField from '../longString';
import { PositiveColorEffect, SaveColorEffect } from '../multiPair';
import Options, { IOptions, IOptionsSchema } from '../systemOptions';

export interface ISearchArgsProps {
  value?: IOptions | IOptions[];
  asList?: boolean;
  type: TRecordType;
  url: string;
  onChange: (name: string, value?: IOptions | IOptions[]) => void;
  hasOperators?: boolean;
  isFreeform?: boolean;
  searchOptions?: IOptions;
}

export const RecordQueryArgs = ({
  value,
  url,
  onChange,
  type,
  hasOperators = true,
  asList,
  isFreeform,
}: ISearchArgsProps) => {
  const [options, setOptions] = React.useState<any>(undefined);
  const [hasLoaded, setHasLoaded] = React.useState<boolean>(false);
  const [error, setError] = React.useState<any | undefined>(undefined);
  const t: TTranslator = useContext<TTranslator>(TextContext);
  const { fetchData, qorus_instance }: any = useContext(InitialContext);
  const [localValue, setLocalValue] = React.useState<any>(value ? jsyaml.dump(value) : undefined);
  const [isValueSubmitted, setIsValueSubmitted] = React.useState<boolean>(true);

  useUpdateEffect(() => {
    setIsValueSubmitted(false);
  }, [localValue]);

  useDebounce(
    () => {
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
            setHasLoaded(true);
            setError({ title: fieldsData.error.err, desc: fieldsData.error.desc });
            return;
          }

          setHasLoaded(true);
          setOptions(fieldsData.data);
        })();
      }
    },
    1000,
    [url, qorus_instance]
  );

  if (!hasLoaded) {
    return <ReqoreMessage intent="pending">{t(`LoadingArgs`)}</ReqoreMessage>;
  }

  if (error) {
    return (
      <ReqoreMessage intent="danger" title={error.title}>
        {error.desc}
      </ReqoreMessage>
    );
  }

  if (!size(options)) {
    return <ReqoreMessage intent="warning">{t(`NoArgs`)}</ReqoreMessage>;
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
      <ReqoreTabs
        activeTab={isFreeform ? 'text' : 'form'}
        tabsPadding="top"
        padded={false}
        tabs={[
          { label: 'Text', icon: 'Text', id: 'text' },
          { label: 'Form', icon: 'AlignCenter', id: 'form' },
        ]}
        onTabChange={(tabId) => {
          onChange(tabId === 'text' ? `${type}_args_freeform` : `${type}_args`, [{}]);
          setLocalValue(undefined);
        }}
      >
        <ReqoreTabsContent tabId="text">
          <ReqoreControlGroup fluid fill>
            <LongStringField
              value={localValue}
              onChange={(_name, value) => setLocalValue(value)}
              name={`${type}_args_freeform`}
              intent={validateField('list-of-hashes', localValue) ? undefined : 'danger'}
            />
            {!isValueSubmitted && (
              <ReqoreButton
                icon="CheckLine"
                fixed
                id={`save-${type}-args`}
                effect={SaveColorEffect}
                onClick={() => {
                  onChange(`${type}_args_freeform`, maybeParseYaml(localValue));
                  setIsValueSubmitted(true);
                }}
                disabled={!validateField('list-of-hashes', localValue)}
              />
            )}
          </ReqoreControlGroup>
        </ReqoreTabsContent>
        <ReqoreTabsContent tabId="form">
          {error && (
            <ReqoreMessage intent="danger" title={error.title}>
              {error.desc}
            </ReqoreMessage>
          )}
          {value
            ? (value as IOptions[]).map((options: IOptions, index: number) => (
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
              ))
            : null}
          <Spacer size={15} />
          <ReqoreControlGroup fluid>
            <ReqoreButton
              icon={'AddLine'}
              rightIcon={'AddLine'}
              effect={PositiveColorEffect}
              textAlign="center"
              onClick={() => onChange(`${type}_args`, [...((value || []) as IOptions[]), {}])}
            >
              {t('AddAnotherRecord')}
            </ReqoreButton>
          </ReqoreControlGroup>
        </ReqoreTabsContent>
      </ReqoreTabs>
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
