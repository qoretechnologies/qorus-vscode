import { Button, ButtonGroup } from '@blueprintjs/core';
import { cloneDeep, omit, size } from 'lodash';
import React, { FunctionComponent, useContext, useState } from 'react';
import { useUnmount, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import { TApiManagerEndpoint } from '../../components/Field/apiManager';
import InterfaceCreatorPanel, {
  ActionsWrapper,
  ContentWrapper,
} from '../../components/FieldWrapper';
import SidePanel from '../../components/SidePanel';
import { DraftsContext } from '../../context/drafts';
import { MethodsContext } from '../../context/methods';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';

let hasAllMethodsLoaded: boolean;

export const MethodSelector = styled.div`
  width: 100%;
  height: 30px;
  line-height: 30px;
  padding: 0px 10px;
  margin-bottom: 5px;
  border: 1px solid #eee;
  border-color: ${(props) => (props.active ? '#137cbd' : '#eee')};
  border-left-color: ${(props) => (props.valid ? '#0F9960' : '#DB3737')};
  border-left-width: 3px;
  border-radius: 3px;
  cursor: pointer;
  transition: all 0.1s ease-in;
  position: relative;

  div.bp3-button-group {
    float: right;
  }

  &:hover {
    border-color: #137cbd;

    div:not(.bp3-button-group):first-child:not(:last-child) {
      right: 35px;
    }

    div:not(.bp3-button-group):last-child {
      opacity: 0.7;
      transform: translateY(-50%) rotateZ(45deg);

      &:after,
      &:before {
        background-color: #db3737;
      }
    }
  }
`;

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
  margin-top: 10px;
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
      if ((id || 1) + 1 <= lastMethodId && !hasAllMethodsLoaded) {
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
            <SidePanel title={t('AddMethodsTitle')}>
              <ContentWrapper>
                {methods.map(
                  (
                    method: {
                      id: number;
                      name?: string;
                    },
                    index: number
                  ) => (
                    <MethodSelector
                      name={`select-method-${method.name}`}
                      key={index}
                      active={method.id === activeMethod}
                      valid={isSubItemValid(method.id, 'service-methods', methodsIndex)}
                      onClick={() => setActiveMethod(method.id)}
                    >
                      {method.name || `${t('Method')} ${method.id}`}
                      {method.id === activeMethod && (
                        <>
                          <Selected />
                        </>
                      )}
                      {methodsCount !== 1 && !initialData.lang_client_unavailable ? (
                        <RemoveButton
                          name={`remove-method-${method.name}`}
                          onClick={() => {
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
                          }}
                        />
                      ) : null}
                    </MethodSelector>
                  )
                )}
              </ContentWrapper>
              <ActionsWrapper>
                <ButtonGroup fill>
                  <Button
                    name={'add-method-button'}
                    text={t('AddMethod')}
                    icon={'plus'}
                    onClick={handleAddMethodClick}
                    // Figure out why is this here
                    //disabled={initialData.lang_client_unavailable}
                  />
                </ButtonGroup>
              </ActionsWrapper>
            </SidePanel>
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
