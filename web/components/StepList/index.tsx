import React, { FunctionComponent, useState, useRef, createRef, useEffect } from 'react';
import styled, { css } from 'styled-components';
import { isArray, flattenDeep } from 'lodash';
import { Icon } from '@blueprintjs/core';
import shortid from 'shortid';

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

const StyledStepName = styled.span`
    display: block;
    padding: 5px 0;
    position: relative;

    span {
        border: 1px solid #d7d7d7;
        border-radius: 3px;
        display: block;
        padding: 5px;
    }

    &:hover {
        div {
            opacity: 1;
        }
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
    opacity: 0;
    cursor: pointer;
    position: absolute;
    width: 15px;
    top: ${({ top, left, right }) => (left || right ? '50%' : top ? 0 : '100%')};
    height: 14px;
    left: ${({ left, right }) => (left ? 0 : right ? '100%' : '50%')};
    transform: translateX(-50%) translateY(-50%);
    border: 1px solid #000;
    background-color: #fff;
    border-radius: 2px;
    line-height: 15px;
    font-size: 16px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

const StepList = ({
    level = 1,
    steps,
    highlightedSteps,
    setHighlightedSteps,
    groupId = 1,
    setHighlightedStepGroupIds,
    handleStepInsert,
}) => {
    useEffect(() => {
        if (highlightedSteps && groupId === highlightedSteps.groupId) {
            setHighlightedStepGroupIds(flattenDeep(steps));
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
                        onClick={() => {
                            handleStepInsert(step, true);
                        }}
                    >
                        +
                    </StyledStepButton>
                    <StyledStepButton
                        left
                        onClick={() => {
                            handleStepInsert(step, true, true);
                        }}
                    >
                        +
                    </StyledStepButton>
                    <span>Step {step}</span>
                    <StyledStepButton
                        right
                        onClick={() => {
                            handleStepInsert(step, false, true);
                        }}
                    >
                        +
                    </StyledStepButton>
                    <StyledStepButton
                        onClick={() => {
                            handleStepInsert(step);
                        }}
                    >
                        +
                    </StyledStepButton>
                </StyledStepName>
            )}
        </StyledStep>
    ));
};

export default StepList;
