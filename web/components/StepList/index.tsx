import React, { FunctionComponent, useState, useRef, createRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { isArray, flattenDeep } from 'lodash';
import { Icon, Popover, ButtonGroup, Button, Position, PopoverInteractionKind } from '@blueprintjs/core';
import shortid from 'shortid';
import String from '../Field/string';
import SelectField from '../Field/select';
import withTextContext from '../../hocomponents/withTextContext';
import { FieldWrapper, FieldInputWrapper, ActionsWrapper } from '../../containers/InterfaceCreator/panel';

const StyledStep = styled.div`
    margin-left: ${({ isEven }) => (isEven ? '20px' : 0)};
    position: relative;
    box-sizing: border-box;

    ${({ isHovered }) =>
        isHovered &&
        css`
            outline: 2px dashed blue;
            outline-offset: 2px;
        `}
`;

const StyledStepName = styled.div`
    display: block;
    padding: 5px 0;
    position: relative;

    &:hover {
        div:not(.steprWrapper) {
            display: flex;
        }
        div.stepWrapper > span {
            margin: 2px;
        }
    }

    div.stepWrapper {
        display: flex;
        flex-flow: row;
        span.stepName {
            border: 1px solid #d7d7d7;
            border-radius: 3px;
            display: block;
            padding: 5px;
            flex: 2;
        }
    }

    .bp3-popover-wrapper {
        display: block;
        width: 100%;
        height: 100%;
    }

    .bp3-popover-target {
        width: 100%;
    }

    ${({ isEven }) =>
        isEven
            ? css`
                  &:before {
                      content: '';
                      display: table;
                      position: absolute;
                      width: 2px;
                      left: -11px;
                      top: -5px;
                      height: 27px;
                      background-color: #d7d7d7;
                  }

                  &:after {
                      content: '';
                      display: table;
                      position: absolute;
                      width: 10px;
                      left: -10px;
                      top: 20px;
                      height: 2px;
                      background-color: #d7d7d7;
                  }

                  ${({ isLast }) =>
                      !isLast &&
                      css`
                          &:before {
                              height: 40px;
                          }
                      `}
              `
            : css`
                  &:before {
                      content: '';
                      display: table;
                      position: absolute;
                      width: 2px;
                      left: 10px;
                      top: -5px;
                      height: 10px;
                      background-color: #d7d7d7;
                  }
              `}
`;

const StyledStepButton = styled.div`
    display: none;
    cursor: pointer;
    width: ${({ top, bottom }) => (top || bottom ? '100%' : '15px')};
    height: ${({ top, bottom }) => (top || bottom ? '10px' : '30px')};
    margin-top: ${({ left, right }) => (left || right ? '2px' : 0)};
    background-color: #eee;
    color: #a9a9a9;
    border-radius: 2px;
    line-height: 15px;
    font-size: 16px;
    justify-content: center;
    align-items: center;

    &:hover {
        background-color: #ddd;
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

    return steps.map((step, index) => (
        <StyledStep
            isEven={level % 2 === 0}
            isHovered={isArray(step) && highlightedSteps && groupId + index.toString() === highlightedSteps.groupId}
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
                    <div className="stepWrapper">
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
                            <span className="stepName">{stepsData[step].name}</span>
                        </Popover>
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
                    </div>
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
                </StyledStepName>
            )}
        </StyledStep>
    ));
};

const NewStepPopover = withTextContext()(({ t, onStepInsert, step, before, parallel, onSubmit, onCancel }) => {
    const [name, setName] = useState<string>('');

    const handleNameChange: (name: string, value: string) => void = (name, value) => {
        setName(value);
    };

    return (
        <StyledPopover>
            <FieldWrapper>
                <FieldInputWrapper>
                    <p>Create new step</p>
                    <String onChange={handleNameChange} name="name" value={name} />
                </FieldInputWrapper>
            </FieldWrapper>
            <FieldWrapper>
                <FieldInputWrapper>
                    <p>Or select existing one</p>
                    <SelectField
                        get_message={{
                            action: 'creator-get-objects',
                            object_type: 'workflow-steps',
                        }}
                        return_message={{
                            action: 'creator-return-objects',
                            object_type: 'workflow-steps',
                            return_value: 'objects',
                        }}
                        defaultItems={[
                            {
                                name: 'Existing step 1',
                                desc: 'This is an existing step',
                            },
                        ]}
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
