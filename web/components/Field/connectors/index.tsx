import { Button, Callout, Classes, Tag } from '@blueprintjs/core';
import size from 'lodash/size';
import React, { useEffect, useState } from 'react';
import { useUpdateEffect } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../../App';
import Provider, { providers } from '../../../containers/Mapper/provider';
import withInitialDataConsumer from '../../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../../hocomponents/withTextContext';
import SubField from '../../SubField';
import Options from '../systemOptions';

export interface IConnectorFieldProps {
  title?: string;
  onChange: (name: string, data: any) => void;
  name: string;
  value: any;
  isInitialEditing?: boolean;
  initialData: any;
  inline?: boolean;
  providerType?: 'inputs' | 'outputs' | 'event' | 'input-output' | 'condition';
  t: TTranslator;
}

const StyledProviderUrl = styled.div`
  min-height: 40px;
  line-height: 40px;

  span {
    font-weight: 500;
  }
`;

export const getUrlFromProvider: (val: any) => string = (val) => {
  // If the val is a string, return it
  if (typeof val === 'string') {
    return val;
  }
  const { type, name, path } = val;
  // Get the rules for the given provider
  const { url, suffix, recordSuffix, requiresRecord } = providers[type];
  // Build the URL based on the provider type
  return `${url}/${name}${suffix}${path}${requiresRecord ? recordSuffix : ''}`;
};

const ConnectorField: React.FC<IConnectorFieldProps> = ({
  title,
  onChange,
  name,
  value,
  isInitialEditing,
  initialData,
  inline,
  providerType,
  minimal,
  isConfigItem,
  t,
}) => {
  const [nodes, setChildren] = useState([]);
  const [provider, setProvider] = useState(null);
  const [optionProvider, setOptionProvider] = useState(value);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(isInitialEditing);

  const clear = () => {
    setIsEditing(false);
    setOptionProvider(null);
  };

  const reset = () => {
    setChildren([]);
    setProvider(null);
    setOptionProvider(null);
    setIsLoading(false);
  };

  // Update the editing state when initial editing changes
  useEffect(() => {
    setIsEditing(isInitialEditing);
  }, [isInitialEditing]);

  useUpdateEffect(() => {
    /* Setting the option provider to the value of the object. */
    if (value && typeof value === 'object') {
      setOptionProvider(value);
    }
  }, [JSON.stringify(value)]);

  useUpdateEffect(() => {
    if (!optionProvider) {
      onChange(name, optionProvider);
      return;
    }

    const val = { ...optionProvider };

    if (!size(val?.options)) {
      delete val.options;
    }

    if (isConfigItem) {
      // Add type from optionProvider and get value from all nodes and join them by /
      const type = val.type;
      const value = nodes.map((node) => node.value).join('/');

      console.log(val, optionProvider);

      console.log(`${type}/${value}`);

      onChange(name, `${type}/${value}`);
    } else {
      onChange(name, val);
    }
  }, [JSON.stringify(optionProvider), isEditing]);

  if (isEditing && value) {
    return (
      <>
        <SubField title={!minimal && t('CurrentDataProvider')}>
          <StyledProviderUrl>
            {title && <span>{title}:</span>}{' '}
            <Tag minimal large onRemove={clear}>
              {getUrlFromProvider(value)}{' '}
            </Tag>
          </StyledProviderUrl>
        </SubField>
        {value.type === 'factory' ? (
          <SubField title={t('FactoryOptions')}>
            <Options
              onChange={(nm, val) => {
                setOptionProvider((cur) => ({ ...cur, options: val }));
              }}
              name="options"
              value={optionProvider.options}
              customUrl={`${getUrlFromProvider(value)}/constructor_options`}
            />
          </SubField>
        ) : null}
      </>
    );
  }

  if (!initialData.qorus_instance) {
    return <Callout intent="warning">{t('ActiveInstanceProvidersConnectors')}</Callout>;
  }

  return (
    <>
      <SubField title={!minimal && t('SelectDataProvider')}>
        <Provider
          isConfigItem={isConfigItem}
          nodes={nodes}
          setChildren={setChildren}
          provider={provider}
          setProvider={setProvider}
          setOptionProvider={setOptionProvider}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          title={title}
          clear={clear}
          type={providerType}
          compact
          style={{
            display: inline ? 'inline-block' : 'block',
          }}
        />
      </SubField>
      {size(nodes) ? (
        <Button intent="danger" icon="cross" onClick={reset} className={Classes.FIXED} />
      ) : null}
      {provider === 'factory' && optionProvider ? (
        <SubField title={t('FactoryOptions')}>
          <Options
            onChange={(nm, val) => {
              setOptionProvider((cur) => ({ ...cur, options: val }));
            }}
            name="options"
            value={optionProvider.options}
            customUrl={`${getUrlFromProvider(optionProvider)}/constructor_options`}
          />
        </SubField>
      ) : null}
    </>
  );
};

export default compose(withTextContext(), withInitialDataConsumer())(ConnectorField);
