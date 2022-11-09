import { Callout } from '@blueprintjs/core';
import { useContext, useEffect } from 'react';
import { useAsyncRetry } from 'react-use';
import styled from 'styled-components';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import Auto from './auto';
import Options from './systemOptions';

type IApiCallArgsField = {
  value: string | number | { [key: string]: any };
  onChange: (name: string, value: string | number | { [key: string]: any }, type: string) => void;
  url: string;
};

export const StyledPairField = styled.div`
  margin-bottom: 10px;
`;

export const ApiCallArgs = ({ url, onChange, value }: IApiCallArgsField) => {
  const t = useContext(TextContext);
  const { fetchData, qorus_instance }: any = useContext(InitialContext);

  const {
    value: schema,
    loading,
    error,
  } = useAsyncRetry(async () => {
    if (qorus_instance) {
      const data = await fetchData(`${url}/request?context=ui`);

      if (data.error) {
        //console.log(data.error);
        throw new Error(data.error.error.desc);
      }

      return data.data;
    }
    return null;
  }, [url]);

  useEffect(() => {
    if (schema?.type === 'nothing') {
      onChange('apicallargs', undefined, 'nothing');
    }
  }, [schema]);

  if (loading) {
    return <Callout>Loading...</Callout>;
  }

  if (error) {
    return <Callout intent="danger">Error: {error.message}</Callout>;
  }

  if (schema?.type === 'nothing') {
    return <Callout intent="warning">{t('APICallTakesNoArgs')}</Callout>;
  }

  if (schema.type === 'hash') {
    return (
      <Options
        name="field"
        onChange={(n, v) => onChange(n, v, schema.type)}
        value={value}
        options={schema.arg_schema}
        placeholder="AddArgument"
      />
    );
  }

  return (
    <Auto
      name="field"
      onChange={(n, v) => onChange(n, v, schema.type)}
      value={value}
      defaultType={schema.type.replace('*', '')}
      requestFieldData={(key) => {
        if (key === 'can_be_undefined') {
          return schema.type.startsWith('*');
        }
      }}
    />
  );
};
