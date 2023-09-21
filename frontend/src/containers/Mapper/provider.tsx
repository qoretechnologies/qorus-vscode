import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import jsyaml from 'js-yaml';
import { cloneDeep, last, omit, reduce } from 'lodash';
import map from 'lodash/map';
import nth from 'lodash/nth';
import size from 'lodash/size';
import { FC, useCallback, useContext, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import CustomDialog from '../../components/CustomDialog';
import { TRecordType } from '../../components/Field/connectors';
import SelectField from '../../components/Field/select';
import String from '../../components/Field/string';
import { IOptions, IOptionsSchema } from '../../components/Field/systemOptions';
import Loader from '../../components/Loader';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import { submitControl } from '../InterfaceCreator/controls';

export interface IProviderProps {
  type: 'inputs' | 'outputs';
  provider: string;
  setProvider: any;
  nodes: any[];
  setChildren: any;
  isLoading: boolean;
  setIsLoading: any;
  record: any;
  setRecord: any;
  setFields: any;
  initialData: any;
  clear: any;
  title: string;
  setOptionProvider: any;
  hide: any;
  style: any;
  isConfigItem?: boolean;
  requiresRequest?: boolean;
  recordType?: TRecordType;
  options?: { [key: string]: any };
  optionsChanged?: boolean;
  onResetClick?: () => void;
  isMessage?: boolean;
  isVariable?: boolean;
  isEvent?: boolean;
  isTransaction?: boolean;
  availableOptions?: IOptionsSchema;
  readOnly?: boolean;
}

export const providers: any = {
  type: {
    name: 'type',
    url: 'dataprovider/types',
    suffix: '',
    recordSuffix: '?action=type',
    type: 'type',
    withDetails: true,
    desc: 'Data type and custom record descriptions',
  },
  connection: {
    name: 'connection',
    url: 'remote/user',
    filter: 'has_provider',
    namekey: 'name',
    desckey: 'desc',
    suffix: '/provider',
    recordSuffix: '/record',
    requiresRecord: true,
    withDetails: true,
    type: 'connection',
    desc: 'Qorus user connections; access a data provider through a user connection',
  },
  remote: {
    name: 'remote',
    url: 'remote/qorus',
    filter: 'has_provider',
    namekey: 'name',
    desckey: 'desc',
    suffix: '/provider',
    recordSuffix: '/record',
    requiresRecord: true,
    withDetails: true,
    type: 'remote',
    desc: 'Qorus to Qorus remote connections; access a data provider through a remote Qorus instances (remote datasources and remote Qorus APIs)',
  },
  datasource: {
    name: 'datasource',
    url: 'remote/datasources',
    filter: 'has_provider',
    namekey: 'name',
    desckey: 'desc',
    suffix: '/provider',
    recordSuffix: '/record',
    requiresRecord: true,
    withDetails: true,
    type: 'datasource',
    desc: 'Qorus database connections; access record-based data providers through a local datasource',
  },
  factory: {
    name: 'factory',
    url: 'dataprovider/factories',
    filter: null,
    inputFilter: null,
    outputFilter: null,
    suffix: '/provider',
    namekey: 'name',
    desckey: 'desc',
    recordSuffix: '/record',
    requiresRecord: true,
    withDetails: true,
    suffixRequiresOptions: true,
    type: 'factory',
    desc: 'Data provider factories for creating data providers from options',
  },
};

export const configItemFactory = {
  name: 'factory',
  url: 'dataprovider/factories',
  filter: null,
  inputFilter: null,
  outputFilter: null,
  suffix: '/provider',
  namekey: 'name',
  desckey: 'desc',
  recordSuffix: '',
  requiresRecord: false,
  suffixRequiresOptions: true,
  type: 'factory',
  desc: 'Data provider factories for creating data providers from options',
};

const MapperProvider: FC<IProviderProps> = ({
  provider,
  setProvider,
  nodes,
  setChildren,
  isLoading,
  setIsLoading,
  record,
  setRecord,
  setFields,
  clear,
  initialData: { fetchData },
  setMapperKeys,
  setOptionProvider,
  title,
  type,
  hide,
  compact,
  canSelectNull,
  style,
  isConfigItem,
  options,
  searchOptions,
  requiresRequest,
  optionsChanged,
  searchOptionsChanged,
  onResetClick,
  optionProvider,
  recordType,
  isPipeline,
  isMessage,
  isVariable,
  availableOptions,
  readOnly,
  isEvent,
  isTransaction,
}) => {
  const [wildcardDiagram, setWildcardDiagram] = useState(undefined);
  const [errorMessage, onError] = useState<string | null>(null);
  const [warningMessage, setWarning] = useState<string>(undefined);
  const t = useContext(TextContext);
  let realProviders = cloneDeep(providers);

  // Omit type and factory from the list of realProviders if is config item
  if (isConfigItem) {
    realProviders = omit(realProviders, ['type', 'factory']);
    realProviders.factory = configItemFactory;
  }

  if (requiresRequest) {
    realProviders = omit(realProviders, ['datasource', 'type']);
  }

  if (recordType || isPipeline) {
    realProviders = omit(realProviders, ['type']);
  }

  /**
   * It filters out children that don't have a record or request
   * @param {any[]} children - any[] - the children of the current node
   * @returns the children array after it has been filtered.
   */
  const filterChildren = (children: any[]) => {
    return children.filter((child) => {
      if (isPipeline || recordType) {
        return child.has_record || child.children_can_support_records || child.has_provider;
      }

      if (requiresRequest) {
        return child.supports_request || child.children_can_support_apis;
      }

      if (isMessage) {
        return (
          (child.supports_messages && child.supports_messages !== 'NONE') ||
          child.children_can_support_messages
        );
      }

      if (isTransaction) {
        return (
          child.transaction_management ||
          child.children_can_support_transaction_management ||
          child.children_can_support_transactions
        );
      }

      if (isEvent) {
        return child.supports_observable || child.children_can_support_observers;
      }

      return true;
    });
  };

  const handleCallError = (error) => {
    if (error) {
      const errorMsg = error.err || error;
      onError?.(errorMsg);
    } else {
      onError?.(null);
    }
  };

  const handleProviderChange = (provider) => {
    setProvider((current) => {
      // Fetch the url of the provider
      (async () => {
        // Clear the data
        clear && clear(true);
        // Set loading
        setIsLoading(true);
        // Select the provider data
        const { url, filter, inputFilter, outputFilter, withDetails } = realProviders[provider];
        // Get the data
        let { data, error } = await fetchData(`${url}`);

        handleCallError(error);

        // Remove loading
        setIsLoading(false);
        // Filter unwanted data if needed
        if (filter) {
          data = data.filter((datum) => datum[filter]);
        }
        // Filter input filters and output filters
        if (type === 'inputs' || type === 'outputs') {
          if (type === 'inputs' && inputFilter) {
            data = data.filter((datum) => datum[inputFilter]);
          }
          if (type === 'outputs' && outputFilter) {
            data = data.filter((datum) => datum[outputFilter]);
          }
        }
        // Save the children
        let children = filterChildren(data.children || data);

        if (!size(children)) {
          setWarning(
            'There are no further paths to go, please go back and select a different path...'
          );
        } else {
          setWarning(undefined);
        }

        // Add new child
        setChildren([
          {
            values: children.map((child) => {
              if (typeof child === 'string') {
                return {
                  name: realProviders[provider].namekey
                    ? child[realProviders[provider].namekey]
                    : child,
                  desc: '',
                  url,
                  suffix: realProviders[provider].suffix,
                };
              }

              return {
                ...child,
                url: url,
                suffix: realProviders[provider].suffix,
              };
            }),
            value: null,
          },
        ]);
      })();
      // Set the provider
      return provider;
    });
  };

  const buildOptions = () => {
    let customOptionString = '';

    const fixedOptions: IOptions = reduce(
      options,
      (newOptions, option, optionName) => {
        if (option.value === undefined) {
          return newOptions;
        }

        return {
          ...newOptions,
          [optionName]: option,
        };
      },
      {}
    );

    if (size(fixedOptions)) {
      // Turn the options hash into a query string
      const str = map(
        fixedOptions,
        (value, key) => `${key}=${btoa(jsyaml.dump(value.value))}`
      ).join(',');
      customOptionString = `provider_yaml_options={${str}}`;
    } else {
      customOptionString = 'provider_yaml_options={}';
    }

    const fixedSearchOptions: IOptions = reduce(
      searchOptions,
      (newOptions, option, optionName) => {
        if (option.value === undefined) {
          return newOptions;
        }

        return {
          ...newOptions,
          [optionName]: option,
        };
      },
      {}
    );

    if (size(fixedSearchOptions)) {
      // Turn the options hash into a query string
      const str = map(
        fixedSearchOptions,
        (value, key) => `${key}=${btoa(jsyaml.dump(value.value))}`
      ).join(',');
      customOptionString += `&provider_yaml_search_options={${str}}`;
    } else {
      customOptionString += `&provider_yaml_search_options={}`;
    }

    return customOptionString;
  };

  const buildDescriptions = (desc?: string, added?: boolean) => {
    if (added) {
      return [...(optionProvider?.descriptions || []), desc];
    } else {
      return [...(optionProvider?.descriptions || [])];
    }
  };

  const handleChildFieldChange = async (
    value: string,
    url: string,
    itemIndex: number,
    suffix?: string,
    customOptionString?: string,
    supportsOptions?: boolean,
    requiresSearchOptions?: boolean,
    didApplyOptions?: boolean
  ): Promise<void> => {
    let descriptions = buildDescriptions();
    let newOptionProvider;
    // If this is a factory and it requires options
    // and no required options are filled, do not go further
    // User will have to fill the required options first and
    // click the Apply Options button
    if (
      provider === 'factory' &&
      supportsOptions &&
      !validateField('system-options', options, { optionsSchema: availableOptions })
    ) {
      setChildren((current) => {
        // Update this item
        const newItems: any[] = current
          .map((item, index) => {
            const newItem = { ...item };
            // Update the value if the index matches
            if (index === itemIndex) {
              newItem.value = value;
            }
            // Also check if there are items with
            // higher index (children) and remove them
            if (index > itemIndex) {
              return null;
            }
            // Return the item
            return newItem;
          })
          .filter((item) => item);
        // Return the new items
        return newItems;
      });
      const name = `${url}/${value}`.split('/')[2];
      // Set the provider option
      newOptionProvider = {
        ...optionProvider,
        type: realProviders[provider].type,
        name,
        is_api_call: requiresRequest,
        up: record?.data?.up !== false,
        can_manage_fields: record?.data?.can_manage_fields,
        transaction_management: record?.data?.transaction_management,
        subtype: value === 'request' || value === 'response' ? value : undefined,
        path: `${url}/${value}`
          .replace(`${name}`, '')
          .replace(`${realProviders[provider].url}/`, '')
          .replace(`provider/`, '')
          .replace('request', '')
          .replace('response', ''),
        options,
        searchOptionsChanged: false,
        descriptions: [...descriptions, record?.data?.desc],
      };

      console.log('0');

      setOptionProvider(newOptionProvider);

      return;
    }
    // Clear the data
    clear && clear(true);
    // Set loading
    setIsLoading(true);
    const newSuffix = realProviders[provider].withDetails
      ? value === 'request' || value === 'response'
        ? `?${buildOptions()}`
        : `${suffix}?action=childDetails&${buildOptions()}`
      : suffix;

    // Build the suffix
    let suffixString =
      customOptionString && customOptionString !== '' && size(options)
        ? `${newSuffix}${realProviders[provider].withDetails ? '&' : '?'}`
        : itemIndex === 1
        ? value === 'request' || value === 'response'
          ? `?${buildOptions()}`
          : `?action=childDetails&${buildOptions()}`
        : newSuffix;
    // Fetch the data

    const { data = {}, error } = await fetchData(`${url}/${value}${suffixString}`);

    handleCallError(error);

    // Reset loading
    setIsLoading(false);

    // Update this item
    const newItems: any[] = nodes
      .map((item, index) => {
        const newItem = { ...item };
        // Update the value if the index matches
        if (index === itemIndex) {
          newItem.value = value;
        }
        // Also check if there are items with
        // higher index (children) and remove them
        if (index > itemIndex) {
          return null;
        }
        // Return the item
        return newItem;
      })
      .filter((item) => item);

    if (
      (requiresSearchOptions || data?.record_requires_search_options) &&
      !validateField('system-options', searchOptions)
    ) {
      const name = `${url}/${value}`.split('/')[2];
      console.log('1');
      // Set the provider option
      newOptionProvider = {
        ...optionProvider,
        type: realProviders[provider].type,
        name,
        is_api_call: requiresRequest,
        can_manage_fields: data?.can_manage_fields,
        up: data.up !== false,
        transaction_management: data?.transaction_management,
        record_requires_search_options: data?.record_requires_search_options,
        subtype: value === 'request' || value === 'response' ? value : undefined,
        path: `${url}/${value}`
          .replace(`${name}`, '')
          .replace(`${realProviders[provider].url}/`, '')
          .replace(`provider/`, '')
          .replace('request', '')
          .replace('response', ''),
        options,
        search_options: didApplyOptions ? searchOptions : undefined,
        searchOptionsChanged: false,
        descriptions: [...descriptions, data?.desc],
      };
    } else if (
      data.has_type ||
      isConfigItem ||
      provider === 'factory' ||
      (requiresRequest && data.supports_request) ||
      (isVariable &&
        (data.supports_read ||
          data.supports_create ||
          data.supports_update ||
          data.supports_delete ||
          data.supports_messages ||
          data.transaction_management))
    ) {
      setIsLoading(true);

      if (type === 'outputs' && data.mapper_keys) {
        // Save the mapper keys
        setMapperKeys && setMapperKeys(data.mapper_keys);
      }

      const newSuffix = suffix;
      const childDetailsSuffix =
        data.supports_children || data.has_type === false
          ? value === 'request' || value === 'response'
            ? buildOptions()
            : `action=childDetails&${buildOptions()}`
          : buildOptions();

      const splitter = `${realProviders[provider].recordSuffix.includes('?') ? '&' : '?'}`;
      suffixString =
        customOptionString && customOptionString !== ''
          ? `${suffix}${
              data.has_record ? realProviders[provider].recordSuffix : ''
            }${splitter}${customOptionString}${type === 'outputs' ? '&soft=true' : ''}`
          : `${newSuffix}${
              data.has_record || data.has_type ? realProviders[provider].recordSuffix : ''
            }${splitter}${childDetailsSuffix}`;

      // Fetch the record
      const record = await fetchData(`${url}/${value}${suffixString}`);

      handleCallError(record.error);

      // Remove loading
      setIsLoading(false);
      // Save the name by pulling the 3rd item from the split
      // url (same for every provider type)
      const name = `${url}/${value}`.split('/')[2];
      // Set the provider option
      newOptionProvider = {
        ...optionProvider,
        type: realProviders[provider].type,
        name,
        is_api_call: requiresRequest,
        supports_request: data.supports_request,
        supports_read: data.supports_read,
        supports_update: data.supports_update,
        up: data.up !== false,
        supports_create: data.supports_create,
        supports_delete: data.supports_delete,
        supports_messages: data.supports_messages,
        supports_observable: data.supports_observable,
        transaction_management: data.transaction_management,
        record_requires_search_options: data.record_requires_search_options,
        can_manage_fields: record.data?.can_manage_fields,
        subtype: value === 'request' || value === 'response' ? value : undefined,
        descriptions: [...descriptions, data?.desc],
        path: `${url}/${value}`
          .replace(`${name}`, '')
          .replace(`${realProviders[provider].url}/`, '')
          .replace(`provider/`, '')
          .replace('request', '')
          .replace('response', ''),
        options,
        search_options: didApplyOptions ? searchOptions : undefined,
        searchOptionsChanged: false,
      };

      console.log('2');

      if (data.has_type || isConfigItem) {
        // Set the record data
        setRecord &&
          setRecord(!realProviders[provider].requiresRecord ? record.data.fields : record.data);
        //
      }

      console.log('2 after');
    }
    // If this provider has children
    if (size(data.children)) {
      const children = filterChildren(data.children);

      if (!size(children)) {
        setWarning(
          'There are no further paths to go, please go back and select a different path...'
        );
      } else {
        setWarning(undefined);
      }

      setOptionProvider(newOptionProvider);
      // Return the updated items and add
      // the new item
      setChildren([
        ...newItems,
        {
          values: children.map((child) => {
            if (typeof child === 'string') {
              return {
                name: child,
                desc: 'No description provided',
                url: `${url}/${value}${suffix}`,
                suffix: '',
              };
            }

            return {
              ...child,
              url: `${url}/${value}${suffix}`,
              suffix: '',
            };
          }),
          value: null,
        },
      ]);

      return;
    } else if (data.supports_request && !requiresRequest) {
      setOptionProvider(newOptionProvider);
      // Return the updated items and add
      // the new item
      setChildren([
        ...newItems,
        {
          values: [
            {
              name: 'request',
              desc: '',
              url: `${url}/${value}${suffix}`,
              suffix: '',
            },
            {
              name: 'response',
              desc: '',
              url: `${url}/${value}${suffix}`,
              suffix: '',
            },
          ],
          value: null,
        },
      ]);

      return;
    }

    if (data.fields) {
      // Save the name by pulling the 3rd item from the split
      // url (same for every provider type)
      const name = `${url}/${value}`.split('/')[2];
      // Set the provider option
      newOptionProvider = {
        ...optionProvider,
        type: realProviders[provider].type,
        can_manage_fields: data.can_manage_fields,
        name,
        up: data.up !== false,
        supports_read: data.supports_read,
        supports_update: data.supports_update,
        supports_create: data.supports_create,
        supports_delete: data.supports_delete,
        supports_messages: data.supports_messages,
        supports_observable: data.supports_observable,
        transaction_management: data.transaction_management,
        record_requires_search_options: data.record_requires_search_options,
        subtype: value === 'request' || value === 'response' ? value : undefined,
        descriptions: [...descriptions, data?.desc],
        path: `${url}/${value}`
          .replace(`${name}`, '')
          .replace(`${realProviders[provider].url}/`, '')
          .replace('provider/', '')
          .replace('request', '')
          .replace('response', ''),
        options,
        search_options: didApplyOptions ? searchOptions : undefined,
        searchOptionsChanged: false,
      };
      console.log('3');
      // Set the record data
      setRecord && setRecord(data.fields);
    }
    // Check if there is a record
    else if (isConfigItem || data.has_record || !realProviders[provider].requiresRecord) {
      setIsLoading(true);
      if (type === 'outputs' && data.mapper_keys) {
        // Save the mapper keys
        setMapperKeys && setMapperKeys(data.mapper_keys);
      }

      const childDetailsSuffix =
        data.supports_children || data.has_type === false
          ? value === 'request' || value === 'response'
            ? buildOptions()
            : `?action=childDetails&${buildOptions()}`
          : buildOptions();

      const splitter = `${realProviders[provider].recordSuffix.includes('?') ? '&' : '?'}`;
      const newSuffix = suffix;
      suffixString =
        customOptionString && customOptionString !== ''
          ? `${suffix}${
              data.has_record ? realProviders[provider].recordSuffix : ''
            }${splitter}${customOptionString}${type === 'outputs' ? '&soft=true' : ''}`
          : `${newSuffix}${
              data.has_record || data.has_type ? realProviders[provider].recordSuffix : ''
            }${splitter}${childDetailsSuffix}`;

      // Fetch the record
      const record = await fetchData(`${url}/${value}${suffixString}`);

      handleCallError(record.error);

      // Remove loading
      setIsLoading(false);
      // Save the name by pulling the 3rd item from the split
      // url (same for every provider type)
      const name = `${url}/${value}`.split('/')[2];
      // Set the provider option
      newOptionProvider = {
        ...optionProvider,
        type: realProviders[provider].type,
        name,
        up: data.up !== false,
        supports_read: data.supports_read,
        supports_update: data.supports_update,
        supports_create: data.supports_create,
        supports_delete: data.supports_delete,
        can_manage_fields: record.data.can_manage_fields,
        supports_messages: data.supports_messages,
        supports_observable: data.supports_observable,
        transaction_management: data.transaction_management,
        record_requires_search_options: data.record_requires_search_options,
        subtype: value === 'request' || value === 'response' ? value : undefined,
        descriptions: [...descriptions, data?.desc],
        path: `${url}/${value}`
          .replace(`${name}`, '')
          .replace(`${realProviders[provider].url}/`, '')
          .replace('provider/', '')
          .replace('request', '')
          .replace('response', ''),
        options,
        search_options: didApplyOptions ? searchOptions : undefined,
        searchOptionsChanged: false,
      };
      console.log('4');
      // Set the record data
      setRecord &&
        setRecord(!realProviders[provider].requiresRecord ? record.data.fields : record.data);
      //
    }

    console.log(newOptionProvider);
    setOptionProvider(newOptionProvider);
    setChildren(newItems);
  };

  const getDefaultItems = useCallback(
    () =>
      map(realProviders, ({ name, desc }) => ({ name, desc })).filter((prov) =>
        prov.name === 'null' ? canSelectNull : true
      ),
    []
  );

  const description = last(nodes)?.values?.[0]?.desc;

  return (
    <>
      {wildcardDiagram?.isOpen && (
        <CustomDialog
          label={t('Wildcard')}
          isOpen
          bottomActions={[
            submitControl(
              () => {
                handleChildFieldChange(
                  wildcardDiagram.value,
                  wildcardDiagram.url,
                  wildcardDiagram.index,
                  wildcardDiagram.suffix
                );
                setWildcardDiagram(null);
              },
              {
                disabled: !validateField('string', wildcardDiagram.value),
              }
            ),
          ]}
        >
          <ReqoreMessage intent="info">{t('WildcardReplace')}</ReqoreMessage>
          <ReqoreVerticalSpacer height={10} />
          <String
            name="wildcard"
            onChange={(_name, value) => setWildcardDiagram((cur) => ({ ...cur, value }))}
            value={wildcardDiagram.value}
          />
        </CustomDialog>
      )}
      <ReqorePanel minimal={compact} style={style} flat transparent padded={!!title}>
        <ReqoreControlGroup fluid wrap fill>
          <SelectField
            fixed
            name={`provider${type ? `-${type}` : ''}`}
            disabled={isLoading || readOnly}
            className="provider-type-selector"
            defaultItems={getDefaultItems()}
            onChange={(_name, value) => {
              handleProviderChange(value);
            }}
            value={provider}
          />
          {nodes.map((child, index) => (
            <ReqoreControlGroup fluid={false} key={index}>
              {size(child.values) ? (
                <SelectField
                  autoSelect
                  key={`${title}-${index}`}
                  name={`provider-${type ? `${type}-` : ''}${index}`}
                  disabled={isLoading || readOnly}
                  className="provider-selector"
                  filters={['supports_read', 'supports_request', 'has_record', 'up']}
                  defaultItems={child.values.map((child) => ({
                    ...child,
                    intent: child.up === false ? 'danger' : undefined,
                    badge:
                      child.up === false
                        ? {
                            icon: 'ErrorWarningLine',
                            label: 'Connection down',
                            intent: 'danger',
                          }
                        : undefined,
                  }))}
                  onChange={(_name, value) => {
                    // Get the child data
                    const { url, suffix, provider_info } = child.values.find(
                      (val) => val.name === value
                    );
                    // If the value is a wildcard present a dialog that the user has to fill
                    if (value === '*') {
                      setWildcardDiagram({
                        index,
                        isOpen: true,
                        url,
                        suffix,
                      });
                    } else {
                      // Change the child
                      handleChildFieldChange(
                        value,
                        url,
                        index,
                        suffix,
                        undefined,
                        !!provider_info?.constructor_options,
                        !!provider_info?.record_requires_search_options
                      );
                    }
                  }}
                  value={child.value}
                />
              ) : null}
              {index === 0 &&
              searchOptionsChanged &&
              optionProvider?.record_requires_search_options &&
              !readOnly ? (
                <ReqoreButton
                  tooltip="Apply the search options to move forward"
                  icon="RefreshLine"
                  intent="info"
                  disabled={!validateField('system-options', searchOptions)}
                  fixed
                  onClick={() => {
                    const customOptionString = buildOptions();
                    // Get the child data
                    const { url, suffix } = child.values.find((val) => val.name === child.value);
                    // If the value is a wildcard present a dialog that the user has to fill
                    if (child.value === '*') {
                      setWildcardDiagram({
                        index: 0,
                        isOpen: true,
                        url,
                        suffix,
                      });
                    } else {
                      // Change the child
                      handleChildFieldChange(
                        child.value,
                        url,
                        0,
                        suffix,
                        customOptionString,
                        undefined,
                        undefined,
                        true
                      );
                    }
                  }}
                >
                  Apply search options
                </ReqoreButton>
              ) : null}
              {index === 0 && optionsChanged && !readOnly ? (
                <ReqoreButton
                  tooltip="Apply the current options to move forward"
                  icon="RefreshLine"
                  intent="info"
                  disabled={!validateField('system-options', options)}
                  fixed
                  onClick={() => {
                    const customOptionString = buildOptions();
                    // Get the child data
                    const { url, suffix } = child.values.find((val) => val.name === child.value);
                    // If the value is a wildcard present a dialog that the user has to fill
                    if (child.value === '*') {
                      setWildcardDiagram({
                        index: 0,
                        isOpen: true,
                        url,
                        suffix,
                      });
                    } else {
                      // Change the child
                      handleChildFieldChange(
                        child.value,
                        url,
                        0,
                        suffix,
                        customOptionString,
                        undefined,
                        undefined,
                        true
                      );
                    }
                  }}
                >
                  Apply options
                </ReqoreButton>
              ) : null}
            </ReqoreControlGroup>
          ))}
          {isLoading && <Loader />}
          {nodes.length > 0 && !readOnly ? (
            <ReqoreControlGroup fluid={false}>
              {nodes[nodes.length - 2]?.values?.[0]?.url ? (
                <ReqoreButton
                  tooltip="Go back a step"
                  intent="danger"
                  icon="ArrowGoBackLine"
                  className="provider-go-back"
                  fixed
                  onClick={() => {
                    setChildren((cur) => {
                      const result = [...cur];
                      let lastChild = nth(result, -1);

                      if (lastChild.value === null) {
                        result.pop();
                        result.pop();
                      } else {
                        result.pop();
                      }

                      lastChild = nth(result, -1);

                      if (lastChild) {
                        const index = size(result) - 1;
                        const { value, values } = lastChild;
                        // Get the child data
                        const { url, suffix, provider_info } = values.find((val) => {
                          return val.name === value;
                        });

                        // If the value is a wildcard present a dialog that the user has to fill
                        if (value === '*') {
                          setWildcardDiagram({
                            index,
                            isOpen: true,
                            url,
                            suffix,
                          });
                        } else {
                          // Change the child
                          handleChildFieldChange(
                            value,
                            url,
                            index,
                            suffix,
                            undefined,
                            !!provider_info?.constructor_options,
                            !!provider_info?.record_requires_search_options
                          );
                        }
                      }

                      // If there are no children then we need to reset the provider
                      if (size(result) === 0) {
                        handleProviderChange(provider);
                      }

                      return result;
                    });
                  }}
                />
              ) : null}
              {onResetClick && (
                <ReqoreButton
                  tooltip="Remove all data"
                  intent="danger"
                  icon="CloseLine"
                  className="provider-reset"
                  onClick={onResetClick}
                  fixed
                />
              )}
            </ReqoreControlGroup>
          ) : null}
          {record && !optionsChanged ? (
            <ReqoreButton
              intent="success"
              icon="CheckLine"
              fixed
              onClick={() => {
                setFields(record);
                hide();
              }}
            />
          ) : null}
        </ReqoreControlGroup>
        {description ? (
          <ReqoreMessage intent="info" opaque={false} size="small" margin="top">
            <ReactMarkdown>{description}</ReactMarkdown>
          </ReqoreMessage>
        ) : null}
        {errorMessage && (
          <ReqoreMessage title="An error occurred" intent="danger" size="small" margin="top">
            {errorMessage}
          </ReqoreMessage>
        )}
        {warningMessage && (
          <ReqoreMessage title="Warning" intent="warning" size="small" margin="top" opaque={false}>
            {warningMessage}
          </ReqoreMessage>
        )}
      </ReqorePanel>
    </>
  );
};

export default withInitialDataConsumer()(MapperProvider);
