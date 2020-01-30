import React, { useState, useEffect, FunctionComponent } from 'react';
import styled, { css } from 'styled-components';
import { Position, Icon, Tooltip } from '@blueprintjs/core';
import withTextContext from '../../hocomponents/withTextContext';

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

export interface IAddStepButton {
    bottom?: boolean;
    top?: boolean;
    left?: boolean;
    right?: boolean;
    big?: boolean;
    setPopover: (options: any) => void;
    before?: boolean;
    parallel?: boolean;
    step?: number;
    stepsData?: any;
    icon: string;
}

export const AddStepButton: FunctionComponent<IAddStepButton> = withTextContext()(
    ({ bottom, top, left, right, big, setPopover, before, step, stepsData, parallel, icon, t }) => (
        <Tooltip
            content={
                <p style={{ width: 100, margin: 0, padding: 0 }}>
                    {parallel ? t('AddNewParallelStep') : t('AddNewStep')}{' '}
                    {!parallel ? (before ? t('Before') : t('After')) : ''} {step ? stepsData[step].name : 'all steps'}
                </p>
            }
            className="tooltip step-tooltip"
        >
            <StyledStepButton
                bottom={bottom}
                top={top}
                left={left}
                right={right}
                big={big}
                onClick={() =>
                    setPopover({
                        isOpen: true,
                        position: Position.RIGHT,
                        before,
                        parallel,
                        step,
                        stepsData,
                    })
                }
            >
                <Icon icon={icon} />
            </StyledStepButton>
        </Tooltip>
    )
);
