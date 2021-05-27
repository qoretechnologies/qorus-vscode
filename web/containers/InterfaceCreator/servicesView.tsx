import { Button, ButtonGroup } from '@blueprintjs/core';
import { omit, size } from 'lodash';
import React, { FunctionComponent, useState } from 'react';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import { MethodsContext } from '../../context/methods';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ClassConnectionsStateProvider from '../ClassConnectionsStateProvider';
import InterfaceCreatorPanel, { ActionsWrapper, ContentWrapper } from './panel';

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
    service,
    onSubmitSuccess,
    interfaceId,
    initialData,
}) => {
    const [serviceIndex, setServiceIndex] = useState(size(interfaceId.service));
    const [methodsIndex, setMethodsIndex] = useState(size(interfaceId['service-methods']));

    useMount(() => {
        return () => {
            hasAllMethodsLoaded = false;
        };
    });

    return (
        <MethodsContext.Consumer>
            {({
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
            }) => (
                <ClassConnectionsStateProvider type="service">
                    {(classConnectionsProps) => (
                        <>
                            <CreatorWrapper>
                                <PanelWrapper>
                                    {!showMethods && (
                                        <InterfaceCreatorPanel
                                            type={'service'}
                                            submitLabel={t('Next')}
                                            hasClassConnections
                                            {...classConnectionsProps}
                                            hasConfigManager
                                            onSubmit={() => {
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
                                    )}
                                    {showMethods && (
                                        <>
                                            <SidePanel title={t('AddMethodsTitle')}>
                                                <ContentWrapper>
                                                    {methods.map(
                                                        (method: { id: number; name?: string }, index: number) => (
                                                            <MethodSelector
                                                                name={`select-method-${method.name}`}
                                                                key={method.id}
                                                                active={method.id === activeMethod}
                                                                valid={isSubItemValid(
                                                                    method.id,
                                                                    'service-methods',
                                                                    methodsIndex
                                                                )}
                                                                onClick={() => setActiveMethod(method.id)}
                                                            >
                                                                {method.name || `${t('Method')} ${method.id}`}
                                                                {method.id === activeMethod && (
                                                                    <>
                                                                        <Selected />
                                                                    </>
                                                                )}
                                                                {methodsCount !== 1 &&
                                                                !initialData.lang_client_unavailable ? (
                                                                    <RemoveButton
                                                                        name={`remove-method-${method.name}`}
                                                                        onClick={() => {
                                                                            setMethods((current) =>
                                                                                current.filter(
                                                                                    (currentMethod) =>
                                                                                        currentMethod.id !== method.id
                                                                                )
                                                                            );
                                                                            removeSubItemFromFields(
                                                                                method.id,
                                                                                'service-methods',
                                                                                methodsIndex
                                                                            );
                                                                            setMethodsCount(
                                                                                (current: number) => current - 1
                                                                            );
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
                                                            disabled={initialData.lang_client_unavailable}
                                                        />
                                                    </ButtonGroup>
                                                </ActionsWrapper>
                                            </SidePanel>
                                            <InterfaceCreatorPanel
                                                stepOneTitle={t('SelectFieldsSecondStep')}
                                                stepTwoTitle={t('FillDataThirdStep')}
                                                interfaceIndex={methodsIndex}
                                                onBackClick={() => {
                                                    hasAllMethodsLoaded = false;
                                                    setActiveMethod(null);
                                                    setShowMethods(false);
                                                    if (service) {
                                                        initialData.changeInitialData('service.active_method', null);
                                                    }
                                                }}
                                                onDataFinishLoadingRecur={(id) => {
                                                    if (!hasAllMethodsLoaded) {
                                                        if ((id || 1) + 1 <= lastMethodId && !hasAllMethodsLoaded) {
                                                            setActiveMethod(id + 1);
                                                        } else {
                                                            hasAllMethodsLoaded = true;
                                                            setActiveMethod(initialActiveMethod);
                                                        }
                                                    }
                                                }}
                                                initialInterfaceId={
                                                    service ? service.iface_id : interfaceId.service[serviceIndex]
                                                }
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
                                                data={
                                                    methodsData &&
                                                    methodsData.find((method) => method.id === activeMethod)
                                                }
                                                onNameChange={(
                                                    methodId: number,
                                                    name: string,
                                                    originalName?: string
                                                ) => {
                                                    if (originalName) {
                                                        // Rename the trigger
                                                        classConnectionsProps.renameTrigger(originalName, name);
                                                    }

                                                    setMethods((currentMethods: { id: number; name: string }[]) =>
                                                        currentMethods.reduce(
                                                            (cur, method: { id: number; name: string }) => {
                                                                if (methodId === method.id) {
                                                                    method.name = name;
                                                                }

                                                                return [...cur, method];
                                                            },
                                                            []
                                                        )
                                                    );
                                                }}
                                            />
                                        </>
                                    )}
                                </PanelWrapper>
                            </CreatorWrapper>
                        </>
                    )}
                </ClassConnectionsStateProvider>
            )}
        </MethodsContext.Consumer>
    );
};

export default compose(withTextContext(), withFieldsConsumer(), withInitialDataConsumer())(ServicesView);
