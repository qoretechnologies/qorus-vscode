import { Button, ButtonGroup, Callout, Intent, Tooltip } from '@blueprintjs/core';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrop, XYCoord } from 'react-dnd';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import Field from '../../../components/Field';
import FileString from '../../../components/Field/fileString';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import Spacer from '../../../components/Spacer';
import { Messages } from '../../../constants/messages';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { areTypesCompatible, isStateIsolated, ITypeComparatorData } from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import withMessageHandler from '../../../hocomponents/withMessageHandler';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../panel';
import FSMDiagramWrapper from './diagramWrapper';
import FSMInitialOrderDialog from './initialOrderDialog';
import FSMState from './state';
import FSMStateDialog, { TAction } from './stateDialog';
import FSMToolbarItem from './toolbarItem';
import FSMTransitionDialog from './transitionDialog';
import FSMTransitionOrderDialog from './transitionOrderDialog';

export interface IFSMViewProps {
    onSubmitSuccess: (data: any) => any;
    setFsmReset: () => void;
    embedded?: boolean;
    defaultStates?: IFSMStates;
    parentStateName?: string;
    defaultInterfaceId?: string;
}

export interface IDraggableItem {
    type: 'toolbar-item' | 'state';
    name: 'fsm' | 'state' | 'block' | 'if';
    id?: number;
    stateType?: TAction;
}

export interface IFSMTransition {
    state?: string;
    fsm?: number;
    condition?: {
        type: string;
    };
    language: string;
    errors?: string[];
    branch?: 'true' | 'false';
}

export type TTrigger = { class?: string; connector?: string; method?: string };

export interface IFSMMetadata {
    name: string;
    desc: string;
    target_dir: string;
    groups?: any[];
}

export interface IFSMState {
    position?: {
        x?: number;
        y?: number;
    };
    transitions?: IFSMTransition[];
    'error-transitions'?: IFSMTransition[];
    initial?: boolean;
    action?: {
        type: TAction;
        value?: string | { class: string; connector: string; prefix?: string };
    };
    'input-type'?: any;
    'output-type'?: any;
    name?: string;
    type: 'state' | 'fsm' | 'block' | 'if';
    desc: string;
    states?: IFSMStates;
    fsm?: string;
    id?: string;
    condition?: any;
    language?: 'qore' | 'python';
    execution_order?: number;
    keyId?: string;
}

export interface IFSMStates {
    [name: string]: IFSMState;
}

export const TOOLBAR_ITEM_TYPE: string = 'toolbar-item';
export const STATE_ITEM_TYPE: string = 'state';

const DIAGRAM_SIZE: number = 2000;
export const IF_STATE_SIZE: number = 80;
export const STATE_WIDTH: number = 180;
export const STATE_HEIGHT: number = 50;
const DIAGRAM_DRAG_KEY: string = 'Shift';
const DROP_ACCEPTS: string[] = [TOOLBAR_ITEM_TYPE, STATE_ITEM_TYPE];

export const StyledToolbarWrapper = styled.div`
    margin-bottom: 10px;
    margin-top: 10px;
`;

const StyledDiagramWrapper = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
`;

const StyledDiagram = styled.div<{ path: string }>`
    width: ${DIAGRAM_SIZE}px;
    height: ${DIAGRAM_SIZE}px;
    background: ${({ path }) => `url(${`${path}/images/tiny_grid.png`})`};
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    box-shadow: inset 10px 10px 80px -50px red, inset -10px -10px 80px -50px red;
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

const FSMView: React.FC<IFSMViewProps> = ({
    onSubmitSuccess,
    setFsmReset,
    interfaceContext,
    postMessage,
    embedded,
    states,
    setStates,
    parentStateName,
    onStatesChange,
    onHideMetadataClick,
    isExternalMetadataHidden,
    defaultInterfaceId,
}) => {
    const t = useContext(TextContext);
    const { sidebarOpen, path, image_path, confirmAction, callBackend, fsm, qorus_instance } = useContext(
        InitialContext
    );
    const { resetAllInterfaceData } = useContext(GlobalContext);
    const [interfaceId, setInterfaceId] = useState(fsm?.iface_id || defaultInterfaceId || shortid.generate());

    const wrapperRef = useRef(null);
    const fieldsWrapperRef = useRef(null);
    const currentXPan = useRef<number>();
    const currentYPan = useRef<number>();
    const changeHistory = useRef<string[]>([]);
    const currentHistoryPosition = useRef<number>(-1);

    if (!embedded) {
        const [st, setSt] = useState<IFSMStates>(cloneDeep(fsm?.states || {}));

        states = st;
        setStates = setSt;
    }

    const [metadata, setMetadata] = useState<IFSMMetadata>({
        target_dir: fsm?.target_dir || null,
        name: fsm?.name || null,
        desc: fsm?.desc || null,
        groups: fsm?.groups || [],
    });
    const [selectedState, setSelectedState] = useState<string | null>(null);
    const [editingState, setEditingState] = useState<string | null>(null);
    const [editingTransition, setEditingTransition] = useState<{ stateId: number; index: number }[] | null>([]);
    const [editingTransitionOrder, setEditingTransitionOrder] = useState<number | null>(null);
    const [isHoldingShiftKey, setIsHoldingShiftKey] = useState<boolean>(true);
    const [editingInitialOrder, setEditingInitialOrder] = useState<boolean>(false);
    const [wrapperDimensions, setWrapperDimensions] = useState<{ width: number; height: number }>({
        width: 0,
        height: 0,
    });
    const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(embedded ? true : false);
    const [zoom, setZoom] = useState<number>(1);

    const [, drop] = useDrop({
        accept: DROP_ACCEPTS,
        drop: (item: IDraggableItem, monitor) => {
            if (item.type === TOOLBAR_ITEM_TYPE) {
                let { x, y } = monitor.getClientOffset();
                const ids: number[] = size(states) ? Object.keys(states).map((key) => parseInt(key)) : [0];
                const id = (Math.max(...ids) + 1).toString();
                const calculatePercDiff = (value) => value + (value / 100) * Math.abs(100 * (zoom - 1));
                x = x / zoom;
                y = y / zoom;

                setStates(
                    (cur: IFSMStates): IFSMStates => ({
                        ...cur,
                        [id]: {
                            position: {
                                x:
                                    x +
                                    calculatePercDiff(currentXPan.current) -
                                    (!embedded && sidebarOpen ? 333 : embedded ? 233 : 153),
                                y:
                                    y +
                                    calculatePercDiff(currentYPan.current) -
                                    (fieldsWrapperRef.current.getBoundingClientRect().height + (embedded ? 380 : 200)),
                            },
                            initial: false,
                            name: getStateName(item, id),
                            desc: '',
                            type: item.name,
                            id: shortid.generate(),
                            states: item.name === 'block' ? {} : undefined,
                            condition: item.name === 'if' ? '' : undefined,
                            action:
                                item.name === 'state'
                                    ? {
                                          type: item.stateType,
                                      }
                                    : undefined,
                        },
                    })
                );

                setEditingState(id);
            } else if (item.type === STATE_ITEM_TYPE) {
                moveItem(item.id, monitor.getDifferenceFromInitialOffset());
            }
        },
    });

    const getStateName = (item, id) => {
        if (parentStateName) {
            return `${parentStateName}.State ${id}`;
        }

        if (item.name === 'block' || item.name === 'if') {
            return `State ${id}`;
        }

        return item.name === 'state' ? `State ${id}` : null;
    };

    const getStateType = (state: IFSMState) => {
        if (state.type === 'block') {
            return 'block';
        }

        if (state.type === 'fsm') {
            return 'fsm';
        }

        if (state.type === 'if') {
            return 'if';
        }

        return state.action?.type;
    };

    const getXDiff = (type) => {
        return type === 'if' ? IF_STATE_SIZE / 2 : STATE_WIDTH / 2;
    };

    const getYDiff = (type) => {
        return type === 'if' ? IF_STATE_SIZE / 2 : STATE_HEIGHT / 2;
    };

    const isFSMValid = () => {
        return (
            validateField('string', metadata.target_dir) &&
            validateField('string', metadata.name) &&
            validateField('string', metadata.desc) &&
            size(states)
        );
    };

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

            updateHistory(newBoxes);

            return newBoxes;
        });
    };

    useMount(() => {
        if (!embedded) {
            setFsmReset(() => reset);
        }
        const { width, height } = wrapperRef.current.getBoundingClientRect();

        updateHistory(embedded ? states : cloneDeep(fsm?.states || {}));

        currentXPan.current = 0;
        currentYPan.current = 0;

        setWrapperDimensions({ width, height });

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            if (!embedded) {
                setFsmReset(null);
            }
        };
    });

    useEffect(() => {
        if (states && onStatesChange) {
            onStatesChange(states);
        }
    }, [states]);

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
        currentXPan.current = x;
        currentYPan.current = y;
    };

    const getTransitionByState = (stateId: string, targetId: string): IFSMTransition | null => {
        const { transitions } = states[stateId];

        return transitions?.find((transition) => transition.state === targetId);
    };

    const getStateDataForComparison = (
        state: IFSMState,
        providerType: 'input' | 'output'
    ): ITypeComparatorData | null => {
        if (state.action) {
            const { type, value } = state.action;

            return {
                interfaceName: type === 'connector' ? value.class : value,
                interfaceKind: type,
                connectorName: type === 'connector' ? value.connector : undefined,
                typeData: state[`${providerType}-type`] || state['input-output-type'],
            };
        }

        if (!state[`${providerType}-type`] && !state['input-output-type']) {
            return null;
        }

        return {
            typeData: state[`${providerType}-type`] || state['input-output-type'],
        };
    };

    const isAvailableForTransition = async (stateId: string, targetId: string): Promise<boolean> => {
        const outputState = states[stateId];
        const inputState = states[targetId];

        const compatible = await areTypesCompatible(
            getStateDataForComparison(outputState, 'output'),
            getStateDataForComparison(inputState, 'input')
        );

        return compatible && !getTransitionByState(stateId, targetId);
    };

    const handleStateClick = (id: string): void => {
        if (selectedState) {
            // Do nothing if the selected transition already
            // exists
            if (getTransitionByState(selectedState, id)) {
                return;
            }

            const selectedStateType = states[selectedState].type;
            const targetStateType = states[id].type;

            // Also do nothing is the user is trying to transition FSM to itself or IF to itself
            if ((targetStateType === 'fsm' || targetStateType === 'if') && selectedState === id) {
                return;
            }

            setStates((cur) => {
                const newBoxes = { ...cur };

                newBoxes[selectedState].transitions = [
                    ...(newBoxes[selectedState].transitions || []),
                    {
                        state: id.toString(),
                        branch: selectedStateType === 'if' ? 'true' : undefined,
                        language: 'qore',
                    },
                ];

                updateHistory(newBoxes);

                return newBoxes;
            });

            setSelectedState(null);
        } else {
            setSelectedState(id);
        }
    };

    const updateHistory = (data: IFSMStates) => {
        if (currentHistoryPosition.current >= 0) {
            changeHistory.current.length = currentHistoryPosition.current + 1;
        }
        changeHistory.current.push(JSON.stringify(data));

        if (changeHistory.current.length > 10) {
            changeHistory.current.shift();
        } else {
            currentHistoryPosition.current += 1;
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

                updateHistory(newStates);

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

    const handleStateEditClick = (id: string): void => {
        setEditingState(id);
    };

    const handleSubmitClick = async () => {
        let fixedMetadata = { ...metadata };

        if (size(metadata.groups) === 0) {
            delete fixedMetadata.groups;
        }

        const result = await callBackend(
            fsm ? Messages.EDIT_INTERFACE : Messages.CREATE_INTERFACE,
            undefined,
            {
                iface_kind: 'fsm',
                iface_id: interfaceId,
                orig_data: fsm,
                no_data_return: !!onSubmitSuccess,
                data: {
                    ...fixedMetadata,
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
            resetAllInterfaceData('fsm');
        }
    };

    const hasBothWayTransition = (stateId: string, targetId: string): { stateId: string; index: number } => {
        const transitionIndex = states[targetId].transitions?.findIndex((transition) => transition.state === stateId);

        if (transitionIndex >= 0) {
            return { stateId: targetId, index: transitionIndex };
        }

        return null;
    };

    const isTransitionToSelf = (stateId: string, targetId: string): boolean => {
        return stateId === targetId;
    };

    const handleStateDeleteClick = (id: string, unfilled?: boolean): void => {
        setStates((current) => {
            let newStates: IFSMStates = { ...current };

            newStates = reduce(
                newStates,
                (modifiedStates: IFSMStates, state: IFSMState, stateId: string) => {
                    const newState: IFSMState = { ...state };

                    if (stateId === id) {
                        return modifiedStates;
                    }

                    if (state.transitions && getTransitionByState(stateId, id)) {
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

            postMessage('remove-fsm-state', {
                iface_id: interfaceId,
                state_id: id,
            });

            // If this state was deleted because of unfilled data, do not
            // save history
            if (!unfilled) {
                updateHistory(newStates);
            }

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
                state: id,
                targetState: transition.state,
                x1: state.position.x,
                y1: state.position.y,
                x2: states[transition.state].position.x,
                y2: states[transition.state].position.y,
                order: !!transition.errors ? 0 : 1,
                branch: transition.branch,
            }));

            return [...newTransitions, ...stateTransitions];
        },
        []
    ).sort((a, b) => a.order - b.order);

    const reset = () => {
        postMessage(Messages.RESET_CONFIG_ITEMS, {
            iface_id: interfaceId,
        });
        setStates(cloneDeep(fsm?.states || {}));
        changeHistory.current = [JSON.stringify(cloneDeep(fsm?.states || {}))];
        currentHistoryPosition.current = 0;
        setMetadata({
            name: fsm?.name,
            desc: fsm?.desc,
            target_dir: fsm?.target_dir,
            groups: fsm?.groups || [],
        });
    };

    const getTransitionColor = (isError, branch) => {
        if (isError || branch === 'false') {
            return 'red';
        }

        if (branch === 'true') {
            return 'green';
        }

        return '#a9a9a9';
    };

    const getTransitionEndMarker = (isError, branch) => {
        if (isError) {
            return 'error';
        }

        if (branch) {
            return branch;
        }

        return '';
    };

    const getTargetStatePosition = (x1, y1, x2, y2, stateType, targetStateType) => {
        const modifiedX1 = x1 + 10000;
        const modifiedX2 = x2 + 10000;
        const modifiedY1 = y1 + 10000;
        const modifiedY2 = y2 + 10000;

        const sides = [];

        const horizontal = modifiedX1 - modifiedX2;
        const vertical = modifiedY1 - modifiedY2;

        if (x1 > x2) {
            sides.push({ side: 'left', value: Math.abs(horizontal) });
        } else {
            sides.push({ side: 'right', value: Math.abs(horizontal) });
        }

        if (y1 > y2) {
            sides.push({ side: 'top', value: Math.abs(vertical) });
        } else {
            sides.push({ side: 'bottom', value: Math.abs(vertical) });
        }

        const { side } = maxBy(sides, 'value');

        switch (side) {
            case 'right': {
                return { x2: targetStateType === 'if' ? x2 - 16 : x2, y2: y2 + getYDiff(targetStateType) };
            }
            case 'left': {
                return {
                    x2: x2 + getXDiff(targetStateType) * 2 + (targetStateType === 'if' ? 16 : 0),
                    y2: y2 + getYDiff(targetStateType),
                };
            }
            case 'bottom': {
                return { x2: x2 + getXDiff(targetStateType), y2: targetStateType === 'if' ? y2 - 16 : y2 };
            }
            case 'top': {
                return {
                    x2: x2 + getXDiff(targetStateType),
                    y2: y2 + getYDiff(targetStateType) * 2 + (targetStateType === 'if' ? 16 : 0),
                };
            }
            default: {
                return {
                    x2: 0,
                    y2: 0,
                };
            }
        }
    };

    const calculateMargin = () => (zoom - 1) * 1000;
    const { width = 0, height = 0 } = wrapperRef?.current?.getBoundingClientRect() || {};

    const getIsMetadataHidden = () => {
        return embedded ? isExternalMetadataHidden : isMetadataHidden;
    };

    return (
        <>
            <div ref={fieldsWrapperRef} id="fsm-fields-wrapper">
                {!isMetadataHidden && (
                    <>
                        <FieldWrapper name="selected-field">
                            <FieldLabel
                                label={t('field-label-target_dir')}
                                isValid={validateField('file-string', metadata.target_dir)}
                            />
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
                        <FieldWrapper name="selected-field">
                            <FieldLabel
                                isValid={validateField('string', metadata.name)}
                                label={t('field-label-name')}
                            />
                            <FieldInputWrapper>
                                <String onChange={handleMetadataChange} value={metadata.name} name="name" />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper name="selected-field">
                            <FieldLabel
                                isValid={validateField('string', metadata.desc)}
                                label={t('field-label-desc')}
                            />
                            <FieldInputWrapper>
                                <Field
                                    type="long-string"
                                    onChange={handleMetadataChange}
                                    value={metadata.desc}
                                    name="desc"
                                    markdown
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                        <FieldWrapper name="selected-field">
                            <FieldLabel
                                isValid={
                                    metadata.groups.length === 0 ? true : validateField('select-array', metadata.groups)
                                }
                                info={t('Optional')}
                                label={t('field-label-groups')}
                            />
                            <FieldInputWrapper>
                                <MultiSelect
                                    onChange={handleMetadataChange}
                                    get_message={{
                                        action: 'creator-get-objects',
                                        object_type: 'group',
                                    }}
                                    return_message={{
                                        action: 'creator-return-objects',
                                        object_type: 'group',
                                        return_value: 'objects',
                                    }}
                                    reference={{
                                        iface_kind: 'other',
                                        type: 'group',
                                    }}
                                    value={metadata.groups}
                                    name="groups"
                                />
                            </FieldInputWrapper>
                        </FieldWrapper>
                    </>
                )}
            </div>
            {editingState && (
                <FSMStateDialog
                    fsmName={metadata.name}
                    onSubmit={updateStateData}
                    onClose={() => setEditingState(null)}
                    data={states[editingState]}
                    id={editingState}
                    deleteState={handleStateDeleteClick}
                    interfaceId={interfaceId}
                    otherStates={reduce(
                        states,
                        (newStates, state, id) =>
                            id === editingState ? { ...newStates } : { ...newStates, [id]: state },
                        {}
                    )}
                />
            )}
            {editingTransitionOrder && (
                <FSMTransitionOrderDialog
                    transitions={states[editingTransitionOrder].transitions}
                    id={editingTransitionOrder}
                    onClose={() => setEditingTransitionOrder(null)}
                    getStateData={(id) => states[id]}
                    onSubmit={updateStateData}
                    states={states}
                />
            )}
            {editingInitialOrder && (
                <FSMInitialOrderDialog
                    onClose={() => setEditingInitialOrder(null)}
                    onSubmit={(data) =>
                        setStates((cur) => {
                            const result = { ...cur };

                            forEach(data, (stateData, keyId) => {
                                result[keyId] = stateData;
                            });

                            updateHistory(result);

                            return result;
                        })
                    }
                    allStates={states}
                    states={reduce(
                        states,
                        (initialStates, state, stateId) => {
                            if (state.initial) {
                                return { ...initialStates, [stateId]: state };
                            }

                            return initialStates;
                        },
                        {}
                    )}
                    fsmName={metadata.name}
                    interfaceId={interfaceId}
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
            {selectedState ? (
                <>
                    <Callout icon="info-sign" intent="primary">
                        {t('FSMSelectTargetState')}
                    </Callout>
                    <Spacer size={10} />
                </>
            ) : (
                <StyledToolbarWrapper id="fsm-toolbar">
                    <FSMToolbarItem
                        name="state"
                        type="mapper"
                        count={size(filter(states, ({ action }: IFSMState) => action?.type === 'mapper'))}
                    >
                        {t('Mapper')}
                    </FSMToolbarItem>
                    <FSMToolbarItem
                        name="state"
                        type="pipeline"
                        count={size(filter(states, ({ action }: IFSMState) => action?.type === 'pipeline'))}
                    >
                        {t('Pipeline')}
                    </FSMToolbarItem>
                    <FSMToolbarItem
                        name="state"
                        type="connector"
                        count={size(filter(states, ({ action }: IFSMState) => action?.type === 'connector'))}
                    >
                        {t('Connector')}
                    </FSMToolbarItem>
                    <FSMToolbarItem
                        name="fsm"
                        type="fsm"
                        count={size(filter(states, ({ type }: IFSMState) => type === 'fsm'))}
                    >
                        {t('FSM')}
                    </FSMToolbarItem>
                    <FSMToolbarItem
                        name="block"
                        type="block"
                        disabled={!qorus_instance}
                        count={size(filter(states, ({ type }: IFSMState) => type === 'block'))}
                    >
                        {t('Block')}
                    </FSMToolbarItem>
                    <FSMToolbarItem
                        name="if"
                        type="if"
                        count={size(filter(states, ({ type }: IFSMState) => type === 'if'))}
                    >
                        {t('If')}
                    </FSMToolbarItem>
                    <ButtonGroup style={{ float: 'right' }}>
                        <Button
                            onClick={() => {
                                currentHistoryPosition.current -= 1;
                                setStates(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
                            }}
                            disabled={currentHistoryPosition.current <= 0}
                            text={`(${currentHistoryPosition.current})`}
                            icon="undo"
                        />
                        <Button
                            onClick={() => {
                                currentHistoryPosition.current += 1;
                                setStates(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
                            }}
                            disabled={currentHistoryPosition.current === size(changeHistory.current) - 1}
                            text={`(${size(changeHistory.current) - (currentHistoryPosition.current + 1)})`}
                            icon="redo"
                        />
                        <Button
                            onClick={() =>
                                embedded ? onHideMetadataClick((cur) => !cur) : setIsMetadataHidden((cur) => !cur)
                            }
                            icon={getIsMetadataHidden() ? 'eye-open' : 'eye-off'}
                        />
                    </ButtonGroup>
                </StyledToolbarWrapper>
            )}
            <div style={{ flex: 1, overflow: 'hidden', minHeight: 100 }}>
                <StyledDiagramWrapper ref={wrapperRef} id="fsm-diagram">
                    <FSMDiagramWrapper
                        wrapperDimensions={wrapperDimensions}
                        setPan={setWrapperPan}
                        isHoldingShiftKey={isHoldingShiftKey && !selectedState}
                        zoom={zoom}
                        items={map(states, (state) => ({
                            x: state.position.x,
                            y: state.position.y,
                            type: getStateType(state),
                        }))}
                    >
                        <StyledDiagram
                            key={JSON.stringify(wrapperDimensions)}
                            ref={drop}
                            path={image_path}
                            onClick={() => setSelectedState(null)}
                            style={{
                                transform: `scale(${zoom})`,
                                marginLeft: `${calculateMargin()}px`,
                                marginTop: `${calculateMargin()}px`,
                            }}
                        >
                            {map(states, (state, id) => (
                                <FSMState
                                    key={id}
                                    {...state}
                                    id={id}
                                    selected={selectedState === id}
                                    onDblClick={handleStateClick}
                                    onClick={handleStateClick}
                                    onUpdate={updateStateData}
                                    onEditClick={handleStateEditClick}
                                    onDeleteClick={handleStateDeleteClick}
                                    selectedState={selectedState}
                                    isAvailableForTransition={isAvailableForTransition}
                                    toggleDragging={setIsHoldingShiftKey}
                                    onTransitionOrderClick={(id) => setEditingTransitionOrder(id)}
                                    onExecutionOrderClick={() => setEditingInitialOrder(true)}
                                    isIsolated={isStateIsolated(id, states)}
                                />
                            ))}
                            <svg height="100%" width="100%" style={{ position: 'absolute' }}>
                                {transitions.map(
                                    ({ x1, x2, y1, y2, state, targetState, isError, branch, transitionIndex }, index) =>
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
                                                    stroke={getTransitionColor(isError, branch)}
                                                    strokeWidth={isError ? 2 : 1}
                                                    strokeDasharray={isError ? '10 2' : undefined}
                                                    id={getTargetStatePosition(x1, y1, x2, y2)}
                                                    markerEnd={`url(#arrowhead${getTransitionEndMarker(
                                                        isError,
                                                        branch
                                                    )})`}
                                                    x1={x1 + getXDiff(states[state].type)}
                                                    y1={y1 + getYDiff(states[state].type)}
                                                    {...getTargetStatePosition(
                                                        x1,
                                                        y1,
                                                        x2,
                                                        y2,
                                                        states[state].type,
                                                        states[targetState].type
                                                    )}
                                                />
                                            </>
                                        )
                                )}
                            </svg>
                        </StyledDiagram>
                    </FSMDiagramWrapper>
                </StyledDiagramWrapper>
            </div>
            {!embedded && (
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
            )}
        </>
    );
};

export default compose(withGlobalOptionsConsumer(), withMessageHandler())(FSMView);
