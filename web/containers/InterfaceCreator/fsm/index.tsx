import React, { useContext, useRef, useState } from 'react';
import { TTranslator } from '../../../App';
import { TextContext } from '../../../context/text';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';

import { useDrop, XYCoord } from 'react-dnd';
import FSMToolbarItem from './toolbarItem';
import useMount from 'react-use/lib/useMount';
import FSMState from './state';
import FSMDiagramWrapper from './diagramWrapper';
import { InitialContext } from '../../../context/init';
import styled from 'styled-components';
import shortid from 'shortid';
import FSMStateDialog, { TAction } from './stateDialog';
import FSMTransitionDialog from './transitionDialog';

export interface IFSMViewProps {
    t: TTranslator;
}

export interface IDraggableItem {
    type: 'toolbar-item' | 'state';
    name: string;
    id?: number;
}

export interface IFSMTransition {
    state?: number;
    fsm?: number;
    condition?: {
        type: string;
    };
    errors?: string[];
}

export interface IFSMState {
    position?: {
        x?: number;
        y?: number;
    };
    id?: number;
    transitions?: IFSMTransition[];
    'error-transitions'?: IFSMTransition[];
    initial?: boolean;
    final?: boolean;
    action?: {
        type: TAction;
        value: string | { class: string; connector: string; prefix?: string };
    };
    'input-type'?: any;
    'output-type'?: any;
    name?: string;
}

export interface IFSMStates {
    [name: string]: IFSMState;
}

export const TOOLBAR_ITEM_TYPE: string = 'toolbar-item';
export const STATE_ITEM_TYPE: string = 'state';

const DIAGRAM_SIZE: number = 2000;
const DIAGRAM_DRAG_KEY: string = 'Shift';
const DROP_ACCEPTS: string[] = [TOOLBAR_ITEM_TYPE, STATE_ITEM_TYPE];

const StyledToolbarWrapper = styled.div`
    margin-bottom: 10px;
`;

const StyledDiagramWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`;

const StyledDiagram = styled.div<{ path: string }>`
    width: ${DIAGRAM_SIZE}px;
    height: ${DIAGRAM_SIZE}px;
    background: ${({ path }) =>
        `url(${
            process.env.NODE_ENV === 'development'
                ? `http://localhost:9876/images/tiny_grid.png`
                : `vscode-resource:${path}/images/tiny_grid.png)`
        })`};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: inset 1px 1px 0 0 red, inset -1px -1px 0 0 red;
`;

const StyledFSMLine = styled.line`
    transition: all 0.2s linear;
    cursor: pointer;

    &:hover {
        stroke-width: 6;
    }
`;

let currentXPan: number;
let currentYPan: number;

const FSMView: React.FC<IFSMViewProps> = () => {
    const t = useContext(TextContext);
    const { sidebarOpen, path } = useContext(InitialContext);
    const wrapperRef = useRef(null);
    const [states, setStates] = useState<IFSMStates>({});
    const [selectedState, setSelectedState] = useState<number | null>(null);
    const [editingState, setEditingState] = useState<number | null>(null);
    const [editingTransition, setEditingTransition] = useState<{ stateId: number; index: number }[] | null>([]);
    const [isHoldingShiftKey, setIsHoldingShiftKey] = useState<boolean>(false);
    const [wrapperDimensions, setWrapperDimensions] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [, drop] = useDrop({
        accept: DROP_ACCEPTS,
        drop: (item: IDraggableItem, monitor) => {
            if (item.type === TOOLBAR_ITEM_TYPE) {
                const { x, y } = monitor.getClientOffset();
                const ids: number[] = size(states) ? Object.keys(states).map((key) => parseInt(key)) : [0];
                const id = Math.max(...ids) + 1;

                setStates(
                    (cur: IFSMStates): IFSMStates => ({
                        ...cur,
                        [id]: {
                            id,
                            position: {
                                x: x + currentXPan - (sidebarOpen ? 333 : 153),
                                y: y + currentYPan - 181,
                            },
                            final: false,
                            initial: false,
                            name: `State ${id}`,
                        },
                    })
                );
            } else if (item.type === STATE_ITEM_TYPE) {
                moveItem(item.id, monitor.getDifferenceFromInitialOffset());
            }
        },
    });

    const moveItem: (id: number, coords: XYCoord) => void = (id, coords) => {
        setStates((cur) => {
            const newBoxes = { ...cur };

            newBoxes[id].position.x += coords.x;
            newBoxes[id].position.y += coords.y;

            return newBoxes;
        });
    };

    useMount(() => {
        const { width, height } = wrapperRef.current.getBoundingClientRect();

        currentXPan = 1000 - width / 2;
        currentYPan = 1000 - height / 2;

        setWrapperDimensions({ width, height });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    });

    const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === DIAGRAM_DRAG_KEY) {
            setIsHoldingShiftKey(true);
        }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
        if (event.key === DIAGRAM_DRAG_KEY) {
            setIsHoldingShiftKey(false);
        }
    };

    const setWrapperPan = (x, y) => {
        currentXPan = x;
        currentYPan = y;
    };

    const getTransitionByState = (stateId: number, targetId: number): IFSMTransition | null => {
        const { transitions } = states[stateId];

        return transitions?.find((transition) => transition.state === targetId);
    };

    const handleStateClick = (id: number): void => {
        if (selectedState) {
            // Do nothing if the selected transition already
            // exists
            if (getTransitionByState(selectedState, id)) {
                return;
            }

            setStates((cur) => {
                const newBoxes = { ...cur };

                newBoxes[selectedState].transitions = [
                    ...(newBoxes[selectedState].transitions || []),
                    {
                        state: id,
                    },
                ];

                return newBoxes;
            });
            setSelectedState(null);
        } else {
            setSelectedState(id);
        }
    };

    const updateStateData = (id: number, data: IFSMState) => {
        setStates(
            (cur: IFSMStates): IFSMStates => {
                const newStates = { ...cur };

                newStates[id] = {
                    ...newStates[id],
                    ...data,
                };

                return newStates;
            }
        );
        setEditingState(null);
    };

    const updateTransitionData = (stateId: number, index: number, data: IFSMTransition) => {
        const transitionsCopy = [...states[stateId].transitions];

        transitionsCopy[index] = {
            ...transitionsCopy[index],
            ...data,
        };

        updateStateData(stateId, { transitions: transitionsCopy });
    };

    const handleStateEditClick = (id: number): void => {
        setEditingState(id);
    };

    const hasBothWayTransition = (stateId: string, targetId: string): { stateId: string; index: number } => {
        const transitionIndex = states[targetId].transitions?.findIndex(
            (transition) => transition.state === parseInt(stateId)
        );

        if (transitionIndex || transitionIndex === 0) {
            return { stateId: targetId, index: transitionIndex };
        }

        return null;
    };

    const isTransitionToSelf = (stateId: string, targetId: string): boolean => {
        return stateId === targetId;
    };

    const handleStateDeleteClick = (id: number): void => {
        setStates((current) => {
            let newStates: IFSMStates = { ...current };

            newStates = reduce(
                newStates,
                (modifiedStates: IFSMStates, state: IFSMState, stateId: string) => {
                    const newState: IFSMState = { ...state };

                    if (parseInt(stateId) === id) {
                        return modifiedStates;
                    }

                    if (state.transitions && getTransitionByState(parseInt(stateId), id)) {
                        newState.transitions = newState.transitions.reduce(
                            (newTransitions: IFSMTransition[], transition: IFSMTransition) => {
                                if (transition.state === id) {
                                    return newTransitions;
                                }

                                return [...newTransitions, transition];
                            },
                            []
                        );
                    }

                    return { ...modifiedStates, [stateId]: newState };
                },
                {}
            );

            return newStates;
        });
    };

    const transitions = reduce(
        states,
        (newTransitions: any[], state: IFSMState, id: string) => {
            if (!state.transitions) {
                return newTransitions;
            }

            const stateTransitions = state.transitions.map((transition: IFSMTransition, index: number) => ({
                isError: !!transition.errors,
                transitionIndex: index,
                state: parseInt(id),
                targetState: transition.state,
                x1: state.position.x,
                y1: state.position.y,
                x2: states[transition.state].position.x,
                y2: states[transition.state].position.y,
                order: !!transition.errors ? 0 : 1,
            }));

            return [...newTransitions, ...stateTransitions];
        },
        []
    ).sort((a, b) => a.order - b.order);

    return (
        <>
            {editingState && (
                <FSMStateDialog
                    onSubmit={updateStateData}
                    onClose={() => setEditingState(null)}
                    data={states[editingState]}
                    id={editingState}
                    otherStates={reduce(
                        states,
                        (newStates, state, id) =>
                            parseInt(id) === editingState ? { ...newStates } : { ...newStates, [id]: state },
                        {}
                    )}
                />
            )}
            {size(editingTransition) ? (
                <FSMTransitionDialog
                    onSubmit={updateTransitionData}
                    onClose={() => setEditingTransition([])}
                    states={states}
                    editingData={editingTransition}
                />
            ) : null}
            <StyledToolbarWrapper>
                <FSMToolbarItem name="state" count={size(states)}>
                    State
                </FSMToolbarItem>
            </StyledToolbarWrapper>
            <StyledDiagramWrapper ref={wrapperRef}>
                <FSMDiagramWrapper
                    wrapperDimensions={wrapperDimensions}
                    setPan={setWrapperPan}
                    isHoldingShiftKey={isHoldingShiftKey}
                >
                    <StyledDiagram
                        key={JSON.stringify(wrapperDimensions)}
                        ref={drop}
                        path={path}
                        onClick={() => !isHoldingShiftKey && setSelectedState(null)}
                    >
                        {map(states, (state, id) => (
                            <FSMState
                                key={id}
                                id={id}
                                {...state}
                                selected={selectedState === parseInt(id)}
                                onClick={handleStateClick}
                                onEditClick={handleStateEditClick}
                                onDeleteClick={handleStateDeleteClick}
                            />
                        ))}
                        <svg height="100%" width="100%" style={{ position: 'absolute' }}>
                            {transitions.map(
                                ({ x1, x2, y1, y2, state, targetState, isError, transitionIndex }, index) =>
                                    isTransitionToSelf(state, targetState) ? (
                                        <circle
                                            cx={x1 + 90}
                                            cy={y1}
                                            r={25}
                                            fill="transparent"
                                            stroke={isError ? 'red' : '#a9a9a9'}
                                            strokeWidth={2}
                                            strokeDasharray={isError ? '10 2' : undefined}
                                            key={index}
                                            onClick={() =>
                                                setEditingTransition([{ stateId: state, index: transitionIndex }])
                                            }
                                        />
                                    ) : (
                                        <>
                                            <StyledFSMLine
                                                onClick={() => {
                                                    setEditingTransition((cur) => {
                                                        const result = [...cur];

                                                        result.push({ stateId: state, index: transitionIndex });

                                                        const hasBothWay = hasBothWayTransition(state, targetState);

                                                        if (hasBothWay) {
                                                            result.push(hasBothWay);
                                                        }

                                                        return result;
                                                    });
                                                }}
                                                key={index}
                                                stroke={isError ? 'red' : '#a9a9a9'}
                                                strokeWidth={isError ? 4 : 2}
                                                strokeDasharray={isError ? '10 2' : undefined}
                                                markerEnd={isError ? 'url(#arrowheaderror)' : 'url(#arrowhead)'}
                                                x1={x1 + 90}
                                                y1={y1 + 25}
                                                x2={x2 + 90}
                                                y2={y2 + 25}
                                            />
                                        </>
                                    )
                            )}
                        </svg>
                    </StyledDiagram>
                </FSMDiagramWrapper>
            </StyledDiagramWrapper>
        </>
    );
};

/*
d={`M ${x1 + 90} ${y1 + 25} L ${x2 + 90} ${y2 + 25}`}
                                            */

export default FSMView;
