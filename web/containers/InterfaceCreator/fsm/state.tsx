import React, { useContext, useState } from 'react';

import size from 'lodash/size';
import { useDrag } from 'react-dnd';
import styled, { css, keyframes } from 'styled-components';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { ContextMenuContext } from '../../../context/contextMenu';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { IFSMState, STATE_ITEM_TYPE, IF_STATE_SIZE, STATE_HEIGHT, STATE_WIDTH } from './';
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
    selectedState?: boolean;
    getTransitionByState: (stateId: string, id: string) => boolean;
    id: string;
}

export interface IFSMStateStyleProps {
    x: number;
    y: number;
    selected: boolean;
    initial: boolean;
    final: boolean;
    type: 'mapper' | 'connector' | 'pipeline' | 'fsm' | 'block' | 'if';
    isAvailableForTransition: boolean;
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

const StyledFSMState = styled.div<IFSMStateStyleProps>`
    left: ${({ x }) => `${x}px`};
    top: ${({ y }) => `${y}px`};
    position: absolute;
    width: ${({ type }) => (type === 'if' ? IF_STATE_SIZE : STATE_WIDTH)}px;
    height: ${({ type }) => (type === 'if' ? IF_STATE_SIZE : STATE_HEIGHT)}px;
    background-color: #fff;
    z-index: 20;
    border: 1px solid;
    transition: all 0.2s linear;
    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;

    ${({ selected, initial, final }) => {
        let color: string = '#a9a9a9';

        if (selected) {
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

    ${({ isAvailableForTransition, type }) =>
        isAvailableForTransition &&
        css`
            animation: ${wiggleAnimation(type)} 0.3s linear infinite;
        `}

    ${({ type }) => getStateStyle(type)}
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
    getTransitionByState,
    toggleDragging,
    ...rest
}) => {
    const [, drag] = useDrag({
        item: { name: 'state', type: STATE_ITEM_TYPE, id },
    });

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const { addMenu } = useContext(ContextMenuContext);
    const t = useContext(TextContext);
    const { qorus_instance } = useContext(InitialContext);

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

    const getType = () => {
        if (type === 'block') {
            return `${rest['block-type'] || 'for'} block (${size(rest.states)})`;
        }

        if (type === 'fsm') {
            return `${rest.fsm} fsm`;
        }

        if (type === 'if') {
            return `if statement`;
        }

        if (!action || !action.type || !action.value) {
            return '';
        }

        return `${action.value.class ? `${action.value.class}:${action.value.connector}` : action.value} ${
            action.type
        }`;
    };

    return (
        <StyledFSMState
            key={id}
            ref={drag}
            x={position.x}
            y={position.y}
            onDoubleClick={selectedState ? undefined : (e) => handleClick(e, onDblClick)}
            onClick={!selectedState ? undefined : (e) => handleClick(e, onClick)}
            selected={selected}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            initial={initial}
            final={final}
            isAvailableForTransition={selectedState ? !getTransitionByState(selectedState, id) : false}
            type={action?.type || type}
            onContextMenu={(event) => {
                event.persist();
                addMenu({
                    event,
                    data: [
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
                            item: t('Final'),
                            onClick: () => {
                                onUpdate(id, { final: !final });
                            },
                            icon: 'flow-end',
                            rightIcon: final ? 'small-tick' : undefined,
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
                            title: t('Actions'),
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
                    ],
                });
            }}
        >
            <StyledStateName style={{ fontSize: calculateFontSize(name) }}>{name}</StyledStateName>
            <StyledStateAction style={{ fontSize: calculateFontSize(name, true) }}>{getType()}</StyledStateAction>
            {isHovered && (
                <ButtonGroup minimal style={{ position: 'absolute', top: '-30px' }}>
                    <Button
                        icon="edit"
                        disabled={type === 'block' && !qorus_instance}
                        intent="warning"
                        onClick={(e) => handleClick(e, onEditClick)}
                    />
                    <Button icon="cross" intent="danger" onClick={(e) => handleClick(e, onDeleteClick)} />
                </ButtonGroup>
            )}
        </StyledFSMState>
    );
};

export default FSMState;
