import React, { FunctionComponent, useState, useEffect } from 'react';
import InterfaceCreatorPanel, { SearchWrapper, ContentWrapper, ActionsWrapper } from './panel';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import styled from 'styled-components';
import { ButtonGroup, Button, Callout } from '@blueprintjs/core';
import { MethodsContext } from '../../context/methods';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import { omit } from 'lodash';
import withInitialData from '../../hocomponents/withInitialData';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

export const MethodSelector = styled.div`
    width: 100%;
    height: 30px;
    line-height: 30px;
    padding: 0px 10px;
    margin-bottom: 5px;
    border: 1px solid #eee;
    border-color: ${props => (props.active ? '#137cbd' : '#eee')};
    border-left-color: ${props => (props.valid ? '#0F9960' : '#DB3737')};
    border-left-width: 3px;
    border-radius: 3px;
    cursor: pointer;
    transition: all 0.1s ease-in;
    position: relative;

    &:hover {
        border-color: #137cbd;

        div:first-child:not(:last-child) {
            right: 35px;
        }

        div:last-child {
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
    isSubItemValid: (id: number, type: string) => boolean;
    removeSubItemFromFields: (id: number, type: string) => void;
    service: any;
    interfaceId: { [key: string]: string };
}

const ServicesView: FunctionComponent<IServicesView> = ({
    t,
    isSubItemValid,
    removeSubItemFromFields,
    service,
    interfaceId,
    initialData,
}) => {
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
            }) => (
                <CreatorWrapper>
                    <PanelWrapper>
                        {!showMethods && (
                            <InterfaceCreatorPanel
                                type={'service'}
                                submitLabel={t('Next')}
                                hasClassConnections
                                hasConfigManager
                                onSubmit={() => {
                                    setActiveMethod(1);
                                    setShowMethods(true);
                                }}
                                data={service && omit(service, 'methods')}
                                isEditing={!!service}
                                onDataFinishLoading={
                                    service && activeMethod
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
                                        {methods.map((method: { id: number; name?: string }, index: number) => (
                                            <MethodSelector
                                                key={method.id}
                                                active={method.id === activeMethod}
                                                valid={isSubItemValid(method.id, 'service-methods')}
                                                onClick={() => setActiveMethod(method.id)}
                                            >
                                                {method.name || `${t('Method')} ${method.id}`}
                                                {method.id === activeMethod && (
                                                    <>
                                                        <Selected />
                                                    </>
                                                )}
                                                {methodsCount !== 1 && (
                                                    <RemoveButton
                                                        onClick={() => {
                                                            setMethods(current =>
                                                                current.filter(
                                                                    currentMethod => currentMethod.id !== method.id
                                                                )
                                                            );
                                                            removeSubItemFromFields(method.id, 'service-methods');
                                                            setMethodsCount((current: number) => current - 1);
                                                        }}
                                                    />
                                                )}
                                            </MethodSelector>
                                        ))}
                                    </ContentWrapper>
                                    <ActionsWrapper>
                                        <ButtonGroup fill>
                                            <Button
                                                text={t('AddMethod')}
                                                icon={'plus'}
                                                onClick={handleAddMethodClick}
                                            />
                                        </ButtonGroup>
                                    </ActionsWrapper>
                                </SidePanel>
                                <InterfaceCreatorPanel
                                    stepOneTitle={t('SelectFieldsSecondStep')}
                                    stepTwoTitle={t('FillDataThirdStep')}
                                    onBackClick={() => {
                                        setActiveMethod(null);
                                        setShowMethods(false);
                                        if (service) {
                                            initialData.changeInitialData('service.active_method', null);
                                        }
                                    }}
                                    initialInterfaceId={service ? service.iface_id : interfaceId.service}
                                    type={'service-methods'}
                                    activeId={activeMethod}
                                    isEditing={!!service}
                                    allMethodsData={methodsData}
                                    methodsList={methods}
                                    data={methodsData && methodsData.find(method => method.id === activeMethod)}
                                    onNameChange={(methodId: number, name: string) => {
                                        setMethods((currentMethods: { id: number; name: string }[]) =>
                                            currentMethods.reduce((cur, method: { id: number; name: string }) => {
                                                if (methodId === method.id) {
                                                    method.name = name;
                                                }

                                                return [...cur, method];
                                            }, [])
                                        );
                                    }}
                                />
                            </>
                        )}
                    </PanelWrapper>
                </CreatorWrapper>
            )}
        </MethodsContext.Consumer>
    );
};

export default compose(withTextContext(), withFieldsConsumer(), withInitialDataConsumer())(ServicesView);
