import React, { useContext, useRef, useState } from 'react';
import { TTranslator } from '../../../App';
import { TextContext } from '../../../context/text';
import size from 'lodash/size';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import filter from 'lodash/filter';
import cloneDeep from 'lodash/filter';

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
import { FieldWrapper, FieldInputWrapper, ActionsWrapper } from '../panel';
import FieldLabel from '../../../components/FieldLabel';
import { validateField } from '../../../helpers/validations';
import String from '../../../components/Field/string';
import { Tag, Button, ButtonGroup, Tooltip, Intent } from '@blueprintjs/core';
import FSMTriggerDialog from './triggerDialog';
import { Messages } from '../../../constants/messages';
import FileString from '../../../components/Field/fileString';
import SelectField from '../../../components/Field/select';

import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import Number from '../../../components/Field/number';
import Spacer from '../../../components/Spacer';

export interface IFSMViewProps {
    onSubmitSuccess: () => any;
    setFsmReset: () => void; 
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

export type TTrigger = { class?: string; connector?: string; method?: string };

export interface IFSMMetadata {
    name: string;
    desc: string;
    triggers?: TTrigger[];
    target_dir: string;
    fsm_options?: {
        'action-strategy': 'one' | 'all';
        'max-thread-count': number;
    };
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
    type: 'state' | 'fsm';
    desc: string;
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
                : `vscode-resource:${path}/images/tiny_grid.png`
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

const StyledFSMCircle = styled.circle`
    transition: all 0.2s linear;
    cursor: pointer;

    &:hover {
        stroke-width: 6;
    }
`;

let currentXPan: number;
let currentYPan: number;

const FSMView: React.FC<IFSMViewProps> = ({ onSubmitSuccess, setFsmReset, interfaceContext }) => {
    const t = useContext(TextContext);
    const { sidebarOpen, path, confirmAction, callBackend, fsm } = useContext(InitialContext);
    
    const wrapperRef = useRef(null);
    const fieldsWrapperRef = useRef(null);

    const [states, setStates] = useState<IFSMStates>(fsm?.states || {});
    const [metadata, setMetadata] = useState<IFSMMetadata>({
        target_dir: fsm?.target_dir || null,
        name: fsm?.name || null,
        desc: fsm?.desc || null,
        triggers: fsm?.triggers || [],
        fsm_options: fsm?.fsm_options || {
            "action-strategy": 'one',
            "max-thread-count": 1,
        }
    });
    const [selectedState, setSelectedState] = useState<number | null>(null);
    const [editingState, setEditingState] = useState<number | null>(null);
    const [triggerManager, setTriggerManager] = useState<{ isOpen: boolean; data?: TTrigger; index?: number }>({
        isOpen: false,
    });
    const [editingTransition, setEditingTransition] = useState<{ stateId: number; index: number }[] | null>([]);
    const [isHoldingShiftKey, setIsHoldingShiftKey] = useState<boolean>(false);
    const [wrapperDimensions, setWrapperDimensions] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(false);
    const [zoom, setZoom] = useState<number>(1);

    const [, drop] = useDrop({
        accept: DROP_ACCEPTS,
        drop: (item: IDraggableItem, monitor) => {
            if (item.type === TOOLBAR_ITEM_TYPE) {
                let { x, y } = monitor.getClientOffset();
                const ids: number[] = size(states) ? Object.keys(states).map((key) => parseInt(key)) : [0];
                const id = Math.max(...ids) + 1;
                const calculatePercDiff = (value) => value + (value / 100) * Math.abs(100 * (zoom - 1));
                x = x / zoom;
                y = y / zoom;

                setStates(
                    (cur: IFSMStates): IFSMStates => ({
                        ...cur,
                        [id]: {
                            id,
                            position: {
                                x: x + calculatePercDiff(currentXPan) - (sidebarOpen ? 333 : 153),
                                y: y + calculatePercDiff(currentYPan) - (fieldsWrapperRef.current.getBoundingClientRect().height + 200),
                            },
                            final: false,
                            initial: false,
                            name: item.name === 'state' ? `State ${id}` : null,
                            type: item.name,
                        },
                    })
                );

                if (item.name === 'fsm') {
                    setEditingState(id);
                }
            } else if (item.type === STATE_ITEM_TYPE) {
                moveItem(item.id, monitor.getDifferenceFromInitialOffset());
            }
        },
    });

    const isFSMValid = () => {
        return (
            validateField('string', metadata.target_dir) && 
            validateField('string', metadata.name) && 
            validateField('string', metadata.desc) && 
            size(states)
        )
    }

    const handleMetadataChange: (name: string, value: any) => void = (name, value) => {
        setMetadata((cur) => ({
            ...cur,
            [name]: value,
        }));
    };

    const moveItem: (id: number, coords: XYCoord) => void = (id, coords) => {
        setStates((cur) => {
            const newBoxes = { ...cur };

            newBoxes[id].position.x += coords.x;
            newBoxes[id].position.y += coords.y;

            return newBoxes;
        });
    };

    useMount(() => {
        setFsmReset(() => reset);
        const { width, height } = wrapperRef.current.getBoundingClientRect();

        currentXPan = 1000 - width / 2;
        currentYPan = 1000 - height / 2;

        setWrapperDimensions({ width, height });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            
            setFsmReset(null);
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

            // Also do nothing is the user is trying to transition FSM to itself
            if (states[id].type === 'fsm' && selectedState === id) {
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

    const updateTransitionData = (stateId: number, index: number, data: IFSMTransition, remove?: boolean) => {
        let transitionsCopy = [...states[stateId].transitions];

        if (remove) {
            delete transitionsCopy[index];
        } else {
            transitionsCopy[index] = {
                ...transitionsCopy[index],
                ...data,
            };
        }

        transitionsCopy = transitionsCopy.filter((t) => t);
        transitionsCopy = size(transitionsCopy) === 0 ? null : transitionsCopy;

        updateStateData(stateId, { transitions: transitionsCopy });
    };

    const handleStateEditClick = (id: number): void => {
        setEditingState(id);
    };

    const handleSubmitClick = async () => {
        const result = await callBackend(
            fsm ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
            undefined,
            {
                iface_kind: 'fsm',
                orig_data: fsm,
                data: {
                    ...metadata,
                    states,
                },
            },
            t('Saving FSM...')
        );

        if (result.ok) {
            if (onSubmitSuccess) {
                onSubmitSuccess({
                    ...metadata,
                    states,
                });
            }
            reset();
        }
    }

    const hasBothWayTransition = (stateId: string, targetId: string): { stateId: string; index: number } => {
        const transitionIndex = states[targetId].transitions?.findIndex(
            (transition) => transition.state === parseInt(stateId)
        );

        if (transitionIndex >= 0) {
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

    const reset = () => {
        setStates({});
        setMetadata({ name: null, desc: null, triggers: [], target_dir: null, fsm_options: { "action-strategy": 'one', "max-thread-count": 1 } });
    }

    const calculateMargin = () => (zoom - 1) * 1000;

    const handleTriggerRemove = (trigger: string): void => {
        setMetadata(cur => {
            const result = {...cur};

            result.triggers = result.triggers.filter((trig) => trigger !== getTriggerName(trig));

            return result;
        })
    }

    const getTriggerName = (trigger: TTrigger) => {
        if (trigger.hasOwnProperty('method')) {
            return trigger.method;
        }

        return `${trigger.class}:${trigger.connector}`;
    };
    
    return (
        <>
            <div ref={fieldsWrapperRef}>
                {!isMetadataHidden && (
                    <>
                        <FieldWrapper>
                            <FieldLabel label={t('field-label-target_dir')} isValid={validateField('file-string', metadata.target_dir)} />
                            <FieldInputWrapper>
                                <FileString
                                    onChange={handleMetadataChange}
                                    name="target_dir"
                                    value={metadata.target_dir}
                                    get_message={{
                                        action: 'creator-get-directories',
                                        object_type: 'target_dir',
                                    }}
                                    return_message={{
                                        action: 'creator-return-directories',
                                        object_type: 'target_dir',
                                        return_value: 'directories',
                                    }}
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel isValid={validateField('string', metadata.name)} label={t('field-label-name')} />
                            <FieldInputWrapper>
                                <String onChange={handleMetadataChange} value={metadata.name} name="name" />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel isValid={validateField('string', metadata.desc)} label={t('field-label-desc')} />
                            <FieldInputWrapper>
                                <String onChange={handleMetadataChange} value={metadata.desc} name="desc" />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel isValid={validateField('string', metadata.fsm_options)} label={t('field-label-options')} />
                            <FieldInputWrapper>
                                <p>{t('ActionStrategy')}</p>
                                <SelectField 
                                    onChange={(_, value) => {
                                        handleMetadataChange('fsm_options', {
                                            ...metadata.fsm_options,
                                            'action-strategy': value,
                                        })
                                    }}
                                    name='fsm_options'
                                    value={metadata.fsm_options['action-strategy']}
                                    defaultItems={[{ name: 'one'}, { name: 'all' }]}
                                />
                                <Spacer size={10} />
                                <p>{t('MaxThreadCount')}</p>
                                <Number 
                                    onChange={(_, value) => {
                                        handleMetadataChange('fsm_options', {
                                            ...metadata.fsm_options,
                                            'max-thread-count': value,
                                        })
                                    }}
                                    name='fsm_options'
                                    value={metadata.fsm_options['max-thread-count']}
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper>
                            <FieldLabel isValid={validateField('string', metadata.triggers)} label={t('field-label-triggers')} />
                            <FieldInputWrapper>
                                {metadata.triggers.map((trigger: TTrigger, index: number) => (
                                    <>
                                        <Tag
                                            large
                                            interactive
                                            intent="none"
                                            minimal
                                            onClick={() => {
                                                setTriggerManager({ isOpen: true, data: trigger, index });
                                            }}
                                            onRemove={(e, props) => {
                                                e.stopPropagation();
                                                handleTriggerRemove(props.children);
                                            }}
                                        >
                                            {getTriggerName(trigger)}
                                        </Tag>{' '}
                                    </>
                                ))}
                                <Button icon="add" intent="success" onClick={() => setTriggerManager({ isOpen: true })} />
                            </FieldInputWrapper>
                        </FieldWrapper>
                    </>
                )}
            </div>
            {triggerManager.isOpen && (
                <FSMTriggerDialog
                    {...triggerManager}
                    ifaceType={interfaceContext?.iface_kind}
                    onClose={() => setTriggerManager({ isOpen: false })}
                    onSubmit={(data, index) => {
                        const newTriggers: TTrigger[] = cloneDeep(metadata.triggers);

                        if (index || index === 0) {
                            newTriggers[index] = data;
                        } else {
                            newTriggers.push(data);
                        }

                        handleMetadataChange('triggers', newTriggers);
                    }}
                />
            )}
            {editingState && (
                <FSMStateDialog
                    onSubmit={updateStateData}
                    onClose={() => setEditingState(null)}
                    data={states[editingState]}
                    id={editingState}
                    deleteState={handleStateDeleteClick}
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
                <FSMToolbarItem name="state" count={size(filter(states, ({ type }: IFSMState) => type === 'state'))}>
                    {t('State')}
                </FSMToolbarItem>
                <FSMToolbarItem name="fsm" count={size(filter(states, ({ type }: IFSMState) => type === 'fsm'))}>
                    {t('FSM')}
                </FSMToolbarItem>
                <Button
                    style={{ float: 'right' }}
                    onClick={() => setIsMetadataHidden(cur => !cur)}
                    text={t(isMetadataHidden ? 'ShowMetadata' : 'HideMetadata')}
                    icon={isMetadataHidden ? 'eye-open' : 'eye-off'}
                />
            </StyledToolbarWrapper>
            <StyledDiagramWrapper ref={wrapperRef}>
                <FSMDiagramWrapper
                    wrapperDimensions={wrapperDimensions}
                    setPan={setWrapperPan}
                    isHoldingShiftKey={isHoldingShiftKey}
                    zoom={zoom}
                >
                    <StyledDiagram
                        key={JSON.stringify(wrapperDimensions)}
                        ref={drop}
                        path={path}
                        onClick={() => !isHoldingShiftKey && setSelectedState(null)}
                        style={{
                            transform: `scale(${zoom})`,
                            marginLeft: `${calculateMargin()}px`,
                            marginTop: `${calculateMargin()}px`,
                        }}
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
                                        <StyledFSMCircle
                                            cx={x1 + 90}
                                            cy={y1 + 50}
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
            <ActionsWrapper>
                <div style={{ float: 'right', width: '100%' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
                                    confirmAction(
                                        'ResetFieldsConfirm',
                                        () => {
                                            reset();
                                        },
                                        'Reset',
                                        'warning'
                                    );
                                }}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            onClick={handleSubmitClick}
                            disabled={!isFSMValid()}
                            icon={'tick'}
                            intent={Intent.SUCCESS}
                        />
                    </ButtonGroup>
                </div>
            </ActionsWrapper>
        </>
    );
};

export default withGlobalOptionsConsumer()(FSMView);
