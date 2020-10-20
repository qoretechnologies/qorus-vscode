import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';

import maxBy from 'lodash/maxBy';
import styled, { css, keyframes } from 'styled-components';

import { Button, ButtonGroup, Icon, Tooltip } from '@blueprintjs/core';

import { TextContext } from '../../context/text';

const md = require('markdown-it')();

const StyledTutorialBackground = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 1000;
    background: rgba(0, 0, 0, 0.9);
`;

const StyledTutorialWrapper = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    z-index: 1002;
`;

export interface ITutorialBox {
    top: number;
    left: number;
}

const StyledTutorialBox = styled.div`
    position: absolute;
    border: 1px solid #c3c3c3;
    z-index: 1003;
    border-radius: 4px;
    transition: all 0.2s ease-in-out;

    &:before {
        content: '';
        display: block;
        position: absolute;
        width: 18px;
        height: 18px;
        background: #fff;
        border-left: 1px solid #c3c3c3;
        border-top: 1px solid #c3c3c3;
    }

    &.bottom,
    &.center {
        &:before {
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            top: -10px;
            background: #eee;
        }
    }

    &.top {
        &:before {
            left: 50%;
            transform: translateX(-50%) rotate(45deg);
            bottom: -10px;
        }
    }

    &.left {
        &:before {
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
            right: -10px;
        }
    }

    &.right {
        &:before {
            top: 50%;
            transform: translateY(-50%) rotate(45deg);
            left: -10px;
        }
    }
`;

const StyledBoxHeader = styled.div`
    min-height: 30px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #eee;
    padding: 0 10px;
    font-weight: 600;
    border-bottom: 1px solid #c3c3c3;
    padding: 10px;
    position: relative;

    span:first-child {
        flex: 1;
        margin-right: 10px;
    }
`;

const fill = keyframes`
    0% {
        width: 0;
    }

    100% {
        width: 100%;
    }
`;

const StyledBoxContent = styled.div`
    min-height: 50px;
    max-height: 400px;
    min-width: 200px;
    max-width: 600px;
    overflow: auto;
    width: 100%;
    background-color: #fff;
    padding: 10px;
    position: relative;
`;

let timeout: NodeJS.Timeout;

const StyledProgressBar = styled.div<{ time: number }>`
    width: 100%;
    height: 7px;
    background-color: #eee;

    div {
        ${({ time }) => css`
            width: 0%;
            height: 100%;
            background-color: #137cbd;
            animation: ${fill} ${time}s linear;
        `}
    }
`;

const ProgressBar = ({ time, activeStep }) => (
    <StyledProgressBar time={time} key={activeStep}>
        <div />
    </StyledProgressBar>
);

const Tutorial = ({ data, onClose }) => {
    const [activeStep, setActiveStep] = useState<number>(0);
    const [isContentLoaded, setIsContentLoaded] = useState<number>(0);
    const [autoPlay, setAutoPlay] = useState<boolean>(false);
    const t = useContext(TextContext);

    useEffect(() => {
        if (autoPlay) {
            const len = t(data[activeStep].text).split(' ').length;

            clearTimeout(timeout);
            timeout = setTimeout(() => {
                if (activeStep !== data.length - 1) {
                    changeStep(true);
                } else {
                    setAutoPlay(false);
                }
            }, 280 * len);
        } else {
            clearTimeout(timeout);

            timeout = null;
        }
    }, [autoPlay, activeStep]);

    useEffect(() => {
        window.addEventListener('keyup', handleKeyUp);
        // Get the element
        const el: HTMLElement = document.querySelector(`#${data[activeStep].id}`);
        // Add the needed class
        el.classList.add('tutorial-helper');

        return () => {
            el.classList.remove('tutorial-helper');
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [activeStep]);

    const handleKeyUp: (event: KeyboardEvent) => void = (event) => {
        if (event.key === 'ArrowLeft') {
            event.preventDefault();

            if (activeStep === 0) {
                return;
            }

            changeStep();
        } else if (event.key === 'ArrowRight') {
            event.preventDefault();

            if (activeStep === data.length - 1) {
                return;
            }

            changeStep(true);
        } else if (event.key === 'Escape') {
            event.preventDefault();

            onClose();
        } else if (event.key === ' ') {
            event.preventDefault();
            setAutoPlay((cur) => !cur);
        }
    };

    const changeStep: (next?: boolean) => void = (next) => {
        // Change the step
        setActiveStep((cur) => {
            // Remove the tutorial helper class from the current step
            document.querySelector(`#${data[cur].id}`).classList.remove('tutorial-helper');

            return next ? cur + 1 : cur - 1;
        });
    };

    const contentAndStyles = useMemo(() => {
        if (!isContentLoaded) {
            return undefined;
        }

        const { text, title, elementData }: { text: string; title: string; elementData: DOMRect } = data[activeStep];
        // We first need to update the title and content of the box
        // so the dimensions are correct before we try to position
        // the box
        const box = document.querySelector('#tutorial-box');
        const contentEl = document.querySelector('#tutorial-box-content');
        // Not the best practice but it gets the job done without
        // all the rerended shenanigans
        contentEl.innerHTML = md.render(t(text));
        // We will now get the "space" around the tutorial element in this step
        // and determine which one is the largest
        let { side, value }: { side: string; value: number } = maxBy(
            [
                { side: 'top', value: elementData.top },
                { side: 'bottom', value: window.innerHeight - (elementData.top + elementData.height) },
                { side: 'left', value: elementData.left },
                { side: 'right', value: window.innerWidth - (elementData.left + elementData.width) },
            ],
            'value'
        );
        // Check if the largest space is big enough to take the box
        const { width, height } = box.getBoundingClientRect();
        const compareValue = side === 'right' || side === 'left' ? width : height;
        // Compare the largest space value with the appropriate size
        if (value - 80 < compareValue) {
            side = 'center';
            value = null;
        }

        // Add the side class to the box
        box.classList.remove('top', 'left', 'right', 'bottom', 'center');
        box.classList.add(side);

        let style;

        if (side === 'top') {
            style = {
                top: elementData.top - height - 20,
                left: elementData.left + elementData.width / 2,
                transform: 'translateX(-50%)',
            };
        } else if (side === 'bottom') {
            style = {
                top: elementData.top + elementData.height + 20,
                left: elementData.left + elementData.width / 2,
                transform: 'translateX(-50%)',
            };
        } else if (side === 'left') {
            style = {
                left: elementData.left - width - 20,
                top: elementData.top + elementData.height / 2,
                transform: 'translateY(-50%)',
            };
        } else if (side === 'right') {
            style = {
                left: elementData.left + elementData.width + 20,
                top: elementData.top + elementData.height / 2,
                transform: 'translateY(-50%)',
            };
        } else {
            style = {
                left: elementData.left + elementData.width / 2,
                top: elementData.top + elementData.height / 2 - height / 2,
                transform: 'translate(-50%)',
            };
        }

        setTimeout(() => {
            contentEl.classList.add('animate');
        }, 1000);

        if ((side === 'top' || side === 'bottom') && style.left < width / 2) {
            style.transform = null;
            style.left = style.left - elementData.width / 2 - 20;
        }

        if ((side === 'left' || side === 'right') && style.top < height / 2) {
            style.transform = null;
            style.top = style.top - elementData.height / 2 - 20;
        }

        return style;
    }, [activeStep, isContentLoaded]);

    const measuredRef = useCallback((node: HTMLElement) => {
        if (node !== null) {
            setIsContentLoaded((cur) => cur + 1);
        }
    }, []);

    const measuredContentRef = useCallback((node: HTMLElement) => {
        if (node !== null) {
            setIsContentLoaded((cur) => cur + 1);
        }
    }, []);

    const { title, text } = data[activeStep];

    return (
        <>
            <StyledTutorialBackground />
            <StyledTutorialWrapper>
                <ButtonGroup
                    style={{ position: 'absolute', top: 10, left: '50%', transform: 'translateX(-50%)' }}
                    id="tutorial-controls"
                >
                    <Tooltip content={t('PrevStep')}>
                        <Button
                            disabled={activeStep === 0}
                            icon="arrow-left"
                            onClick={() => {
                                changeStep();
                            }}
                            intent="primary"
                        />
                    </Tooltip>
                    <Tooltip content={t('NextStep')}>
                        <Button
                            disabled={activeStep === data.length - 1}
                            icon="arrow-right"
                            onClick={() => {
                                changeStep(true);
                            }}
                            intent="primary"
                        />
                    </Tooltip>
                    {activeStep === data.length - 1 ? (
                        <Tooltip content={t('RestartTutorial')}>
                            <Button
                                icon="refresh"
                                onClick={() => {
                                    setActiveStep(0);
                                    setAutoPlay(true);
                                }}
                                intent="primary"
                            />
                        </Tooltip>
                    ) : (
                        <Tooltip content={autoPlay ? t('PauseTutorial') : t('PlayTutorial')}>
                            <Button
                                icon={autoPlay ? 'pause' : 'play'}
                                onClick={() => setAutoPlay(!autoPlay)}
                                intent={autoPlay ? 'success' : 'primary'}
                            />
                        </Tooltip>
                    )}
                    <Tooltip content={t('CloseTutorial')}>
                        <Button icon="cross" onClick={onClose} />
                    </Tooltip>
                </ButtonGroup>
                <StyledTutorialBox
                    ref={measuredRef}
                    style={isContentLoaded === 2 ? contentAndStyles : {}}
                    id="tutorial-box"
                >
                    <StyledBoxHeader id="tutorial-box-title">
                        <span>
                            <Icon icon="info-sign" intent="primary" /> {t(title)}
                        </span>
                        <span>
                            {activeStep + 1} / {data.length}
                        </span>
                    </StyledBoxHeader>
                    {autoPlay && (
                        <ProgressBar time={(t(text).split(' ').length * 280) / 1000} activeStep={activeStep} />
                    )}
                    <StyledBoxContent ref={measuredContentRef} id="tutorial-box-content"></StyledBoxContent>
                </StyledTutorialBox>
            </StyledTutorialWrapper>
        </>
    );
};

export default Tutorial;
