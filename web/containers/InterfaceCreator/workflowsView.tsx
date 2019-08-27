import React, { FunctionComponent, useState, useEffect } from 'react';
import InterfaceCreatorPanel, { SearchWrapper, ContentWrapper, ActionsWrapper } from './panel';
import compose from 'recompose/compose';
import withTextContext from '../../hocomponents/withTextContext';
import { TTranslator } from '../../App';
import SidePanel from '../../components/SidePanel';
import styled from 'styled-components';
import { ButtonGroup, Button, Callout, Tooltip, Intent } from '@blueprintjs/core';
import { MethodsContext } from '../../context/methods';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import { omit } from 'lodash';
import { StepsContext } from '../../context/steps';
import Content from '../../components/Content';
import StepList from '../../components/StepList';
import StepsCreator from './stepsCreator';

const PanelWrapper = styled.div`
    margin-top: 10px;
    display: flex;
    flex: 1;
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
    workflow: any;
}

const stepTest = [10, 20, 30, [40, [50, 60], 110]];

const ServicesView: FunctionComponent<IServicesView> = ({ t, workflow }) => {
    return (
        <StepsContext.Consumer>
            {({ showSteps = true, setShowSteps }) => (
                <CreatorWrapper>
                    <Callout
                        icon="info-sign"
                        title={showSteps ? t('CreateStepsTipTitle') : t('CreateWorkflowTipTitle')}
                        intent="primary"
                    >
                        {showSteps ? t('CreateStepsTip') : t('CreateWorkflowTip')}
                    </Callout>
                    <PanelWrapper>
                        {!showSteps && (
                            <InterfaceCreatorPanel
                                type={'workflow'}
                                submitLabel={t('Next')}
                                onSubmit={() => {
                                    setShowSteps(true);
                                }}
                                data={workflow && omit(workflow, 'steps')}
                                onDataFinishLoading={
                                    workflow && showSteps
                                        ? () => {
                                              setShowSteps(true);
                                          }
                                        : null
                                }
                            />
                        )}
                        {showSteps && (
                            <>
                                <SidePanel title={t('AddStepsTitle')}>
                                    <ContentWrapper>
                                        <StepList steps={stepTest} />
                                    </ContentWrapper>
                                </SidePanel>
                                <Content title={t('StepsDiagram')}>
                                    <ContentWrapper scrollX>
                                        <StepsCreator />
                                    </ContentWrapper>

                                    <ActionsWrapper>
                                        <ButtonGroup fill>
                                            <Tooltip content={'BackToooltip'}>
                                                <Button
                                                    text={t('Back')}
                                                    icon={'undo'}
                                                    onClick={() => setShowSteps(false)}
                                                />
                                            </Tooltip>
                                            <Button
                                                text={t('Submit')}
                                                disabled={false}
                                                icon={'tick'}
                                                intent={Intent.SUCCESS}
                                            />
                                        </ButtonGroup>
                                    </ActionsWrapper>
                                </Content>
                            </>
                        )}
                    </PanelWrapper>
                </CreatorWrapper>
            )}
        </StepsContext.Consumer>
    );
};

export default compose(
    withTextContext(),
    withFieldsConsumer()
)(ServicesView);
