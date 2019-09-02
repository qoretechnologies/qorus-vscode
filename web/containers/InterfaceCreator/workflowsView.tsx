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
import { isArray } from 'lodash';
import WorkflowStepDependencyParser from '../../helpers/StepDependencyParser';

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

const ServicesView: FunctionComponent<IServicesView> = ({ t, workflow }) => {
    return (
        <StepsContext.Consumer>
            {({
                showSteps = true,
                setShowSteps,
                highlightedSteps,
                setHighlightedSteps,
                steps,
                setSteps,
                highlightedStepGroupIds,
                setHighlightedStepGroupIds,
                handleStepInsert,
                parsedSteps,
                stepsData,
            }) => (
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
                                        <StepList
                                            steps={steps}
                                            setSteps={setSteps}
                                            highlightedSteps={highlightedSteps}
                                            setHighlightedSteps={setHighlightedSteps}
                                            highlightedStepGroupIds={highlightedStepGroupIds}
                                            setHighlightedStepGroupIds={setHighlightedStepGroupIds}
                                            handleStepInsert={handleStepInsert}
                                            stepsData={stepsData}
                                        />
                                    </ContentWrapper>
                                </SidePanel>
                                <Content title={t('StepsDiagram')}>
                                    <ContentWrapper scrollX>
                                        <StepsCreator
                                            steps={parsedSteps}
                                            highlightedGroupSteps={highlightedStepGroupIds || []}
                                            stepsData={stepsData}
                                        />
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
