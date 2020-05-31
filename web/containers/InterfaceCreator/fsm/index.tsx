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
import FSMStateDialog from './stateDialog';

export interface IFSMViewProps {
    t: TTranslator;
}

export interface IDraggableItem {
    type: 'toolbar-item' | 'state';
    name: string;
    id?: string;
}

export interface IFSMTransition {
    state?: string;
    fsm?: number;
    condition?: {
        type: string;
    };
}

export interface IFSMState {
    x?: number;
    y?: number;
    id?: string;
    transitions?: IFSMTransition[];
    'error-transitions'?: IFSMTransition[];
    initial: boolean;
    final?: boolean;
    action?: string;
    'input-type'?: any;
    'output-type'?: any;
    name: string;
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
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [editingState, setEditingState] = useState<string | null>(null);
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

                setStates((cur) => ({
                    ...cur,
                    [id]: {
                        id,
                        x: x + currentXPan - (sidebarOpen ? 333 : 153),
                        y: y + currentYPan - 181,
                        name: `State ${id}`,
                    },
                }));
            } else if (item.type === STATE_ITEM_TYPE) {
                moveItem(item.id, monitor.getDifferenceFromInitialOffset());
            }
        },
    });

    const moveItem: (id: string, coords: XYCoord) => void = (id, coords) => {
        setStates((cur) => {
            const newBoxes = { ...cur };

            newBoxes[id].x += coords.x;
            newBoxes[id].y += coords.y;

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

    const handleStateClick = (id: string): void => {
        if (selectedState) {
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

    const handleStateEditClick = (id: string): void => {
        setEditingState(id);
    };

    const transitions = reduce(
        states,
        (newTransitions: any[], state: IFSMState, name: string) => {
            if (!state.transitions) {
                return newTransitions;
            }

            const stateTransitions = state.transitions.map((transition) => ({
                x1: state.x,
                y1: state.y,
                x2: states[transition.state].x,
                y2: states[transition.state].y,
            }));

            return [...newTransitions, ...stateTransitions];
        },
        []
    );

    console.log(states, transitions);

    return (
        <>
            {editingState && (
                <FSMStateDialog onClose={() => setEditingState(null)} data={states[editingState]} id={editingState} />
            )}
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
                                selected={selectedState === id}
                                onClick={handleStateClick}
                                onEditClick={handleStateEditClick}
                            />
                        ))}
                        <svg height="100%" width="100%" style={{ position: 'absolute' }}>
                            {transitions.map(({ x1, x2, y1, y2 }, index) => (
                                <StyledFSMLine
                                    key={index}
                                    stroke="#a9a9a9"
                                    strokeWidth={3}
                                    x1={x1 + 90}
                                    y1={y1 + 25}
                                    x2={x2 + 90}
                                    y2={y2 + 25}
                                    markerEnd="url(#arrow)"
                                >
                                    <text>test</text>
                                </StyledFSMLine>
                            ))}
                        </svg>
                    </StyledDiagram>
                </FSMDiagramWrapper>
            </StyledDiagramWrapper>
        </>
    );
};

export default FSMView;
