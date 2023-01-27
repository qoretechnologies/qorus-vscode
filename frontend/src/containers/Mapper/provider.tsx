import { Button, Callout, Classes, Spinner } from '@blueprintjs/core';
import {
  ReqoreButton,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqorePanel,
} from '@qoretechnologies/reqore';
import { cloneDeep, omit } from 'lodash';
import map from 'lodash/map';
import nth from 'lodash/nth';
import size from 'lodash/size';
import { FC, useCallback, useContext, useState } from 'react';
import { useDebounce } from 'react-use';
import styled, { css } from 'styled-components';
import CustomDialog from '../../components/CustomDialog';
import { TRecordType } from '../../components/Field/connectors';
import SelectField from '../../components/Field/select';
import String from '../../components/Field/string';
import SubField from '../../components/SubField';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

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
}

const StyledWrapper = styled.div<{ compact?: boolean; hasTitle: boolean }>`
  margin-bottom: 10px;
  ${({ compact, hasTitle }) =>
    compact
      ? css`
          margin-top: ${hasTitle ? '10px' : 0};
        `
      : css`
          margin: 0 auto;
          text-align: center;
        `}
  > span {
    vertical-align: middle;
    font-weight: 500;
    line-height: 20px;
  }
`;

const StyledHeader = styled.h3`
  margin: 0;
  margin-bottom: 10px;
  text-align: center;
`;

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
  requiresRequest,
  optionsChanged,
  onResetClick,
  optionProvider,
  recordType,
  isPipeline,
}) => {
  const [wildcardDiagram, setWildcardDiagram] = useState(undefined);
  const [optionString, setOptionString] = useState('');
  const [descriptions, setDescriptions] = useState<string[]>([]);
  const [errorMessage, onError] = useState<string | null>(null);
  const t = useContext(TextContext);

  /* When the options hash changes, we want to update the query string. */
  useDebounce(
    () => {
      if (size(options)) {
        // Turn the options hash into a query string
        const str = map(options, (value, key) => `${key}=${btoa(value.value)}`).join(',');
        setOptionString(`provider_yaml_options={${str}}`);
      } else {
        setOptionString('provider_yaml_options={}');
      }
    },
    500,
    [options]
  );

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
        return (
          child.up !== false &&
          (child.supports_request || child.children_can_support_apis || child.has_provider)
        );
      }

      return true;
    });
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

        if (error) {
          onError?.(`${record.error.error.err}: ${record.error.error.desc}`);
        } else {
          onError?.(null);
        }

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

  const handleChildFieldChange: (
    value: string,
    url: string,
    itemIndex: number,
    suffix?: string
  ) => void = async (value, url, itemIndex, suffix) => {
    // Clear the data
    clear && clear(true);
    // Set loading
    setIsLoading(true);
    const newSuffix = realProviders[provider].withDetails
      ? value === 'request' || value === 'response'
        ? ''
        : `${suffix}?action=childDetails`
      : suffix;
    // Build the suffix
    let suffixString = realProviders[provider].suffixRequiresOptions
      ? optionString && optionString !== '' && size(options)
        ? `${newSuffix}${realProviders[provider].withDetails ? '&' : '?'}${optionString}`
        : itemIndex === 1
        ? value === 'request' || value === 'response'
          ? ''
          : '?action=childDetails'
        : newSuffix
      : newSuffix;
    // Fetch the data

    const { data = {}, error } = await fetchData(`${url}/${value}${suffixString}`);

    if (error) {
      const errMessage = `${error.error.err}: ${error.error.desc}`;
      onError?.(errMessage);
    } else {
      onError?.(null);
    }
    // Reset loading
    setIsLoading(false);

    /* Setting the state of the descriptions hash. */
    if (data.desc) {
      // Add the description to the descriptions hash
      setDescriptions((current): string[] => {
        const newData = [...current];
        newData[itemIndex] = data.desc;
        return newData;
      });
    }
    // Add new child
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

      if (
        data.has_type ||
        isConfigItem ||
        provider === 'factory' ||
        (requiresRequest && data.supports_request)
      ) {
        (async () => {
          setIsLoading(true);

          if (type === 'outputs' && data.mapper_keys) {
            // Save the mapper keys
            setMapperKeys && setMapperKeys(data.mapper_keys);
          }

          const newSuffix = suffix;
          const childDetailsSuffix =
            data.supports_children || data.has_type === false
              ? value === 'request' || value === 'response'
                ? ''
                : `action=childDetails`
              : '';

          suffixString = realProviders[provider].suffixRequiresOptions
            ? optionString && optionString !== '' && size(options)
              ? `${suffix}${realProviders[provider].recordSuffix}?${optionString}${
                  type === 'outputs' ? '&soft=true' : ''
                }`
              : `${newSuffix}${
                  data.has_record || data.has_type ? realProviders[provider].recordSuffix : '?'
                }${childDetailsSuffix}`
            : `${newSuffix}${
                data.has_record || data.has_type ? realProviders[provider].recordSuffix : '?'
              }${childDetailsSuffix}`;

          // Fetch the record
          const record = await fetchData(`${url}/${value}${suffixString}`);
          if (record.error) {
            const errMessage = `${record.error.error.err}: ${record.error.error.desc}`;
            onError?.(errMessage);
          } else {
            onError?.(null);
          }

          // Remove loading
          setIsLoading(false);
          // Save the name by pulling the 3rd item from the split
          // url (same for every provider type)
          const name = `${url}/${value}`.split('/')[2];
          // Set the provider option
          setOptionProvider({
            type: realProviders[provider].type,
            name,
            is_api_call: requiresRequest,
            supports_request: data.supports_request,
            supports_read: data.supports_read,
            supports_update: data.supports_update,
            supports_create: data.supports_create,
            supports_delete: data.supports_delete,
            can_manage_fields: record.data?.can_manage_fields,
            subtype: value === 'request' || value === 'response' ? value : undefined,
            descriptions: [...(optionProvider?.descriptions || []), ...descriptions, data.desc],
            path: `${url}/${value}`
              .replace(`${name}`, '')
              .replace(`${realProviders[provider].url}/`, '')
              .replace(`provider/`, '')
              .replace('request', '')
              .replace('response', ''),
            options,
          });

          if (data.has_type || isConfigItem) {
            // Set the record data
            setRecord &&
              setRecord(!realProviders[provider].requiresRecord ? record.data.fields : record.data);
            //
          }
        })();
      }
      // If this provider has children
      if (size(data.children)) {
        const children = filterChildren(data.children);
        // Return the updated items and add
        // the new item
        return [
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
        ];
      } else if (data.supports_request && !requiresRequest) {
        // Return the updated items and add
        // the new item
        return [
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
        ];
      }

      if (data.fields) {
        // Save the name by pulling the 3rd item from the split
        // url (same for every provider type)
        const name = `${url}/${value}`.split('/')[2];
        // Set the provider option
        setOptionProvider({
          type: realProviders[provider].type,
          can_manage_fields: data.can_manage_fields,
          name,
          supports_read: data.supports_read,
          supports_update: data.supports_update,
          supports_create: data.supports_create,
          supports_delete: data.supports_delete,
          subtype: value === 'request' || value === 'response' ? value : undefined,
          descriptions: [...(optionProvider?.descriptions || []), ...descriptions, data.desc],
          path: `${url}/${value}`
            .replace(`${name}`, '')
            .replace(`${realProviders[provider].url}/`, '')
            .replace('provider/', '')
            .replace('request', '')
            .replace('response', ''),
        });
        // Set the record data
        setRecord && setRecord(data.fields);
      }
      // Check if there is a record
      else if (isConfigItem || data.has_record || !realProviders[provider].requiresRecord) {
        (async () => {
          setIsLoading(true);
          if (type === 'outputs' && data.mapper_keys) {
            // Save the mapper keys
            setMapperKeys && setMapperKeys(data.mapper_keys);
          }

          const childDetailsSuffix =
            data.supports_children || data.has_type === false
              ? value === 'request' || value === 'response'
                ? ''
                : `action=childDetails`
              : '';

          const newSuffix = suffix;
          suffixString = realProviders[provider].suffixRequiresOptions
            ? optionString && optionString !== '' && size(options)
              ? `${suffix}${realProviders[provider].recordSuffix}?${optionString}${
                  type === 'outputs' ? '&soft=true' : ''
                }`
              : `${newSuffix}${
                  data.has_record || data.has_type ? realProviders[provider].recordSuffix : '?'
                }${childDetailsSuffix}`
            : `${newSuffix}${
                data.has_record || data.has_type ? realProviders[provider].recordSuffix : '?'
              }${childDetailsSuffix}`;

          // Fetch the record
          const record = await fetchData(`${url}/${value}${suffixString}`);

          if (record.error) {
            const errMessage = `${record.error.error.err}: ${record.error.error.desc}`;
            onError?.(errMessage);
          } else {
            onError?.(null);
          }

          // Remove loading
          setIsLoading(false);
          // Save the name by pulling the 3rd item from the split
          // url (same for every provider type)
          const name = `${url}/${value}`.split('/')[2];
          // Set the provider option
          setOptionProvider({
            type: realProviders[provider].type,
            name,
            supports_read: data.supports_read,
            supports_update: data.supports_update,
            supports_create: data.supports_create,
            supports_delete: data.supports_delete,
            can_manage_fields: record.data.can_manage_fields,
            subtype: value === 'request' || value === 'response' ? value : undefined,
            descriptions: [...(optionProvider?.descriptions || []), ...descriptions, data.desc],
            path: `${url}/${value}`
              .replace(`${name}`, '')
              .replace(`${realProviders[provider].url}/`, '')
              .replace('provider/', '')
              .replace('request', '')
              .replace('response', ''),
            options,
          });
          // Set the record data
          setRecord &&
            setRecord(!realProviders[provider].requiresRecord ? record.data.fields : record.data);
          //
        })();
      }

      return [...newItems];
    });
  };

  const getDefaultItems = useCallback(
    () =>
      map(realProviders, ({ name, desc }) => ({ name, desc })).filter((prov) =>
        prov.name === 'null' ? canSelectNull : true
      ),
    []
  );

  return (
    <>
      {wildcardDiagram?.isOpen && (
        <CustomDialog title={t('Wildcard')} isOpen isCloseButtonShown={false}>
          <div className={Classes.DIALOG_BODY}>
            <Callout intent="primary">{t('WildcardReplace')}</Callout>
            <br />
            <String
              name="wildcard"
              onChange={(_name, value) => setWildcardDiagram((cur) => ({ ...cur, value }))}
              value={wildcardDiagram.value}
            />
          </div>
          <div className={Classes.DIALOG_FOOTER}>
            <div className={Classes.DIALOG_FOOTER_ACTIONS}>
              <Button
                intent="success"
                disabled={!validateField('string', wildcardDiagram.value)}
                onClick={() => {
                  handleChildFieldChange(
                    wildcardDiagram.value,
                    wildcardDiagram.url,
                    wildcardDiagram.index,
                    wildcardDiagram.suffix
                  );
                  setWildcardDiagram(null);
                }}
                text={t('Submit')}
              />
            </div>
          </div>
        </CustomDialog>
      )}
      <ReqorePanel minimal={compact} style={style} flat transparent padded={!!title}>
        <ReqoreControlGroup fluid wrap fill>
          <SelectField
            fixed
            name={`provider${type ? `-${type}` : ''}`}
            disabled={isLoading}
            defaultItems={getDefaultItems()}
            onChange={(_name, value) => {
              handleProviderChange(value);
            }}
            value={provider}
          />
          {nodes.map((child, index) => (
            <ReqoreControlGroup fluid={false} key={index}>
              <SelectField
                key={`${title}-${index}`}
                name={`provider-${type ? `${type}-` : ''}${index}`}
                disabled={isLoading}
                filters={['supports_read', 'supports_request', 'has_record']}
                defaultItems={child.values}
                onChange={(_name, value) => {
                  // Get the child data
                  const { url, suffix } = child.values.find((val) => val.name === value);
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
                    handleChildFieldChange(value, url, index, suffix);
                  }
                }}
                value={child.value}
              />
              {index === 0 && optionsChanged ? (
                <ReqoreButton
                  tooltip="Apply the current options to move forward"
                  icon="RefreshLine"
                  intent="info"
                  fixed
                  onClick={() => {
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
                      handleChildFieldChange(child.value, url, 0, suffix);
                    }
                  }}
                >
                  Apply options
                </ReqoreButton>
              ) : null}
            </ReqoreControlGroup>
          ))}
          {isLoading && <Spinner size={15} />}
          {nodes.length > 0 && (
            <ReqoreControlGroup fluid={false}>
              <ReqoreButton
                tooltip="Go back a step"
                intent="danger"
                icon="ArrowGoBackLine"
                fixed
                onClick={() => {
                  setChildren((cur) => {
                    const result = [...cur];

                    result.pop();

                    const lastChild = nth(result, -2);

                    if (lastChild) {
                      const index = size(result) - 2;
                      const { value, values } = lastChild;
                      const { url, suffix } = values.find((val) => val.name === value);

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
                        handleChildFieldChange(value, url, index, suffix);
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

              {onResetClick && (
                <ReqoreButton
                  tooltip="Remove all data"
                  intent="danger"
                  icon="CloseLine"
                  onClick={onResetClick}
                  fixed
                />
              )}
            </ReqoreControlGroup>
          )}
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
        {errorMessage && (
          <SubField>
            <ReqoreMessage title="An error occurred" intent="danger">
              {errorMessage}
            </ReqoreMessage>
          </SubField>
        )}
      </ReqorePanel>
    </>
  );
};

export default withInitialDataConsumer()(MapperProvider);
