import React, { FunctionComponent, useEffect, useState } from 'react';

import { isArray, omit, reduce, size } from 'lodash';
import compose from 'recompose/compose';
import styled from 'styled-components';

import { Button, ButtonGroup, Dialog, Intent, Tooltip } from '@blueprintjs/core';

import { TTranslator } from '../../App';
import Content from '../../components/Content';
import SidePanel from '../../components/SidePanel';
import StepList from '../../components/StepList';
import { Messages } from '../../constants/messages';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withStepsConsumer from '../../hocomponents/withStepsConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ConfigItemManager from '../ConfigItemManager';
import ManageButton from '../ConfigItemManager/manageButton';
import InterfaceCreatorPanel, { ActionsWrapper, ContentWrapper, IField } from './panel';
import StepsCreator from './stepsCreator';

export const CreatorWrapper = styled.div`
    display: flex;
    flex: 1;
    flex-flow: row;
    overflow: hidden;
`;

export interface IServicesView {
    targetDir: string;
    t: TTranslator;
    workflow: any;
    postMessage: TPostMessage;
    initialData: any;
}

export function processSteps(steps, stepsData): any[] {
    const result = [];

    steps.forEach(step => {
        if (isArray(step)) {
            result.push(processSteps(step, stepsData));
        } else {
            result.push(`${stepsData[step].name}:${stepsData[step].version}`);
        }
    });

    return result;
}

const ServicesView: FunctionComponent<IServicesView> = ({
    t,
    workflow,
    fields,
    selectedFields,
    postMessage,
    addMessageListener,
    initialData,
    interfaceId,
    resetFields,
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
    resetAllInterfaceData,
}) => {
    const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);

    useEffect(() => {
        if (showSteps) {
            postMessage(Messages.GET_CONFIG_ITEMS, {
                iface_id: interfaceId.workflow,
                iface_kind: 'workflow',
                steps: size(steps) ? processSteps(steps, stepsData) : undefined,
            });
        }
    }, [showSteps]);

    return (
        <CreatorWrapper>
            {!showSteps && (
                <InterfaceCreatorPanel
                    hasConfigManager
                    type={'workflow'}
                    submitLabel={t('Next')}
                    onSubmit={() => {
                        setShowSteps(true);
                    }}
                    data={workflow && omit(workflow, 'steps')}
                    isEditing={!!workflow}
                    onDataFinishLoading={
                        workflow && workflow.show_steps
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
                        <ContentWrapper style={{ overflowX: 'unset' }}>
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
                            <div style={{ float: 'left', width: '48%' }}>
                                <ButtonGroup fill>
                                    <ManageButton
                                        type="workflow"
                                        disabled={!size(steps)}
                                        onClick={() => setShowConfigItemsManager(true)}
                                    />
                                </ButtonGroup>
                            </div>
                            <div style={{ float: 'right', width: '48%' }}>
                                <ButtonGroup fill>
                                    <Tooltip content={'BackToooltip'}>
                                        <Button
                                            text={t('Back')}
                                            icon={'undo'}
                                            onClick={() => {
                                                if (workflow) {
                                                    initialData.changeInitialData('workflow.show_steps', false);
                                                }
                                                setShowSteps(false);
                                            }}
                                        />
                                    </Tooltip>
                                    <Button
                                        text={t('Submit')}
                                        disabled={steps.length === 0}
                                        icon={'tick'}
                                        intent={Intent.SUCCESS}
                                        onClick={async () => {
                                            // Build the finished object
                                            const newData = reduce(
                                                selectedFields.workflow,
                                                (result: { [key: string]: any }, field: IField) => ({
                                                    ...result,
                                                    [field.name]: field.value,
                                                }),
                                                {}
                                            );
                                            newData.steps = processSteps(steps, stepsData);
                                            const result = await initialData.callBackend(
                                                !!workflow ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
                                                undefined,
                                                {
                                                    iface_kind: 'workflow',
                                                    orig_data: workflow,
                                                    data: newData,
                                                    iface_id: workflow?.iface_id || interfaceId.workflow,
                                                },
                                                t('Saving workflow...')
                                            );

                                            if (result.ok) {
                                                resetAllInterfaceData('workflow');
                                            }
                                        }}
                                    />
                                </ButtonGroup>
                            </div>
                        </ActionsWrapper>
                    </Content>
                    {showConfigItemsManager ? (
                        <Dialog
                            isOpen
                            title={t('ConfigItemsManager')}
                            onClose={() => setShowConfigItemsManager(false)}
                            style={{ width: '80vw', backgroundColor: '#fff' }}
                        >
                            <ConfigItemManager
                                type="workflow"
                                interfaceId={interfaceId.workflow}
                                resetFields={resetFields}
                                steps={processSteps(steps, stepsData)}
                            />
                        </Dialog>
                    ) : null}
                </>
            )}
        </CreatorWrapper>
    );
};

export default compose(
    withTextContext(),
    withFieldsConsumer(),
    withMessageHandler(),
    withInitialDataConsumer(),
    withGlobalOptionsConsumer(),
    withStepsConsumer()
)(ServicesView);
