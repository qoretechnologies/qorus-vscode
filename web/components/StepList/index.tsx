import { Button, ButtonGroup, Classes, ControlGroup, Tooltip } from '@blueprintjs/core';
import { flattenDeep, isArray, size, some } from 'lodash';
import React, { useEffect, useState } from 'react';
import { onlyUpdateForKeys } from 'recompose';
import compose from 'recompose/compose';
import styled, { css } from 'styled-components';
import InterfaceCreatorPanel, {
  ActionsWrapper,
  FieldInputWrapper,
} from '../../components/FieldWrapper';
import { Messages } from '../../constants/messages';
import { StyledDialogBody } from '../../containers/ClassConnectionsManager';
import ClassConnectionsStateProvider from '../../containers/ClassConnectionsStateProvider';
import { CreatorWrapper } from '../../containers/InterfaceCreator/mapperView';
import withFieldsConsumer from '../../hocomponents/withFieldsConsumer';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import { AddStepButton } from '../AddStepButton';
import CustomDialog from '../CustomDialog';
import SelectField from '../Field/select';
import { FieldName, FieldType } from '../FieldSelector';

const StyledStepWrapper = styled.div`
  .bp3-popover-wrapper {
    display: block;
    line-height: 0;
  }

  .bp3-popover-target {
    width: 100%;
  }

  p.bp3-text-muted {
    margin: 0;
    line-height: 30px;
  }
`;

const StyledStep = styled.div`
  margin-left: ${({ isEven }) => (isEven ? '20px' : 0)};
  width: 100%;
  position: relative;
  box-sizing: border-box;

  ${({ isHovered }) =>
    isHovered &&
    css`
      outline: 2px dashed #137cbd;
      outline-offset: 2px;
    `}
`;

const StepNameWrapper = styled.div`
  border: 1px solid #eee;
  border-radius: 3px;
  display: flex;
  flex-flow: column;
`;

const StepContentWrapper = styled.div`
  display: flex;
`;

const StyledStepName = styled.div`
  display: block;
  position: relative;
  padding-bottom: 3px;

  &:hover {
    div {
      opacity: 1;
    }
  }

  div.stepWrapper {
    display: flex;
    flex-flow: column;
    flex: 1;
    padding: 3px 6px;
    .stepName {
      display: block;
      margin: 0;
      flex: 2;
      line-height: 20px;
      color: #333;
      word-break: break-all;
    }
  }

  ${({ isEven }) =>
    isEven
      ? css`
          &:before {
            content: '';
            display: table;
            position: absolute;
            width: 1px;
            left: -11px;
            top: -1px;
            height: 37.5px;
            background-color: #eee;
          }

          &:after {
            content: '';
            display: table;
            position: absolute;
            width: 10px;
            left: -10px;
            top: 35px;
            height: 1px;
            background-color: #eee;
          }

          ${({ isLast }) =>
            !isLast &&
            css`
              &:before {
                height: 75px;
              }
            `}
        `
      : css`
          &:before {
            content: '';
            display: table;
            position: absolute;
            width: 1px;
            left: 10px;
            top: -5px;
            height: 10px;
            background-color: #eee;
          }
        `}
`;

const StyledPopover = styled.div`
  padding: 10px;
`;

const StyledSeparator = styled.div`
  height: 1px;
  width: 100%;
  border-top: 1px dashed #eee;
  margin: 3px 0;
`;

const StyledStepActions = styled.div`
  opacity: 0;
  transition: all 0.2s ease-out;
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  right: 20px;
`;

const StepList = compose(
  withInitialDataConsumer(),
  withMessageHandler(),
  onlyUpdateForKeys(['level', 'steps', 't', 'highlightedSteps', 'groupId', 'stepsData'])
)(
  ({
    level = 1,
    steps,
    highlightedSteps,
    setHighlightedSteps,
    groupId = 1,
    setHighlightedStepGroupIds,
    handleStepInsert,
    stepsData,
    onStepRemove,
    onStepUpdate,
    initialData,
    postMessage,
    addMessageListener,
    resetFields,
    t,
  }) => {
    const [popover, setPopover] = useState({});
    useEffect(() => {
      if (highlightedSteps) {
        if (groupId === highlightedSteps.groupId) {
          setHighlightedStepGroupIds(flattenDeep(steps));
        }
      } else {
        setHighlightedStepGroupIds([]);
      }
    }, [highlightedSteps]);

    return (
      <StyledStepWrapper>
        {level === 1 && (
          <>
            <AddStepButton
              bottom
              big
              before
              stepsData={stepsData}
              setPopover={setPopover}
              icon="add"
            />
            <StyledSeparator />
          </>
        )}
        {size(steps) ? (
          steps.map((step, index) => (
            <StyledStep
              isEven={level % 2 === 0}
              isHovered={
                isArray(step) &&
                highlightedSteps &&
                groupId + index.toString() === highlightedSteps.groupId
              }
              isGroup={isArray(step)}
            >
              {isArray(step) ? (
                <StepList
                  steps={step}
                  level={level + 1}
                  highlightedSteps={highlightedSteps}
                  setHighlightedSteps={setHighlightedSteps}
                  groupId={groupId + index.toString()}
                  setHighlightedStepGroupIds={setHighlightedStepGroupIds}
                  handleStepInsert={handleStepInsert}
                  stepsData={stepsData}
                  onStepRemove={onStepRemove}
                  onStepUpdate={onStepUpdate}
                  resetFields={resetFields}
                  t={t}
                />
              ) : (
                <Step
                  steps={steps}
                  level={level}
                  highlightedSteps={highlightedSteps}
                  setHighlightedSteps={setHighlightedSteps}
                  groupId={groupId}
                  handleStepInsert={handleStepInsert}
                  stepsData={stepsData}
                  onStepRemove={onStepRemove}
                  onStepUpdate={onStepUpdate}
                  resetFields={resetFields}
                  t={t}
                  popover={popover}
                  setPopover={setPopover}
                  index={index}
                  step={step}
                  initialData={initialData}
                  postMessage={postMessage}
                  addMessageListener={addMessageListener}
                />
              )}
            </StyledStep>
          ))
        ) : (
          <>{level === 1 && <p className={Classes.TEXT_MUTED}>{t('NoStepsAdded')}</p>}</>
        )}
        {level === 1 && (
          <>
            <StyledSeparator />
            <AddStepButton bottom big stepsData={stepsData} setPopover={setPopover} icon="add" />
          </>
        )}
        {popover.isOpen && (
          <CustomDialog isOpen onClose={() => setPopover({ isOpen: false })}>
            <NewStepPopover
              {...popover}
              onCancel={() => setPopover({ isOpen: false })}
              onStepInsert={handleStepInsert}
              onSubmit={() => setPopover({ isOpen: false })}
            />
          </CustomDialog>
        )}
      </StyledStepWrapper>
    );
  }
);

const Step = ({
  level = 1,
  steps,
  setHighlightedSteps,
  groupId = 1,
  handleStepInsert,
  stepsData,
  onStepRemove,
  onStepUpdate,
  initialData,
  postMessage,
  addMessageListener,
  resetFields,
  popover,
  setPopover,
  index,
  step,
  t,
}) => {
  const [stepData, setStepData] = useState({
    name: 'Loading step',
    version: 0,
    type: 'Loading step type',
  });

  useEffect(() => {
    // Wait for the interface data message
    const msgListener = addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
      if (
        data.step &&
        stepsData[step].name === data.step.name &&
        stepsData[step].version == data.step.version
      ) {
        setStepData({
          name: data.step.name,
          type: data.step['step-type'],
          version: data.step.version,
        });
      }
    });
    setTimeout(() => {
      // Ask for the interface data on every change to
      // this step
      postMessage(Messages.GET_INTERFACE_DATA, {
        iface_kind: 'step',
        name: `${stepsData[step].name}:${stepsData[step].version}`,
        include_tabs: false,
      });
    }, 500);
    // Remove the listener when unmounted
    return () => {
      msgListener();
    };
  }, [step, stepsData, steps]);

  return (
    <>
      <StyledStepName
        name="steplist-step"
        onMouseEnter={() => groupId !== 1 && setHighlightedSteps({ groupId })}
        onMouseLeave={() => setHighlightedSteps(null)}
        isEven={level % 2 !== 1 || index === 0}
        isLast={(level % 2 === 1 && index === 0) || index === steps.length - 1}
      >
        <StepNameWrapper>
          <AddStepButton
            top
            before
            step={step}
            stepsData={stepsData}
            setPopover={setPopover}
            icon="chevron-up"
          />

          <StepContentWrapper>
            <AddStepButton
              left
              before
              parallel
              step={step}
              stepsData={stepsData}
              setPopover={setPopover}
              icon="chevron-left"
            />
            <div className="stepWrapper">
              <h4 className="stepName" name="stepList-name">
                {stepData.name}:{stepData.version}
              </h4>
              <FieldType>{t(stepData.type)}</FieldType>
              <StyledStepActions>
                <ButtonGroup minimal>
                  <Tooltip content={t('EditStep')}>
                    <Button
                      icon="edit"
                      name="edit-step"
                      onClick={() => {
                        initialData.setStepSubmitCallback((stepName, stepVersion, stepType) => {
                          onStepUpdate(step, {
                            name: stepName,
                            version: stepVersion,
                            type: stepType,
                          });
                          initialData.changeTab('CreateInterface', 'workflow', true);
                        });
                        resetFields('step');
                        postMessage(Messages.GET_INTERFACE_DATA, {
                          iface_kind: 'step',
                          name: `${stepData.name}:${stepData.version}`,
                          include_tabs: true,
                        });
                      }}
                    />
                  </Tooltip>
                  <Tooltip content={t('RemoveStep')}>
                    <Button icon="remove" onClick={() => onStepRemove(step)} name="remove-step" />
                  </Tooltip>
                </ButtonGroup>
              </StyledStepActions>
            </div>
            <AddStepButton
              right
              parallel
              step={step}
              stepsData={stepsData}
              setPopover={setPopover}
              icon="chevron-right"
            />
          </StepContentWrapper>
          <AddStepButton
            bottom
            step={step}
            stepsData={stepsData}
            setPopover={setPopover}
            icon="chevron-down"
          />
        </StepNameWrapper>
      </StyledStepName>
    </>
  );
};

const NewStepPopover = compose(
  withInitialDataConsumer(),
  withTextContext(),
  withFieldsConsumer()
)(
  ({
    t,
    onStepInsert,
    step,
    before,
    parallel,
    onSubmit,
    onCancel,
    initialData,
    stepsData,
    resetFields,
  }) => {
    const [stepDialog, setStepDialog] = useState<boolean>(false);
    const handleInsert: (name: string, type: string, version: string) => void = (
      name,
      type,
      version
    ) => {
      onStepInsert({ name, type, version }, step, before, parallel);
      onSubmit();
    };

    return (
      <>
        {stepDialog && (
          <CustomDialog
            isOpen
            title={t('AddNewStep')}
            onClose={() => setStepDialog(false)}
            style={{ width: '95vw', height: '95vh', backgroundColor: '#fff ' }}
          >
            <StyledDialogBody style={{ flexFlow: 'column' }}>
              <CreatorWrapper>
                <ClassConnectionsStateProvider type="step">
                  {(classConnectionsProps) => (
                    <InterfaceCreatorPanel
                      type={'step'}
                      hasClassConnections
                      hasConfigManager
                      onSubmit={(fields) => {
                        const nameField = fields.find((field) => field.name === 'name');
                        const versionField = fields.find((field) => field.name === 'version');
                        const typeField = fields.find((field) => field.name === 'base-class-name');
                        handleInsert(nameField.value, typeField.value, versionField.value);
                        setStepDialog(false);
                      }}
                      onSubmitSuccess={() => true}
                      openFileOnSubmit={false}
                      forceSubmit
                      {...classConnectionsProps}
                    />
                  )}
                </ClassConnectionsStateProvider>
              </CreatorWrapper>
            </StyledDialogBody>
          </CustomDialog>
        )}
        <StyledPopover>
          <FieldName>
            {t('AddNewStep')} {before ? t('Before') : t('After')}{' '}
            {step ? stepsData[step].name : 'all steps'}
          </FieldName>
          <ActionsWrapper>
            <FieldInputWrapper>
              <ControlGroup fill>
                <Button
                  intent="success"
                  icon="add"
                  name="create-new-step"
                  text={t('AddNewStep')}
                  onClick={() => {
                    resetFields('step');
                    initialData.resetInterfaceData('step');
                    setStepDialog(true);
                  }}
                  fill
                />
                <SelectField
                  get_message={{
                    action: 'creator-get-objects',
                    object_type: 'workflow-step',
                  }}
                  return_message={{
                    action: 'creator-return-objects',
                    object_type: 'workflow-step',
                    return_value: 'objects',
                  }}
                  predicate={(name: string) =>
                    !some(stepsData, (item) => `${item.name}:${item.version}` === name)
                  }
                  value={name}
                  onChange={(_name, value) => {
                    const [name, version] = value.split(':');

                    handleInsert(name, null, version);
                  }}
                  placeholder={t('OrSelectExisting')}
                  name="name"
                  fill
                />
              </ControlGroup>
            </FieldInputWrapper>
          </ActionsWrapper>
          <ActionsWrapper>
            <ButtonGroup fill>
              <Button
                text={t('Cancel')}
                onClick={() => {
                  onCancel();
                }}
              />
            </ButtonGroup>
          </ActionsWrapper>
        </StyledPopover>
      </>
    );
  }
);

export default compose(withFieldsConsumer(), withTextContext())(StepList);
