import React, { FunctionComponent, useState, useRef, createRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { isArray, flattenDeep } from 'lodash';
import { Icon, Popover, ButtonGroup, Button, Position, PopoverInteractionKind } from '@blueprintjs/core';
import String from '../Field/string';
import SelectField from '../Field/select';
import withTextContext from '../../hocomponents/withTextContext';
import { FieldWrapper, FieldInputWrapper, ActionsWrapper } from '../../containers/InterfaceCreator/panel';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import compose from 'recompose/compose';
import { FieldType } from '../FieldSelector';

const StyledStepWrapper = styled.div`
    .bp3-popover-wrapper {
        display: block;
        width: 100%;
        height: 100%;
    }

    .bp3-popover-target {
        width: 100%;
    }
`;

const StyledStep = styled.div`
    margin-left: ${({ isEven }) => (isEven ? '20px' : 0)};
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

const StyledStepButton = styled.div`
    display: flex;
    cursor: pointer;
    width: ${({ top, bottom }) => (top || bottom ? '100%' : '12px')};
    height: ${({ top, bottom, big }) => (top || bottom ? (big ? '20px' : '12px') : '46px')};
    color: #ccc;
    background-color: #f6f6f6;
    line-height: 15px;
    font-size: 16px;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: #ddd;
        color: #bbb;
    }
`;

const StyledPopover = styled.div`
    padding: 10px;
`;

const StepList = ({
    level = 1,
    steps,
    highlightedSteps,
    setHighlightedSteps,
    groupId = 1,
    setHighlightedStepGroupIds,
    handleStepInsert,
    stepsData,
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
            {steps.map((step, index) => (
                <StyledStep
                    isEven={level % 2 === 0}
                    isHovered={
                        isArray(step) && highlightedSteps && groupId + index.toString() === highlightedSteps.groupId
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
                        />
                    ) : (
                        <StyledStepName
                            onMouseEnter={() => groupId !== 1 && setHighlightedSteps({ groupId })}
                            onMouseLeave={() => setHighlightedSteps(null)}
                            isEven={level % 2 !== 1 || index === 0}
                            isLast={(level % 2 === 1 && index === 0) || index === steps.length - 1}
                        >
                            <Popover
                                isOpen={popover.isOpen && popover.step === step}
                                position={popover.position}
                                content={
                                    <NewStepPopover
                                        {...popover}
                                        onCancel={() => setPopover({ isOpen: false })}
                                        onStepInsert={handleStepInsert}
                                        onSubmit={() => setPopover({ isOpen: false })}
                                    />
                                }
                            >
                                <StepNameWrapper>
                                    <StyledStepButton
                                        top
                                        onClick={() =>
                                            setPopover({
                                                isOpen: true,
                                                position: Position.TOP,
                                                step,
                                                before: true,
                                            })
                                        }
                                    >
                                        <Icon icon="chevron-up" />
                                    </StyledStepButton>
                                    <StepContentWrapper>
                                        <StyledStepButton
                                            left
                                            onClick={() =>
                                                setPopover({
                                                    isOpen: true,
                                                    position: Position.LEFT,
                                                    step,
                                                    before: true,
                                                    parallel: true,
                                                })
                                            }
                                        >
                                            <Icon icon="chevron-left" />
                                        </StyledStepButton>
                                        <div className="stepWrapper">
                                            <h4 className="stepName">{stepsData[step].name}</h4>
                                            <FieldType>{`<normal-step>`}</FieldType>
                                        </div>
                                        <StyledStepButton
                                            right
                                            onClick={() =>
                                                setPopover({
                                                    isOpen: true,
                                                    position: Position.RIGHT,
                                                    step,
                                                    parallel: true,
                                                })
                                            }
                                        >
                                            <Icon icon="chevron-right" />
                                        </StyledStepButton>
                                    </StepContentWrapper>
                                    <StyledStepButton
                                        bottom
                                        onClick={() =>
                                            setPopover({
                                                isOpen: true,
                                                position: Position.BOTTOM,
                                                step,
                                            })
                                        }
                                    >
                                        <Icon icon="chevron-down" />
                                    </StyledStepButton>
                                </StepNameWrapper>
                            </Popover>
                        </StyledStepName>
                    )}
                </StyledStep>
            ))}
            {level === 1 && (
                <Popover
                    isOpen={popover.isOpen && !popover.step}
                    position={popover.position}
                    content={
                        <NewStepPopover
                            {...popover}
                            onCancel={() => setPopover({ isOpen: false })}
                            onStepInsert={handleStepInsert}
                            onSubmit={() => setPopover({ isOpen: false })}
                        />
                    }
                >
                    <StyledStepButton
                        bottom
                        visible
                        big
                        onClick={() =>
                            setPopover({
                                isOpen: true,
                                position: Position.BOTTOM,
                                step: null,
                            })
                        }
                    >
                        <Icon icon="add" />
                    </StyledStepButton>
                </Popover>
            )}
        </StyledStepWrapper>
    );
};

const NewStepPopover = compose(
    withInitialDataConsumer(),
    withTextContext()
)(({ t, onStepInsert, step, before, parallel, onSubmit, onCancel, initialData }) => {
    const [name, setName] = useState<string>('');

    const handleNameChange: (name: string, value: string) => void = (_name, value) => {
        setName(value);
    };

    return (
        <StyledPopover>
            <FieldWrapper>
                <FieldInputWrapper>
                    <ButtonGroup>
                        <Button
                            text={t('CreateNewStep')}
                            icon="add"
                            onClick={() => {
                                initialData.changeTab('CreateInterface', 'step');
                                initialData.setStepSubmitCallback(stepName => {
                                    onStepInsert({ name: stepName }, step, before, parallel);
                                    initialData.changeTab('CreateInterface', 'workflow');
                                });
                            }}
                        />
                    </ButtonGroup>
                </FieldInputWrapper>
            </FieldWrapper>
            <FieldWrapper>
                <FieldInputWrapper>
                    <p>Or select existing one</p>
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
                        defaultItems={[
                            {
                                name: 'Existing step 1',
                                desc: 'This is an existing step',
                            },
                        ]}
                        value={name}
                        onChange={handleNameChange}
                        name="name"
                    />
                </FieldInputWrapper>
            </FieldWrapper>
            <ActionsWrapper>
                <ButtonGroup fill>
                    <Button
                        text={t('Cancel')}
                        onClick={() => {
                            onCancel();
                        }}
                    />
                    <Button
                        text={t('Save')}
                        intent="success"
                        onClick={() => {
                            onStepInsert({ name }, step, before, parallel);
                            onSubmit();
                        }}
                    />
                </ButtonGroup>
            </ActionsWrapper>
        </StyledPopover>
    );
});

export default StepList;
