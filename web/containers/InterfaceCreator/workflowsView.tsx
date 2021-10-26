import { Button, ButtonGroup, Intent, Tooltip } from '@blueprintjs/core';
import { isArray, omit, reduce, size } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useDebounce } from 'react-use';
import compose from 'recompose/compose';
import styled from 'styled-components';
import { TTranslator } from '../../App';
import Content from '../../components/Content';
import CustomDialog from '../../components/CustomDialog';
import StepDiagram from '../../components/Diagram';
import { Messages } from '../../constants/messages';
import { saveDraft } from '../../helpers/functions';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withGlobalOptionsConsumer from '../../hocomponents/withGlobalOptionsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler, { TPostMessage } from '../../hocomponents/withMessageHandler';
import withStepsConsumer from '../../hocomponents/withStepsConsumer';
import withTextContext from '../../hocomponents/withTextContext';
import ConfigItemManager from '../ConfigItemManager';
import ManageButton from '../ConfigItemManager/manageButton';
import InterfaceCreatorPanel, { ActionsWrapper, ContentWrapper, IField } from './panel';

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

  steps.forEach((step) => {
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
  onSubmitSuccess,
  lastStepId,
}) => {
  const [showConfigItemsManager, setShowConfigItemsManager] = useState<boolean>(false);
  const [workflowIndex, setWorkflowIndex] = useState(size(interfaceId.workflow));

  useEffect(() => {
    if (showSteps) {
      postMessage(Messages.GET_CONFIG_ITEMS, {
        iface_id: interfaceId.workflow[workflowIndex],
        iface_kind: 'workflow',
        steps: size(steps) ? processSteps(steps, stepsData) : undefined,
      });
    }
  }, [showSteps]);

  useDebounce(
    () => {
      if (size(steps)) {
        saveDraft('workflow', interfaceId.workflow[workflowIndex], {
          data: selectedFields.workflow[workflowIndex],
          steps: {
            steps,
            stepsData,
            lastStepId,
          },
        });
      }
    },
    1500,
    [steps, stepsData]
  );

  return (
    <CreatorWrapper>
      {!showSteps && (
        <InterfaceCreatorPanel
          hasConfigManager
          type={'workflow'}
          submitLabel={t('Next')}
          interfaceIndex={workflowIndex}
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
          <Content>
            <ContentWrapper
              scrollX
              style={{
                background: `url(${`${initialData.image_path}/images/tiny_grid.png)`}`,
                paddingRight: 0,
              }}
            >
              <div style={{ width: '100%', display: 'flex', flex: '1 1 auto', flexFlow: 'column' }}>
                <StepDiagram
                  steps={parsedSteps}
                  stepsData={stepsData}
                  handleStepInsert={handleStepInsert}
                  onStepRemove={handleStepRemove}
                  onStepUpdate={handleStepUpdate}
                />
              </div>
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
                    name="interface-creator-submit-workflow-steps"
                    text={t('Submit')}
                    disabled={steps.length === 0}
                    icon={'tick'}
                    intent={Intent.SUCCESS}
                    onClick={async () => {
                      // Build the finished object
                      const newData = reduce(
                        selectedFields.workflow[workflowIndex],
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
                          open_file_on_success: !onSubmitSuccess,
                          no_data_return: !!onSubmitSuccess,
                        },
                        t('Saving workflow...')
                      );

                      if (result.ok) {
                        if (onSubmitSuccess) {
                          onSubmitSuccess(newData);
                        }
                        resetAllInterfaceData('workflow');
                      }
                    }}
                  />
                </ButtonGroup>
              </div>
            </ActionsWrapper>
          </Content>
          {showConfigItemsManager ? (
            <CustomDialog
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
            </CustomDialog>
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
