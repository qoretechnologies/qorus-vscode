import React, { useContext, useState } from 'react';

import { useDrag } from 'react-dnd';
import styled, { css, keyframes } from 'styled-components';

import { Button, ButtonGroup } from '@blueprintjs/core';

import { ContextMenuContext } from '../../../context/contextMenu';
import { TextContext } from '../../../context/text';
import { IFSMState, STATE_ITEM_TYPE } from './';

export interface IFSMStateProps extends IFSMState {
    selected?: boolean;
    onDblClick: (id: string) => any;
    onClick: (id: string) => any;
    onEditClick: (id: string) => any;
    onDeleteClick: (id: string) => any;
    onUpdate: (id: string, data: any) => any;
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
    type: 'mapper' | 'connector' | 'pipeline' | 'fsm';
    isAvailableForTransition: boolean;
}

const wiggleAnimation = (type) => keyframes`
    0% {
        transform: rotate(-2deg) ${type === 'connector' ? 'skew(15deg)' : ''};
    }

    50% {
        transform: rotate(2deg) ${type === 'connector' ? 'skew(15deg)' : ''};
    }

    100% {
        transform: rotate(-2deg) ${type === 'connector' ? 'skew(15deg)' : ''};
    }
`;

const StyledFSMState = styled.div<IFSMStateStyleProps>`
    left: ${({ x }) => `${x}px`};
    top: ${({ y }) => `${y}px`};
    position: absolute;
    width: 180px;
    height: 50px;
    background-color: #fff;
    z-index: 20;
    border: 2px solid;
    transition: all 0.2s linear;

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

    ${({ type }) => {
        switch (type) {
            case 'connector':
                return css`
                    transform: skew(15deg);
                    > * {
                        transform: skew(-15deg);
                    }
                `;
            case 'mapper':
                return null;
            case 'pipeline':
                return css`
                    border-radius: 50px;
                `;
            case 'fsm':
                return css`
                    border-style: dashed;
                `;
            default:
                return null;
        }
    }}

    border-radius: 3px;
    cursor: pointer;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-flow: column;
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
    font-size: 12px;
`;

export const calculateFontSize = (name, isAction?: boolean) => {
    if (!name) {
        return undefined;
    }

    const len = name.length;

    if (len > 20) {
        return isAction ? '10px' : '12px';
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
    name,
    action,
    initial,
    final,
    type,
    onUpdate,
    selectedState,
    getTransitionByState,
}) => {
    const [, drag] = useDrag({
        item: { name: 'state', type: STATE_ITEM_TYPE, id },
    });

    const [isHovered, setIsHovered] = useState<boolean>(false);
    const { addMenu } = useContext(ContextMenuContext);
    const t = useContext(TextContext);

    const handleClick = (event: React.MouseEvent<HTMLDivElement>, func: (id: string) => any) => {
        event.stopPropagation();

        func(id);
    };

    const handleMouseEnter = () => {
        setIsHovered(true);
    };

    const handleMouseLeave = () => {
        setIsHovered(false);
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
            type={type === 'fsm' ? 'fsm' : action?.type}
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
            {action && (
                <StyledStateAction style={{ fontSize: calculateFontSize(name, true) }}>{action.type}</StyledStateAction>
            )}
            {isHovered && (
                <ButtonGroup minimal style={{ position: 'absolute', top: '-30px' }}>
                    <Button icon="edit" intent="warning" onClick={(e) => handleClick(e, onEditClick)} />
                    <Button icon="cross" intent="danger" onClick={(e) => handleClick(e, onDeleteClick)} />
                </ButtonGroup>
            )}
        </StyledFSMState>
    );
};

export default FSMState;
