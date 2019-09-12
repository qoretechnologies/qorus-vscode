import React, { FunctionComponent, useState, useEffect } from 'react';
import InterfaceCreatorPanel, { SearchWrapper, ContentWrapper, ActionsWrapper, IField } from './panel';
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
import { isArray, reduce } from 'lodash';
import WorkflowStepDependencyParser from '../../helpers/StepDependencyParser';
import { Messages } from '../../constants/messages';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';

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
    postMessage: TPostMessage;
}

const ServicesView: FunctionComponent<IServicesView> = ({
    t,
    workflow,
    fields,
    selectedFields,
    postMessage,
    initialData,
}) => {
    return (
        <StepsContext.Consumer>
            {({
                showSteps,
                setShowSteps,
                highlightedSteps,
                setHighlightedSteps,
                steps,
                setSteps,
                highlightedStepGroupIds,
                setHighlightedStepGroupIds,
                handleStepInsert,
                handleStepRemove,
                handleStepUpdate,
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
                                            onStepRemove={handleStepRemove}
                                            onStepUpdate={handleStepUpdate}
                                            stepsData={stepsData}
                                            stepsCount={steps.length}
                                        />
                                    </ContentWrapper>
                                </SidePanel>
                                <Content title={t('StepsDiagram')}>
                                    <ContentWrapper
                                        scrollX
                                        style={{
                                            background: `url(${
                                                process.env.NODE_ENV === 'development'
                                                    ? `http://localhost:9876/images/tiny_grid.png`
                                                    : `vscode-resource:${initialData.path}/images/tiny_grid.png)`
                                            }`,
                                        }}
                                    >
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
                                                disabled={steps.length === 0}
                                                icon={'tick'}
                                                intent={Intent.SUCCESS}
                                                onClick={() => {
                                                    function processSteps(steps): any[] {
                                                        const result = [];

                                                        steps.forEach(step => {
                                                            if (isArray(step)) {
                                                                result.push(processSteps(step));
                                                            } else {
                                                                result.push(stepsData[step].name);
                                                            }
                                                        });

                                                        return result;
                                                    }
                                                    // Build the finished object
                                                    const newData = reduce(
                                                        selectedFields.workflow,
                                                        (result: { [key: string]: any }, field: IField) => ({
                                                            ...result,
                                                            [field.name]: field.value,
                                                        }),
                                                        {}
                                                    );
                                                    newData.steps = processSteps(steps);

                                                    postMessage(
                                                        !!workflow
                                                            ? Messages.EDIT_INTERFACE
                                                            : Messages.CREATE_INTERFACE,
                                                        {
                                                            iface_kind: 'workflow',
                                                            data: newData,
                                                        }
                                                    );
                                                }}
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
    withFieldsConsumer(),
    withMessageHandler(),
    withInitialDataConsumer()
)(ServicesView);
