import { Button, ButtonGroup, ProgressBar, Tooltip } from '@blueprintjs/core';
import size from 'lodash/size';
import { lighten } from 'polished';
import React, { useContext, useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import styled, { css, keyframes } from 'styled-components';
import Spacer from '../../../components/Spacer';
import { ContextMenuContext } from '../../../context/contextMenu';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { insertAtIndex } from '../../../helpers/functions';
import { IFSMState, IF_STATE_SIZE, STATE_HEIGHT, STATE_ITEM_TYPE, STATE_WIDTH } from './';
import { getStateStyle } from './toolbarItem';

export interface IFSMStateProps extends IFSMState {
    selected?: boolean;
    onDblClick: (id: string) => any;
    onClick: (id: string) => any;
    onEditClick: (id: string) => any;
    onDeleteClick: (id: string) => any;
    onUpdate: (id: string, data: any) => any;
    onTransitionOrderClick: (id: string) => any;
    startTransitionDrag: (id: string) => any;
    stopTransitionDrag: (id: string) => any;
    selectedState?: number;
    isAvailableForTransition: (stateId: string, id: string) => boolean;
    onExecutionOrderClick: () => void;
    id: string;
    isIsolated: boolean;
}

export interface IFSMStateStyleProps {
    x: number;
    y: number;
    selected: boolean;
    initial: boolean;
    final: boolean;
    type: 'mapper' | 'connector' | 'pipeline' | 'fsm' | 'block' | 'if';
    isAvailableForTransition: boolean;
    isIsolated: boolean;
    isIncompatible?: boolean;
    error?: boolean;
}

const wiggleAnimation = (type) => keyframes`
    0% {
        transform: ${type === 'if' ? 'rotate(43deg)' : 'rotate(-2deg)'} ${type === 'connector' ? 'skew(15deg)' : ''};
    }

    50% {
        transform: ${type === 'if' ? 'rotate(47deg)' : 'rotate(2deg)'} ${type === 'connector' ? 'skew(15deg)' : ''};
    }

    100% {
        transform: ${type === 'if' ? 'rotate(43deg)' : 'rotate(-2deg)'} ${type === 'connector' ? 'skew(15deg)' : ''};
    }
`;

const StyledStateName = styled.p`
    padding: 0;
    margin: 0;
    font-weight: 500;
    text-align: center;
`;

const StyledStateAction = styled.p`
    padding: 0;
    margin: 0;
    color: #a9a9a9;
    font-size: 11px;
    text-align: center;
`;

export const StyledStateTextWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
`;

const StyledFSMState = styled.div<IFSMStateStyleProps>`
    left: ${({ x }) => `${x}px`};
    top: ${({ y }) => `${y}px`};
    position: absolute;
    width: ${({ type }) => (type === 'if' ? IF_STATE_SIZE : STATE_WIDTH)}px;
    height: ${({ type }) => (type === 'if' ? IF_STATE_SIZE : STATE_HEIGHT)}px;
    
    z-index: 20;
    border: 1px solid;
    transition: all 0.2s linear;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;

    ${StyledStateName}, ${StyledStateAction} {
        opacity: ${({ isIsolated }) => (isIsolated ? 0.4 : 1)};
    }

    ${({ selected, initial, final, isIncompatible, error }) => {
        let color: string = '#a9a9a9';

        if (isIncompatible || error) {
            color = '#d13913';
        } else if (selected) {
            color = '#277fba';
        } else if (final) {
            color = '#81358a';
        } else if (initial) {
            color = '#7fba27';
        }

        return css`
            border-color: ${color};
            border-style: solid;

            &:hover {
                box-shadow: 0 0 5px 0px ${color};
            }
        `;
    }};

    ${({ error }) => css`
        background-color: ${error ? lighten(0.3, '#d13913') : '#fff'};
    `}

    ${({ isAvailableForTransition, type }) =>
        isAvailableForTransition &&
        css`
            animation: ${wiggleAnimation(type)} 0.3s linear infinite;
        `}

    ${({ type }) => getStateStyle(type)}
`;

export const calculateFontSize = (name, isAction?: boolean) => {
    if (!name) {
        return undefined;
    }

    const len = name.length;

    if (len > 20) {
        return isAction ? '8px' : '12px';
    }

    return undefined;
};

export const getStateType = ({ type, action, ...rest }: IFSMState) => {
    if (type === 'block') {
        return `${rest['block-type'] || 'for'} block (${size(rest.states)})`;
    }

    if (type === 'fsm') {
        return `fsm`;
    }

    if (type === 'if') {
        return `if statement`;
    }

    if (!action || !action.type || !action.value) {
        return '';
    }

    return `${action.value.class ? `${action.value.class}:${action.value.connector}` : action.value} ${action.type}`;
};

const FSMState: React.FC<IFSMStateProps> = ({
    position,
    id,
    selected,
    onClick,
    onDblClick,
    onEditClick,
    onDeleteClick,
    onTransitionOrderClick,
    name,
    action,
    initial,
    final,
    type,
    onUpdate,
    selectedState,
    isAvailableForTransition,
    toggleDragging,
    onExecutionOrderClick,
    isIsolated,
    error,
    ...rest
}) => {
    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [_, drag] = useDrag({
        item: { name: 'state', type: STATE_ITEM_TYPE, id },
        begin: () => {
            setIsDragging(true);
        },
        end: () => {
            setIsDragging(false);
        },
    });

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [shouldWiggle, setShouldWiggle] = useState<boolean>(false);
    const [isLoadingCheck, setIsLoadingCheck] = useState<boolean>(false);
    const { addMenu } = useContext(ContextMenuContext);
    const t = useContext(TextContext);
    const { qorus_instance } = useContext(InitialContext);

    useEffect(() => {
        (async () => {
            if (selectedState) {
                setIsLoadingCheck(true);
                const isAvailable = await isAvailableForTransition(selectedState, id);
                setIsLoadingCheck(false);
                setShouldWiggle(isAvailable);
            } else {
                setShouldWiggle(false);
                setIsLoadingCheck(false);
            }
        })();
    }, [selectedState]);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, func: (id: string) => any) => {
        event.stopPropagation();

        func(id);
    };

    const handleMouseEnter = (event) => {
        event.stopPropagation();
        setIsHovered(true);
        toggleDragging(false);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
        toggleDragging(true);
    };

    return (
        <StyledFSMState
            key={id}
            ref={drag}
            name={`fsm-state-${name}`}
            x={position.x}
            y={position.y}
            onDoubleClick={selectedState ? undefined : (e) => handleClick(e, onDblClick)}
            onClick={!selectedState || !shouldWiggle ? undefined : (e) => handleClick(e, onClick)}
            selected={selected}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={initial}
            final={final}
            isIsolated={isIsolated}
            className={isIsolated ? 'isolated-state' : ''}
            isAvailableForTransition={shouldWiggle}
            isIncompatible={selectedState && !shouldWiggle}
            error={error}
            type={action?.type || type}
            onContextMenu={(event) => {
                event.persist();
                let menuData = [
                    {
                        title: name,
                    },
                    {
                        item: t('Initial'),
                        onClick: () => {
                            onUpdate(id, { initial: !initial });
                        },
                        icon: 'flow-linear',
                        rightIcon: initial ? 'small-tick' : undefined,
                    },
                    {
                        title: t('Actions'),
                    },
                    {
                        item: t('ManageTransitions'),
                        onClick: () => {
                            onTransitionOrderClick(id);
                        },
                        icon: 'property',
                    },
                    {
                        item: t('RemoveAllTransitions'),
                        onClick: () => {
                            onUpdate(id, { transitions: null });
                        },
                        icon: 'cross',
                    },
                    {
                        item: t('Edit'),
                        onClick: () => onEditClick(id),
                        icon: 'edit',
                        disabled: type === 'block' && !qorus_instance,
                        intent: 'warning',
                    },
                    {
                        item: t('Delete'),
                        onClick: () => onDeleteClick(id),
                        icon: 'trash',
                        intent: 'danger',
                    },
                ];

                if (initial) {
                    menuData = insertAtIndex(menuData, 3, {
                        item: t('ManageExecutionOrder'),
                        onClick: () => {
                            onExecutionOrderClick();
                        },
                        icon: 'property',
                    });
                }

                addMenu({
                    event,
                    data: menuData,
                });
            }}
        >
            <Tooltip
                intent="warning"
                content={type === 'block' && !qorus_instance ? t('CannotManageBlock') : undefined}
            >
                <StyledStateTextWrapper>
                    {isLoadingCheck ? (
                        <>
                            <StyledStateName style={{ fontSize: '12px' }}>
                                {t('LoadingCompatibilityCheck')}
                            </StyledStateName>
                            <Spacer size={6} />
                            <ProgressBar intent="primary" />
                        </>
                    ) : (
                        <>
                            <StyledStateName style={{ fontSize: calculateFontSize(name) }}>{name}</StyledStateName>
                            <StyledStateAction style={{ fontSize: calculateFontSize(name, true) }}>
                                {getStateType({ type, action, ...rest })}
                            </StyledStateAction>
                        </>
                    )}
                </StyledStateTextWrapper>
            </Tooltip>
            {isHovered && !isDragging ? (
                <ButtonGroup minimal style={{ position: 'absolute', top: '-30px' }}>
                    <Button
                        icon="edit"
                        disabled={type === 'block' && !qorus_instance}
                        title={type === 'block' && !qorus_instance ? t('CannotManageBlock') : t('Edit')}
                        intent="warning"
                        onClick={(e) => handleClick(e, onEditClick)}
                    />
                    <Button icon="cross" intent="danger" onClick={(e) => handleClick(e, onDeleteClick)} />
                </ButtonGroup>
            ) : null}
        </StyledFSMState>
    );
};

export default FSMState;
