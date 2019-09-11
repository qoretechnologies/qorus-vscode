import React, { useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { isArray, flattenDeep, size, some } from 'lodash';
import { Icon, Popover, ButtonGroup, Button, Position, Classes } from '@blueprintjs/core';
import SelectField from '../Field/select';
import withTextContext from '../../hocomponents/withTextContext';
import { FieldWrapper, FieldInputWrapper, ActionsWrapper } from '../../containers/InterfaceCreator/panel';
import withInitialDataConsumer from '../../hocomponents/withInitialDataConsumer';
import compose from 'recompose/compose';
import { FieldType, FieldName } from '../FieldSelector';

const StyledStepWrapper = styled.div`
    .bp3-popover-wrapper {
        display: block;
        width: 100%;
        height: 100%;
        line-height: 1;
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

    ${({ big }) =>
        big &&
        css`
            border: 1px solid #eee;
            border-radius: 3px;
        `}

    &:hover {
        background-color: #ddd;
        color: #bbb;
    }
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

const StepList = ({
    level = 1,
    steps,
    highlightedSteps,
    setHighlightedSteps,
    groupId = 1,
    setHighlightedStepGroupIds,
    handleStepInsert,
    stepsData,
    onStepRemove,
    stepsCount,
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
                    <Popover
                        isOpen={popover.isOpen && !popover.step && popover.before}
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
                                    position: Position.TOP,
                                    before: true,
                                    step: null,
                                    stepsData,
                                })
                            }
                        >
                            <Icon icon="add" />
                        </StyledStepButton>
                    </Popover>
                    <StyledSeparator />
                </>
            )}
            {size(steps) ? (
                steps.map((step, index) => (
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
                                onStepRemove={onStepRemove}
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
                                                    stepsData,
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
                                                        stepsData,
                                                    })
                                                }
                                            >
                                                <Icon icon="chevron-left" />
                                            </StyledStepButton>
                                            <div className="stepWrapper">
                                                <h4 className="stepName">{stepsData[step].name}</h4>
                                                <FieldType>{`<normal-step>`}</FieldType>
                                                <StyledStepActions>
                                                    <ButtonGroup minimal>
                                                        <Button icon="edit" />
                                                        <Button
                                                            icon="remove"
                                                            disabled={stepsCount === 1}
                                                            onClick={() => onStepRemove(step)}
                                                        />
                                                    </ButtonGroup>
                                                </StyledStepActions>
                                            </div>
                                            <StyledStepButton
                                                right
                                                onClick={() =>
                                                    setPopover({
                                                        isOpen: true,
                                                        position: Position.RIGHT,
                                                        step,
                                                        parallel: true,
                                                        stepsData,
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
                                                    stepsData,
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
                ))
            ) : (
                <p className={Classes.TEXT_MUTED}>{t('NoStepsAdded')}</p>
            )}
            {level === 1 && (
                <>
                    <StyledSeparator />
                    <Popover
                        isOpen={popover.isOpen && !popover.step && !popover.before}
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
                                    stepsData,
                                })
                            }
                        >
                            <Icon icon="add" />
                        </StyledStepButton>
                    </Popover>
                </>
            )}
        </StyledStepWrapper>
    );
};

const NewStepPopover = compose(
    withInitialDataConsumer(),
    withTextContext()
)(({ t, onStepInsert, step, before, parallel, onSubmit, onCancel, initialData, stepsData }) => {
    const handleInsert: (name: string) => void = name => {
        onStepInsert({ name }, step, before, parallel);
        onSubmit();
    };

    return (
        <StyledPopover>
            <FieldName>
                {t('AddNewStep')} {before ? t('Before') : t('After')} {step ? stepsData[step].name : 'all steps'}
            </FieldName>
            <ActionsWrapper>
                <FieldInputWrapper>
                    <ButtonGroup fill>
                        <Button
                            intent="success"
                            icon="add"
                            onClick={() => {
                                initialData.changeTab('CreateInterface', 'step');
                                initialData.setStepSubmitCallback(stepName => {
                                    handleInsert(stepName);
                                    initialData.changeTab('CreateInterface', 'workflow');
                                });
                            }}
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
                            predicate={(name: string) => !some(stepsData, item => item.name === name)}
                            value={name}
                            onChange={(_name, value) => {
                                handleInsert(value);
                            }}
                            placeholder={t('OrSelectExisting')}
                            name="name"
                        />
                    </ButtonGroup>
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
    );
});

export default withTextContext()(StepList);
