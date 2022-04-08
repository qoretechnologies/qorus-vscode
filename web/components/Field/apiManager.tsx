import { Callout, ControlGroup } from '@blueprintjs/core';
import { reduce, size } from 'lodash';
import React, { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import styled from 'styled-components';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { callBackendBasic, fetchData } from '../../helpers/functions';
import Spacer from '../Spacer';
import SubField from '../SubField';
import MethodSelector from './methodSelector';
import Select from './select';
import Options, { IOptions, StyledOptionField } from './systemOptions';

export type TApiManagerFactory = 'swagger' | 'soap';
export type TApiManagerEndpointType = 'fsm' | 'method';
export type TApiManagerOptions = IOptions;
export type TApiManagerEndpoint = {
  endpoint: string;
  type?: TApiManagerEndpointType;
  value?: string;
};

export interface IApiManager {
  factory: TApiManagerFactory;
  'provider-options'?: TApiManagerOptions;
  endpoints?: TApiManagerEndpoint[];
}

export interface IApiManagerProps {
  value?: IApiManager;
  name: string;
  onChange: (name: string, value: IApiManager) => void;
}

export const StyledEndpointWrapper = styled(StyledOptionField)``;

export const ApiManager = ({ onChange, name, value }: IApiManagerProps) => {
  const t: any = useContext(TextContext);
  const { callBackend, qorus_instance, confirmAction }: any = useContext(InitialContext);

  const schemas = useAsyncRetry(async () => {
    if (qorus_instance) {
      const data = await fetchData(`/dataprovider/factories/?context=ui&context=api`);

      if (data.error) {
        console.error(data.error);
        throw new Error(data.error);
      }

      return data.data;
    }
    return null;
  }, [qorus_instance]);

  const providerOptions = useAsyncRetry(async () => {
    if (value?.factory && qorus_instance) {
      const data = await fetchData(
        `/dataprovider/factories/${value.factory}/provider_info/constructor_options?context=ui&context=api`
      );

      if (data.error) {
        console.error(data.error);
        throw new Error(data.error);
      }

      return data.data;
    }
    return null;
  }, [value?.factory]);

  const endpoints = useAsyncRetry(async () => {
    if (qorus_instance && value?.['provider-options']?.schema?.value) {
      // Load the contents into the schema string
      const { fileData } = await callBackendBasic(Messages.GET_FILE_CONTENT, undefined, {
        file: value?.['provider-options']?.schema.value,
      });

      const options = {
        ...reduce(
          value!['provider-options'],
          (newOptions, option, optionName) => ({ ...newOptions, [optionName]: option.value }),
          {}
        ),
        schema: fileData,
      };

      const data = await fetchData(
        `/dataprovider/factories/${value!.factory}/provider/apiEndpoints?context=ui&context=api`,
        'PUT',
        {
          provider_options: options,
        }
      );

      if (data.error) {
        console.error(data.error);
        throw new Error(data.error);
      }

      return data.data;
    }
    return null;
  }, [JSON.stringify(value?.['provider-options'])]);

  const handleSchemaChange = (newFactory: TApiManagerFactory) => {
    onChange(name, {
      factory: newFactory,
    });
  };

  const handleOptionsChange = (newOptions: TApiManagerOptions | undefined) => {
    onChange(name, {
      ...value!,
      'provider-options': newOptions,
    });
  };

  /**
   * It takes an endpoint name and adds it to the endpoints array
   * @param {string} endpointName - The name of the endpoint that was selected.
   */
  const handleAddEndpoint = (endpointName: string) => {
    onChange(name, {
      ...value!,
      endpoints: [
        ...(value?.endpoints || []),
        {
          endpoint: endpointName,
        },
      ],
    });
  };

  /**
   * It takes in the endpoint name, the type of the endpoint, and the value of the endpoint. It then
   * updates the endpoints array in the value object with the new endpoint
   * @param {string} endpointName - The name of the endpoint that you want to update.
   * @param {'fsm' | 'method'} [type] - The type of endpoint. This can be either "fsm" or "method".
   * @param {string} [endpointValue] - The value of the endpoint.
   */
  const handleUpdateEndpoint = (
    endpointName: string,
    type?: 'fsm' | 'method',
    endpointValue?: string
  ) => {
    onChange(name, {
      ...value!,
      endpoints: value?.endpoints?.map((endpoint) => {
        if (endpoint.endpoint === endpointName) {
          return {
            ...endpoint,
            type,
            value: endpointValue,
          };
        }
        return endpoint;
      }),
    });
  };

  const handleDeleteEndpoint = (endpoint: string) => {
    // Remove the endpoint from the endpoints array
    onChange(name, {
      ...value!,
      endpoints: value?.endpoints?.filter((endpointItem) => endpointItem.endpoint !== endpoint),
    });
  };

  const isAvailable = (obj: any) => {
    return obj.loading || obj.value || obj.error;
  };

  // Remove selected endpoints from the endpoints value
  const availableEndpoints: { endpoint: string }[] = (endpoints.value || []).filter(
    (endpoint) =>
      !value?.endpoints?.find((endpointItem) => endpointItem.endpoint === endpoint.endpoint)
  );

  return (
    <>
      <SubField title={t('ApiManagerSchema')}>
        {schemas.loading ? (
          <Callout intent="primary">Loading...</Callout>
        ) : schemas.error ? (
          <Callout intent="danger" title="Error">
            {schemas.error}
          </Callout>
        ) : (
          <Select
            defaultItems={schemas.value}
            value={value?.factory}
            onChange={(_n, schema) => handleSchemaChange(schema)}
          />
        )}
      </SubField>
      {isAvailable(providerOptions) && (
        <SubField title={t('ApiManagerProviderOptions')}>
          {providerOptions.loading ? (
            <Callout intent="primary">Loading...</Callout>
          ) : providerOptions.error ? (
            <Callout intent="danger" title="Error">
              {providerOptions.error}
            </Callout>
          ) : (
            <Options
              options={providerOptions.value}
              value={value?.['provider-options']}
              name="provider-options"
              onChange={(_n, data) => handleOptionsChange(data)}
            />
          )}
        </SubField>
      )}
      {isAvailable(endpoints) && (
        <SubField title={t('ApiManagerEndpoints')}>
          {endpoints.loading || !endpoints.value ? (
            <Callout intent="primary">Loading...</Callout>
          ) : endpoints.error ? (
            <Callout intent="danger" title="Error">
              Failed to load endpoints
            </Callout>
          ) : (
            <>
              <div>
                {value?.endpoints &&
                  value.endpoints.map((endpoint, index) => (
                    <StyledEndpointWrapper>
                      <SubField
                        title={`${index + 1}. ${endpoint.endpoint}`}
                        key={endpoint.endpoint}
                        subtle
                        onRemove={() => {
                          confirmAction('RemoveEndpoint', () => {
                            handleDeleteEndpoint(endpoint.endpoint);
                          });
                        }}
                      >
                        <ControlGroup fill>
                          <Select
                            defaultItems={[
                              {
                                name: 'fsm',
                              },
                              {
                                name: 'method',
                              },
                            ]}
                            value={endpoint.type || t('Type')}
                            onChange={(_n, v) => {
                              handleUpdateEndpoint(endpoint.endpoint, v, endpoint.value);
                            }}
                          />
                          {endpoint.type === 'fsm' && (
                            <Select
                              fill
                              onChange={(_name, value) =>
                                handleUpdateEndpoint(endpoint.endpoint, endpoint.type, value)
                              }
                              name="fsm"
                              value={endpoint.value}
                              get_message={{
                                action: 'creator-get-objects',
                                object_type: 'fsm',
                              }}
                              return_message={{
                                action: 'creator-return-objects',
                                object_type: 'fsm',
                                return_value: 'objects',
                              }}
                              reference={{
                                iface_kind: 'fsm',
                              }}
                            />
                          )}
                          {endpoint.type === 'method' && (
                            <MethodSelector
                              name="method-selector"
                              value={endpoint.value}
                              onChange={(_name, value) =>
                                handleUpdateEndpoint(endpoint.endpoint, endpoint.type, value)
                              }
                            />
                          )}
                        </ControlGroup>
                      </SubField>
                    </StyledEndpointWrapper>
                  ))}
              </div>
              <Spacer size={10} />
              <SubField>
                <Select
                  defaultItems={availableEndpoints.map((endpoint) => ({
                    name: endpoint.endpoint,
                    desc: `API endpoint for ${endpoint.endpoint}`,
                  }))}
                  value={`${t('ManageEndpoints')} (${size(availableEndpoints)})`}
                  onChange={(_n, v) => {
                    handleAddEndpoint(v);
                  }}
                />
              </SubField>
            </>
          )}
        </SubField>
      )}
    </>
  );
};
