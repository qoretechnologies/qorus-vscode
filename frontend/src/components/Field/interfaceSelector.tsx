import { Callout } from '@blueprintjs/core';
import { FunctionComponent, useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { TTranslator } from '../../App';
import { IField, IFieldChange } from '../../components/FieldWrapper';
import { interfaceToPlural } from '../../constants/interfaces';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import Spacer from '../Spacer';
import { ILongStringField } from './longString';
import SelectField from './select';

export interface IInterfaceSelector {
  t?: TTranslator;
  type: 'workflows' | 'services' | 'jobs' | 'connections' | 'mappers' | 'value-maps';
}

export const InterfaceSelector: FunctionComponent<ILongStringField & IField & IFieldChange> = ({
  name,
  onChange,
  value,
  default_value,
  type,
}) => {
  // Get the qorus instance
  const { qorus_instance, fetchData } = useContext<{ qorus_instance?: string }>(InitialContext);
  const t = useContext(TextContext);
  // Fetch data on mount
  const {
    value: interfaces,
    loading,
    retry,
    error,
  } = useAsyncRetry(async () => {
    // Fetch the interfaces based on the type
    if (qorus_instance) {
      return fetchData(`/${interfaceToPlural[type]}?list=true`);
    }

    return null;
  }, [qorus_instance, type]);

  if (!qorus_instance) {
    return (
      <div>
        <Callout intent="warning">{t('InterfacesQorusInstanceRequired')}</Callout>
        <Spacer size={10} />
        <p>{value || default_value}</p>
      </div>
    );
  }

  if (error) {
    return (
      <Callout intent="danger">
        <p style={{ fontWeight: 500 }}>{t('ErrorLoadingInterfaces')}</p>
        {t(error)}
      </Callout>
    );
  }

  // If interfaces are not loaded yet, return a loading indicator
  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <SelectField
      defaultItems={interfaces.data.map((i) => ({ name: i }))}
      value={value || default_value}
      name={name}
      onChange={onChange}
    />
  );
};
