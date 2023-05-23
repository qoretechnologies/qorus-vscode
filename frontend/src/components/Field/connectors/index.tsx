import { ReqoreMessage } from '@qoretechnologies/reqore';
import { cloneDeep, isEqual, map, omit, reduce } from 'lodash';
import size from 'lodash/size';
import React, { useState } from 'react';
import { useDebounce } from 'react-use';
import compose from 'recompose/compose';
import { TTranslator } from '../../../App';
import Provider, { providers } from '../../../containers/Mapper/provider';
import { insertUrlPartBeforeQuery } from '../../../helpers/functions';
import withInitialDataConsumer from '../../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../../hocomponents/withTextContext';
import { TDataProviderFavorites } from '../../../hooks/useGetDataProviderFavorites';
import SubField from '../../SubField';
import { ApiCallArgs } from '../apiCallArgs';
import BooleanField from '../boolean';
import Options, { IOptions, IQorusType } from '../systemOptions';
import { ProviderMessageData } from './MessageData';
import { ProviderMessageSelector } from './MessageSelector';
import { DataProviderFavorites } from './favorites';
import { RecordQueryArgs } from './searchArgs';

export type TRecordType = 'search' | 'search-single' | 'create' | 'update' | 'delete';
export type TRealRecordType = 'read' | 'create' | 'update' | 'delete';

export interface IConnectorFieldProps {
  title?: string;
  onChange?: (name: string, data: any) => void;
  name?: string;
  value: IProviderType;
  isInitialEditing?: boolean;
  initialData?: any;
  inline?: boolean;
  providerType?: 'inputs' | 'outputs' | 'event' | 'input-output' | 'condition';
  t?: TTranslator;
  requiresRequest?: boolean;
  recordType?: TRecordType;
  minimal?: boolean;
  isConfigItem?: boolean;
  isPipeline?: boolean;
  isMessage?: boolean;
  isVariable?: boolean;
  isEvent?: boolean;
  isTransaction?: boolean;
  readOnly?: boolean;
  disableSearchOptions?: boolean;
  disableMessageOptions?: boolean;
  disableTransactionOptions?: boolean;
  info?: any;
  favorites?: TDataProviderFavorites;
  localOnlyFavorites?: boolean;
}

export type TProviderTypeSupports = {
  [key in `supports_${TRealRecordType}`]?: boolean;
};

export type TProviderTypeArgs = {
  [key in `${TRecordType}_args`]?: IOptions | IOptions[];
};

export interface IProviderType extends TProviderTypeSupports, TProviderTypeArgs {
  type: string;
  name: string;
  path?: string;
  options?: IOptions;
  subtype?: 'request' | 'response';
  hasApiContext?: boolean;
  optionsChanged?: boolean;
  searchOptionsChanged?: boolean;
  desc?: string;
  use_args?: boolean;
  args?: any;
  supports_request?: boolean;
  supports_messages?: 'ASYNC' | 'SYNC' | 'NONE';
  supports_observable?: boolean;
  transaction_management?: boolean;
  record_requires_search_options?: boolean;
  create_args_freeform?: IOptions[];
  is_api_call?: boolean;
  search_options?: IOptions;
  descriptions?: string[];
  message_id?: string;
  message?: {
    type: IQorusType;
    value: any;
  };
}

const supportsList = {
  create: true,
};

const supportsOperators = {
  search: true,
  'search-single': true,
};

const supportsArguments = {
  create: true,
  update: true,
};

const getRealRecordType = (recordType: TRecordType): TRealRecordType => {
  return recordType.startsWith('search') ? 'read' : (recordType as TRealRecordType);
};

const shouldShowSearchArguments = (
  recordType: TRecordType,
  optionProvider: IProviderType | null
): boolean => {
  const realRecordType = recordType.startsWith('search') ? 'read' : recordType;

  if (
    ['read', 'update', 'delete'].includes(realRecordType) &&
    optionProvider?.[`supports_${realRecordType}`]
  ) {
    return true;
  }

  return false;
};

export const getUrlFromProvider: (
  val: IProviderType,
  withOptions?: boolean,
  isRecord?: boolean,
  includeSearchOptions?: boolean
) => string = (val, withOptions, isRecord, includeSearchOptions) => {
  // If the val is a string, return it
  if (typeof val === 'string') {
    return val;
  }

  const {
    type,
    name,
    path = '',
    options,
    search_options,
    is_api_call,
    hasApiContext,
    subtype,
    supports_messages,
    supports_observable,
    record_requires_search_options,
  } = val;
  let optionString = '';

  if (size(options)) {
    // Build the option string for URL
    optionString = `provider_yaml_options={${map(
      options,
      (value, key) => `${key}=${btoa(value?.value || value || '')}`
    ).join(',')}}`;
  }

  if (includeSearchOptions && size(search_options)) {
    // Build the option string for URL
    optionString += `${optionString ? '&' : ''}provider_yaml_search_options={${map(
      search_options,
      (value, key) => `${key}=${btoa(value?.value || value || '')}`
    ).join(',')}}`;
  }

  // Get the rules for the given provider
  const { url, suffix, recordSuffix, suffixRequiresOptions } = providers[type];

  if (withOptions) {
    return `${url}/${name}/${
      type === 'factory' ? 'provider_info/' : ''
    }constructor_options?context=ui${hasApiContext ? '&context=api' : ''}`;
  }

  // Check if the path ends in /request or /response
  const endsInSubtype = path.endsWith('/request') || path.endsWith('/response');
  const hasSubtype = subtype || endsInSubtype;
  const finalPath = hasSubtype
    ? `${path.replace('/response', '').replace('/request', '')}${subtype}`
    : path;

  // Build the suffix
  const realPath = `${suffix}${finalPath}${
    hasSubtype || is_api_call || supports_messages || supports_observable || isRecord
      ? ''
      : recordSuffix || ''
  }`;

  const suffixString =
    suffixRequiresOptions || includeSearchOptions
      ? optionString && optionString !== ''
        ? `${realPath}?${optionString}`
        : `${withOptions ? '/constructor_options' : `${realPath}`}`
      : realPath;

  // Build the URL based on the provider type
  return `${url}/${name}${suffixString}${type === 'type' && hasSubtype ? '?action=type' : ''}`;
};

export const maybeBuildOptionProvider = (provider) => {
  if (!provider) {
    return null;
  }

  // If the provider is an object, return it
  if (typeof provider === 'object') {
    return provider;
  }
  // Check if the provider is a factory
  if (provider.startsWith('factory')) {
    // Get everything between the < and >
    //const factory = provider.substring(provider.indexOf('<') + 1, provider.indexOf('>'));
    // Add / to the provider at the end if it doesn't already have it
    const fixedProvider = provider.endsWith('/') ? provider : `${provider}/`;
    // Get the factory name
    const [factoryType]: string[] = fixedProvider.split('/');
    // Get everything between the first / and { bracket
    const factoryName = fixedProvider.substring(
      fixedProvider.indexOf('/') + 1,
      fixedProvider.lastIndexOf('{')
    );
    // Get everything in the provider between first { and last }, which are the options
    const options = fixedProvider.substring(
      fixedProvider.indexOf('{') + 1,
      fixedProvider.lastIndexOf('}')
    );
    // Split the options by comma
    const optionsArray = options.split(',');
    let optionsObject = {};
    if (size(optionsArray)) {
      // Map through all the options and split each by =, which is the key and value
      optionsObject = reduce(
        optionsArray,
        (newOptions, option) => {
          const [key, value] = option.split('=');
          return { ...newOptions, [key]: value };
        },
        {}
      );
    }
    // Return the new provider
    const result: IProviderType = {
      type: factoryType,
      name: factoryName,
      // Get everything after the last }/ from the provider
      path: fixedProvider.substring(fixedProvider.lastIndexOf('}/') + 2),
      options: optionsObject,
    };
    // Add the optionsChanged key if the provider includes the "?options_changed" string
    if (provider.includes('?options_changed')) {
      result.optionsChanged = true;
    }

    return result;
  }
  // split the provider by /
  const [type, name, ...path] = provider.split('/');
  // Return it
  return {
    type,
    name,
    path: path.join('/'),
  };
};

const buildChildren = (provider: IProviderType) => {
  let pathToChildren: any = [
    {
      value: provider.name,
      values: [
        {
          name: provider.name,
          url: providers[provider.type].url,
          suffix: providers[provider.type].suffix,
          desc: provider.descriptions?.[0],
        },
      ],
    },
  ];

  if (provider.path) {
    // Remove the last / from the path
    const path = provider.path.endsWith('/') ? provider.path.slice(0, -1) : provider.path;

    pathToChildren = [
      ...pathToChildren,
      ...`${path}${provider.subtype ? `/${provider.subtype}` : ``}`
        .replace('/', '')
        .split('/')
        .map((item, index: number) => ({
          value: item,
          values: [{ name: item, desc: provider.descriptions?.[index + 1] }],
        })),
    ];
  }

  return pathToChildren;
};

const ConnectorField: React.FC<IConnectorFieldProps> = ({
  title,
  onChange,
  name,
  value,
  initialData,
  inline,
  providerType,
  minimal,
  isConfigItem,
  requiresRequest,
  recordType,
  isPipeline,
  isMessage,
  isVariable,
  isEvent,
  isTransaction,
  readOnly,
  disableSearchOptions,
  disableMessageOptions,
  disableTransactionOptions,
  info,
  t,
  favorites,
  localOnlyFavorites,
}) => {
  const [optionProvider, setOptionProvider] = useState<IProviderType | null>(
    maybeBuildOptionProvider(value)
  );

  const [nodes, setChildren] = useState(
    optionProvider && providers[optionProvider?.type] ? buildChildren(optionProvider) : []
  );
  const [provider, setProvider] = useState<string | null | undefined>(optionProvider?.type);
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [availableOptions, setAvailableOptions] = useState(undefined);

  const applyFavorite = (favorite: IProviderType) => {
    setProvider(favorite.type);
    setOptionProvider(favorite);
    setChildren(buildChildren(favorite));
  };

  const clear = () => {
    setIsEditing(false);
    setOptionProvider(null);
    onChange?.(name, undefined);
  };

  const reset = () => {
    setChildren([]);
    setProvider(null);
    setOptionProvider(null);
    setIsLoading(false);
    onChange?.(name, undefined);
  };

  useDebounce(
    () => {
      if (!isEditing) {
        if (!optionProvider) {
          onChange?.(name, undefined);
          return;
        }

        const val = { ...optionProvider };

        if (val.type !== 'factory') {
          delete val.optionsChanged;
          delete val.options;
        }

        if (!val.record_requires_search_options) {
          delete val.searchOptionsChanged;
        }

        if (isConfigItem) {
          // Add type from optionProvider and get value from all nodes and join them by /
          const type = val.type;
          const newNodes = cloneDeep(nodes);

          if (type === 'factory') {
            let options = reduce(
              val.options,
              (newOptions, optionData, optionName) => {
                return `${newOptions}${optionName}=${optionData.value},`;
              },
              ''
            );
            // Remove the last comma from options
            options = options.substring(0, options.length - 1);

            if (newNodes[0]) {
              newNodes[0].value = `${newNodes[0].value}{${options}}`;
            }

            const value = newNodes.map((node) => node.value).join('/');

            onChange?.(name, `${type}/${value}${val.optionsChanged ? `?options_changed` : ''}`);
          } else {
            const value = nodes.map((node) => node.value).join('/');
            onChange?.(name, `${type}/${value}`);
          }
        } else {
          onChange?.(name, val);
        }
      }
    },
    30,
    [JSON.stringify(optionProvider), isEditing]
  );

  if (!initialData.qorus_instance) {
    return <ReqoreMessage intent="warning">{t('ActiveInstanceProvidersConnectors')}</ReqoreMessage>;
  }

  return (
    <div style={{ flex: 1, width: inline ? undefined : '100%' }}>
      {info}

      <SubField
        title={title || t('DataProvider')}
        isValid
        actions={
          readOnly
            ? undefined
            : [
                {
                  as: DataProviderFavorites,
                  props: {
                    currentProvider: optionProvider,
                    onFavoriteApply: applyFavorite,
                    defaultFavorites: favorites,
                    localOnly: localOnlyFavorites,
                    requiresRequest,
                    recordType,
                    isConfigItem,
                    isPipeline,
                    isMessage,
                    isVariable,
                    isEvent,
                    isTransaction,
                    disableSearchOptions,
                  },
                  show: !readOnly,
                },
              ]
        }
      >
        <Provider
          isConfigItem={isConfigItem}
          nodes={nodes}
          setChildren={setChildren}
          provider={provider}
          setProvider={setProvider}
          setOptionProvider={(data) => {
            setOptionProvider(data);
          }}
          isLoading={isLoading}
          setIsLoading={setIsLoading}
          optionProvider={optionProvider}
          options={optionProvider?.options}
          searchOptions={optionProvider?.search_options}
          availableOptions={availableOptions}
          optionsChanged={optionProvider?.optionsChanged}
          searchOptionsChanged={optionProvider?.searchOptionsChanged}
          title={title}
          clear={clear}
          type={providerType}
          compact
          requiresRequest={requiresRequest}
          style={{
            display: inline ? 'inline-block' : 'block',
          }}
          onResetClick={reset}
          recordType={recordType}
          isPipeline={isPipeline}
          isMessage={isMessage}
          isVariable={isVariable}
          isEvent={isEvent}
          isTransaction={isTransaction}
          readOnly={readOnly}
        />
      </SubField>
      {provider === 'factory' && optionProvider ? (
        <SubField title={t('FactoryOptions')}>
          <Options
            readOnly={readOnly}
            onOptionsLoaded={(options) => setAvailableOptions(options)}
            onChange={(nm, val) => {
              setOptionProvider((cur: IProviderType | null) => {
                if (size(val) === 0) {
                  return omit(cur, ['options', 'optionsChanged']);
                }

                const result: IProviderType = {
                  ...cur,
                  options: val,
                } as IProviderType;

                if (!isEqual(optionProvider.options, val)) {
                  result.optionsChanged = true;
                } else {
                  result.optionsChanged = false;
                }

                return result;
              });
            }}
            name="options"
            value={optionProvider.options}
            customUrl={`${getUrlFromProvider(optionProvider, true)}`}
          />
        </SubField>
      ) : null}
      {/* This means that we are working with a Message provider */}
      {isMessage &&
      optionProvider?.supports_messages &&
      optionProvider?.supports_messages !== 'NONE' ? (
        <>
          <SubField title={t('MessageType')} desc={t('SelectMessageType')}>
            <ProviderMessageSelector
              readOnly={disableMessageOptions}
              url={`${getUrlFromProvider(optionProvider)}`}
              value={optionProvider?.message_id}
              onChange={(val) => {
                setOptionProvider((cur) => ({
                  ...cur,
                  message_id: val,
                  message: undefined,
                }));
              }}
            />
          </SubField>
          {optionProvider?.message_id && (
            <SubField title={t('MessageData')} className="provider-message-data">
              <ProviderMessageData
                readOnly={disableMessageOptions}
                value={optionProvider?.message?.value}
                type={optionProvider?.message?.type}
                url={`${getUrlFromProvider(optionProvider)}`}
                messageId={optionProvider?.message_id}
                onChange={(value, type) => {
                  setOptionProvider(
                    (cur: IProviderType): IProviderType => ({
                      ...cur,
                      message: {
                        type,
                        value,
                      },
                    })
                  );
                }}
              />
            </SubField>
          )}
        </>
      ) : null}
      {/* This means that we are working with an API Call provider */}
      {requiresRequest && optionProvider?.supports_request ? (
        <>
          <SubField title={t('AllowAPIArguments')} desc={t('AllowAPIArgumentsDesc')}>
            <BooleanField
              name="useArgs"
              value={optionProvider?.use_args || false}
              onChange={(_nm, val) => {
                setOptionProvider((cur) => ({
                  ...cur,
                  use_args: val,
                }));
              }}
            />
          </SubField>
          {optionProvider?.use_args && (
            <SubField title={t('RequestArguments')}>
              <ApiCallArgs
                value={optionProvider?.args?.value}
                url={`${getUrlFromProvider(optionProvider)}`}
                onChange={(_nm, value, type) => {
                  setOptionProvider(
                    (cur: IProviderType): IProviderType => ({
                      ...cur,
                      args: {
                        type,
                        value,
                      },
                    })
                  );
                }}
              />
            </SubField>
          )}
        </>
      ) : null}
      {/* This means that we are working with a record search */}
      {recordType && optionProvider && shouldShowSearchArguments(recordType, optionProvider) ? (
        <SubField title={t('searchArguments')}>
          <RecordQueryArgs
            type="search"
            url={getUrlFromProvider(optionProvider, false, true, true)}
            value={optionProvider?.search_args as IOptions}
            onChange={(_nm, val) => {
              setOptionProvider((cur: IProviderType | null) => {
                const result: IProviderType = {
                  ...cur,
                  search_args: val,
                } as IProviderType;

                return result;
              });
            }}
          />
        </SubField>
      ) : null}
      {optionProvider?.record_requires_search_options ||
      (recordType && optionProvider && shouldShowSearchArguments(recordType, optionProvider)) ? (
        <SubField title={t('SearchOptions')}>
          <Options
            readOnly={readOnly && disableSearchOptions}
            onChange={(_nm, val) => {
              setOptionProvider((cur: IProviderType | null) => {
                // If there are no options then we need to remove the options object all together
                if (size(val) === 0) {
                  return omit(cur, ['search_options', 'searchOptionsChanged']);
                }

                const result: IProviderType = {
                  ...cur,
                  search_options: val,
                } as IProviderType;

                if (!isEqual(optionProvider?.search_options, val)) {
                  result.searchOptionsChanged = true;
                } else {
                  result.searchOptionsChanged = false;
                }

                return result;
              });
            }}
            name="search_options"
            value={optionProvider?.search_options}
            recordRequiresSearchOptions={optionProvider?.record_requires_search_options}
            customUrl={insertUrlPartBeforeQuery(
              getUrlFromProvider(optionProvider, false, true),
              '/search_options'
            )}
          />
        </SubField>
      ) : null}
      {/* This means that we are working with a record update */}
      {recordType && optionProvider && supportsArguments[recordType] ? (
        <SubField title={t(`${recordType}Arguments`)}>
          <RecordQueryArgs
            type={recordType}
            asList={supportsList[recordType]}
            url={getUrlFromProvider(optionProvider, false, true)}
            value={
              optionProvider?.[`${recordType}_args`] ||
              optionProvider?.[`${recordType}_args_freeform`]
            }
            isFreeform={`${recordType}_args_freeform` in optionProvider}
            onChange={(argName, val) => {
              setOptionProvider((cur: IProviderType | null) => {
                const result: IProviderType = {
                  ...cur,
                  [argName]: val,
                } as IProviderType;

                if (argName.includes('freeform')) {
                  delete result[`${recordType}_args`];
                } else {
                  delete result[`${recordType}_args_freeform`];
                }

                return result;
              });
            }}
            hasOperators={supportsOperators[recordType] || false}
          />
        </SubField>
      ) : null}
    </div>
  );
};

export default compose(
  withTextContext(),
  withInitialDataConsumer()
)(ConnectorField) as React.FC<IConnectorFieldProps>;
