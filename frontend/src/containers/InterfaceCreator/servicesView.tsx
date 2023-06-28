import {
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMenuItem,
} from '@qoretechnologies/reqore';
import { IReqoreIconName } from '@qoretechnologies/reqore/dist/types/icons';
import { cloneDeep, omit, size } from 'lodash';
import { FunctionComponent, useContext, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { TApiManagerEndpoint } from '../../components/Field/apiManager';
import { PositiveColorEffect, SelectorColorEffect } from '../../components/Field/multiPair';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { MethodsContext } from '../../context/methods';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import InterfaceCreatorPanel from './panel';

let hasAllMethodsLoaded: boolean;

export interface IMethodSelectorProps {
  children: string | number;
  isValid?: boolean;
  selected?: boolean;
  onClick?: (itemId: string) => void;
  onRemoveClick?: (event: any) => void;
  rightIcon?: IReqoreIconName;
}

export const MethodSelector = ({
  children,
  isValid,
  selected,
  onClick,
  onRemoveClick,
  rightIcon,
}: IMethodSelectorProps) => {
  return (
    <ReqoreMenuItem
      rightIcon={rightIcon || (onRemoveClick ? 'DeleteBinLine' : undefined)}
      onRightIconClick={onRemoveClick}
      onClick={onClick}
      intent={isValid ? undefined : 'danger'}
      flat={isValid}
      effect={{
        ...SelectorColorEffect,
        glow: selected
          ? {
              color: 'info',
            }
          : undefined,
      }}
    >
      {children}
    </ReqoreMenuItem>
  );
};

export const Selected = styled.div`
  position: absolute;
  right: 15px;
  top: 50%;
  width: 8px;
  height: 8px;
  transform: translateY(-50%);
  transition: all 0.3s ease-in;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
  }

  &:after {
    left: 50%;
    width: 100%;
    height: 100%;
    border-radius: 99px;
    background-color: #137cbd;
  }
`;

export const RemoveButton = styled.div`
  transition: all 0.3s ease-in;
  position: absolute;
  right: 5px;
  top: 50%;
  width: 16px;
  height: 16px;
  transform: translateY(-50%);
  opacity: 0;

  &:after,
  &:before {
    position: absolute;
    content: '';
    display: block;
    background-color: #eee;
  }

  &:after {
    left: 50%;
    transform: translateX(-50%);
    width: 2px;
    height: 100%;
  }

  &:before {
    top: 50%;
    transform: translateY(-50%);
    width: 100%;
    height: 2px;
  }
`;

export const PanelWrapper = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

const CreatorWrapper = styled.div`
  display: flex;
  flex: 1;
  flex-flow: column;
  overflow: hidden;
`;

export interface IServicesView {
  targetDir: string;
  t: TTranslator;
  isSubItemValid: any;
  removeSubItemFromFields: any;
  service: any;
  interfaceId: { [key: string]: string };
}

const ServicesView: FunctionComponent<IServicesView> = ({
  t,
  isSubItemValid,
  removeSubItemFromFields,
  updateField,
  getFieldData,
  service,
  onSubmitSuccess,
  interfaceId,
  initialData,
  classConnectionsProps,
}) => {
  const [serviceIndex, setServiceIndex] = useState(size(interfaceId.service));
  const [methodsIndex, setMethodsIndex] = useState(size(interfaceId['service-methods']));
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const {
    showMethods,
    methods,
    setActiveMethod,
    activeMethod,
    methodsCount,
    setMethods,
    setMethodsCount,
    handleAddMethodClick,
    setShowMethods,
    methodsData,
    lastMethodId,
    initialActiveMethod,
    initialShowMethods,
  }: any = useContext<any>(MethodsContext);

  useMount(() => {
    hasAllMethodsLoaded = false;
  });

  useUnmount(() => {
    hasAllMethodsLoaded = false;
  });

  useUpdateEffect(() => {
    if (draft && showMethods) {
      maybeApplyDraft(
        'service',
        null,
        service,
        null,
        classConnectionsProps.setClassConnectionsFromDraft
      );
    }
  }, [draft, showMethods]);

  const handleDataFinishLoadingRecur = (id) => {
    if (!hasAllMethodsLoaded) {
      if ((id || 1) + 1 <= lastMethodId) {
        setActiveMethod(id + 1);
      } else {
        hasAllMethodsLoaded = true;
        setActiveMethod(1);
      }
    }
  };

  return (
    <>
      <CreatorWrapper>
        <PanelWrapper>
          <div style={{ display: !showMethods ? 'flex' : 'none', width: '100%' }}>
            <InterfaceCreatorPanel
              type={'service'}
              submitLabel={t('Next')}
              hasClassConnections
              {...classConnectionsProps}
              hasConfigManager
              onSubmit={() => {
                if (service) {
                  initialData.changeInitialData('service.active_method', 1);
                }
                setActiveMethod(1);
                setShowMethods(true);
              }}
              interfaceIndex={serviceIndex}
              data={service && omit(service, 'methods')}
              isEditing={!!service}
              onDataFinishLoading={
                service && initialShowMethods
                  ? () => {
                      setShowMethods(true);
                    }
                  : null
              }
            />
          </div>
          <div style={{ display: showMethods ? 'flex' : 'none', width: '100%' }}>
            <SidePanel>
              <ReqoreMenu style={{ flex: 1 }} width="250px" rounded>
                <ReqoreMenuDivider label={t('AddMethodsTitle')} />
                <ReqoreMenuItem
                  icon={'MenuAddLine'}
                  onClick={handleAddMethodClick}
                  tooltip={t('AddMethod')}
                  effect={PositiveColorEffect}
                >
                  {t('AddMethod')}
                </ReqoreMenuItem>
                {methods.map(
                  (
                    method: {
                      id: number;
                      name?: string;
                    },
                    index: number
                  ) => (
                    <MethodSelector
                      key={index}
                      selected={method.id === activeMethod}
                      isValid={isSubItemValid(method.id, 'service-methods', methodsIndex)}
                      onClick={() => setActiveMethod(method.id)}
                      onRemoveClick={
                        methodsCount !== 1
                          ? () => {
                              setMethods((current) =>
                                current.filter((currentMethod) => currentMethod.id !== method.id)
                              );
                              removeSubItemFromFields(method.id, 'service-methods', methodsIndex);
                              setMethodsCount((current: number) => current - 1);
                              // Check if there is an endpoint that uses this method
                              // Rename methods in api manager
                              const apiManager = cloneDeep(
                                getFieldData('service', serviceIndex, 'api-manager')?.value || {}
                              );
                              /* Updating the endpoint name in the api-manager. */
                              /* Checking if the apiManager exists and if it has an endpoint with the name of the
                        original name. */
                              if (
                                apiManager &&
                                apiManager?.endpoints?.find(
                                  (endpoint: TApiManagerEndpoint) => endpoint.value === method.name
                                )
                              ) {
                                // Rename the endpoint
                                apiManager.endpoints = apiManager.endpoints.filter(
                                  (endpoint: TApiManagerEndpoint) => {
                                    if (endpoint.value === method.name) {
                                      return false;
                                    }
                                    return true;
                                  }
                                );
                                // Update the field
                                updateField(
                                  'service',
                                  'api-manager',
                                  apiManager,
                                  service ? service.iface_id : interfaceId.service[serviceIndex],
                                  serviceIndex
                                );
                              }
                            }
                          : undefined
                      }
                    >
                      {method.name || `${t('Method')} ${method.id}`}
                    </MethodSelector>
                  )
                )}
              </ReqoreMenu>
            </SidePanel>
            <ReqoreHorizontalSpacer width={10} />
            <InterfaceCreatorPanel
              key={`method-${activeMethod}`}
              stepOneTitle={t('SelectFieldsSecondStep')}
              stepTwoTitle={t('FillDataThirdStep')}
              interfaceIndex={methodsIndex}
              onBackClick={() => {
                hasAllMethodsLoaded = false;
                setActiveMethod(1);
                setShowMethods(false);
                if (service) {
                  initialData.changeInitialData('service.active_method', null);
                }
              }}
              onDataFinishLoadingRecur={handleDataFinishLoadingRecur}
              initialInterfaceId={service ? service.iface_id : interfaceId.service[serviceIndex]}
              type={'service-methods'}
              activeId={activeMethod}
              isEditing={!!service}
              allMethodsData={methodsData}
              {...classConnectionsProps}
              hasClassConnections
              methodsList={methods}
              onSubmitSuccess={onSubmitSuccess}
              onSubmit={() => {
                hasAllMethodsLoaded = false;
              }}
              forceSubmit
              data={{
                ...(methodsData || []).find((method) => method.id === activeMethod),
                lang: service?.lang,
              }}
              parentData={service}
              onNameChange={(methodId: number, name: string, originalName?: string) => {
                if (originalName) {
                  // Rename the trigger
                  classConnectionsProps.renameTrigger(originalName, name);
                  // Rename methods in api manager
                  const apiManager = cloneDeep(
                    getFieldData('service', serviceIndex, 'api-manager')?.value || {}
                  );
                  /* Updating the endpoint name in the api-manager. */
                  /* Checking if the apiManager exists and if it has an endpoint with the name of the
                  original name. */
                  if (
                    apiManager &&
                    apiManager?.endpoints?.find(
                      (endpoint: TApiManagerEndpoint) => endpoint.value === originalName
                    )
                  ) {
                    // Rename the endpoint
                    apiManager.endpoints = apiManager.endpoints.map(
                      (endpoint: TApiManagerEndpoint) => {
                        if (endpoint.value === originalName) {
                          endpoint.value = name;
                        }
                        return endpoint;
                      }
                    );
                    // Update the field
                    updateField(
                      'service',
                      'api-manager',
                      apiManager,
                      service ? service.iface_id : interfaceId.service[serviceIndex],
                      serviceIndex
                    );
                  }
                }

                setMethods(
                  (
                    currentMethods: {
                      id: number;
                      name: string;
                    }[]
                  ) =>
                    currentMethods.reduce(
                      (
                        cur,
                        method: {
                          id: number;
                          name: string;
                        }
                      ) => {
                        if (methodId == method.id) {
                          method.name = name;
                        }

                        return [...cur, method];
                      },
                      []
                    )
                );
              }}
            />
          </div>
        </PanelWrapper>
      </CreatorWrapper>
    </>
  );
};

export default compose(
  withTextContext(),
  withFieldsConsumer(),
  withInitialDataConsumer()
)(ServicesView);
