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

const MethodSelector = styled.div`
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

const Selected = styled.div`
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

const RemoveButton = styled.div`
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

const PanelWrapper = styled.div`
    margin-top: 10px;
    display: flex;
    flex: 1;
`;

const CreatorWrapper = styled.div`
    display: flex;
    flex: 1;
    flex-flow: column;
`;

export interface IServicesView {
    targetDir: string;
    t: TTranslator;
    isMethodValid: (id: number) => boolean;
    removeMethodFromFields: (id: number) => void;
    service: any;
}

const ServicesView: FunctionComponent<IServicesView> = ({ t, isMethodValid, removeMethodFromFields, service }) => {
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
                    <Callout
                        icon="info-sign"
                        title={showMethods ? t('CreateMethodsTipTitle') : t('CreateServiceTipTitle')}
                        intent="primary"
                    >
                        {showMethods ? t('CreateMethodsTip') : t('CreateServiceTip')}
                    </Callout>
                    <PanelWrapper>
                        {!showMethods && (
                            <InterfaceCreatorPanel
                                type={'service'}
                                submitLabel={t('Next')}
                                onSubmit={() => {
                                    setActiveMethod(1);
                                    setShowMethods(true);
                                }}
                                data={service && omit(service, 'methods')}
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
                                                valid={isMethodValid(method.id)}
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
                                                            removeMethodFromFields(method.id);
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
                                    }}
                                    type={'service-methods'}
                                    activeId={activeMethod}
                                    isEditing={!!service}
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

export default compose(
    withTextContext(),
    withFieldsConsumer()
)(ServicesView);
