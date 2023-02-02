import {
  ReqoreColumn,
  ReqoreColumns,
  ReqoreControlGroup,
  ReqoreMessage,
  ReqoreVerticalSpacer,
} from '@qoretechnologies/reqore';
import { reduce, size } from 'lodash';
import { useContext } from 'react';
import { useAsyncRetry } from 'react-use';
import { Messages } from '../../constants/messages';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { callBackendBasic, fetchData } from '../../helpers/functions';
import { validateField } from '../../helpers/validations';
import SubField from '../SubField';
import { IProviderType } from './connectors';
import MethodSelector from './methodSelector';
import Select from './select';
import Options, { IOptions } from './systemOptions';

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
      <SubField title={t('ApiManagerSchema')} isValid={validateField('string', value?.factory)}>
        {schemas.loading ? (
          <ReqoreMessage intent="pending">Loading...</ReqoreMessage>
        ) : schemas.error ? (
          <ReqoreMessage intent="danger" title="Error">
            {schemas.error}
          </ReqoreMessage>
        ) : (
          <Select
            defaultItems={schemas.value}
            value={value?.factory}
            fill
            onChange={(_n, schema) => handleSchemaChange(schema)}
          />
        )}
      </SubField>
      <ReqoreColumns columnsGap="20px" minColumnWidth="400px">
        {isAvailable(providerOptions) && (
          <ReqoreColumn flexFlow="column">
            {providerOptions.loading ? (
              <ReqoreMessage intent="pending">Loading...</ReqoreMessage>
            ) : providerOptions.error ? (
              <ReqoreMessage intent="danger" title="Error">
                {providerOptions.error}
              </ReqoreMessage>
            ) : (
              <Options
                options={providerOptions.value}
                value={value?.['provider-options']}
                name="provider-options"
                isValid={validateField('system-options', value?.['provider-options'])}
                onChange={(_n, data) => handleOptionsChange(data)}
              />
            )}
          </ReqoreColumn>
        )}
        {isAvailable(endpoints) && (
          <ReqoreColumn flexFlow="column">
            <SubField
              title={t('ApiManagerEndpoints')}
              isValid={validateField('api-endpoints', value?.endpoints)}
            >
              {endpoints.loading || !endpoints.value ? (
                <ReqoreMessage intent="pending">Loading...</ReqoreMessage>
              ) : endpoints.error ? (
                <ReqoreMessage intent="danger" title="Error">
                  Failed to load endpoints
                </ReqoreMessage>
              ) : (
                <>
                  <div style={{ flex: 1 }}>
                    {value?.endpoints &&
                      value.endpoints.map((endpoint, index) => (
                        <SubField
                          title={`${index + 1}. ${endpoint.endpoint}`}
                          key={endpoint.endpoint}
                          subtle
                          onRemove={() => {
                            confirmAction('RemoveEndpoint', () => {
                              handleDeleteEndpoint(endpoint.endpoint);
                            });
                          }}
                          isValid={!!endpoint.value}
                        >
                          <ReqoreControlGroup fluid stack fill>
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
                                  context: {
                                    inputType: {
                                      type: 'factory',
                                      name: value?.factory,
                                      path: endpoint.endpoint,
                                      options: value?.['provider-options'],
                                      hasApiContext: true,
                                    } as IProviderType,
                                  },
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
                          </ReqoreControlGroup>
                        </SubField>
                      ))}
                  </div>
                  <ReqoreVerticalSpacer height={10} />
                  <Select
                    defaultItems={availableEndpoints.map((endpoint) => ({
                      name: endpoint.endpoint,
                      desc: `API endpoint for ${endpoint.endpoint}`,
                    }))}
                    fill
                    placeholder={`${t('ManageEndpoints')} (${size(availableEndpoints)})`}
                    onChange={(_n, v) => {
                      handleAddEndpoint(v);
                    }}
                  />
                </>
              )}
            </SubField>
          </ReqoreColumn>
        )}
      </ReqoreColumns>
    </>
  );
};
