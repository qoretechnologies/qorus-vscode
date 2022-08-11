import { Button, ButtonGroup, Callout, Intent, Tooltip } from '@blueprintjs/core';
import { every, some } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { useDrop, XYCoord } from 'react-dnd';
import { useDebounce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled from 'styled-components';
import Field from '../../../components/Field';
import Connectors, { IProviderType } from '../../../components/Field/connectors';
import FileString from '../../../components/Field/fileString';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import FieldLabel from '../../../components/FieldLabel';
import { ActionsWrapper, FieldInputWrapper, FieldWrapper } from '../../../components/FieldWrapper';
import Loader from '../../../components/Loader';
import Spacer from '../../../components/Spacer';
import { AppToaster } from '../../../components/Toast';
import { Messages } from '../../../constants/messages';
import { DraftsContext, IDraftData } from '../../../context/drafts';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import {
  areTypesCompatible,
  deleteDraft,
  fetchData,
  formatAndFixOptionsToKeyValuePairs,
  getDraftId,
  getStateProvider,
  getTargetFile,
  hasValue,
  isFSMStateValid,
  isStateIsolated,
  ITypeComparatorData,
} from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import withMapperConsumer from '../../../hocomponents/withMapperConsumer';
import withMessageHandler from '../../../hocomponents/withMessageHandler';
import TinyGrid from '../../../images/TinyGrid';
import FSMDiagramWrapper from './diagramWrapper';
import FSMInitialOrderDialog from './initialOrderDialog';
import FSMState from './state';
import FSMStateDialog, { TAction } from './stateDialog';
import FSMToolbarItem from './toolbarItem';
import FSMTransitionDialog, { IModifiedTransitions } from './transitionDialog';
import FSMTransitionOrderDialog from './transitionOrderDialog';

export interface IFSMViewProps {
  onSubmitSuccess: (data: any) => any;
  setFsmReset: () => void;
  embedded?: boolean;
  defaultStates?: IFSMStates;
  parentStateName?: string;
  defaultInterfaceId?: string;
  states: IFSMStates;
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
  'input-type'?: IProviderType;
  'output-type'?: IProviderType;
}

export type TFSMStateType = 'state' | 'fsm' | 'block' | 'if';

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
  type: TFSMStateType;
  desc: string;
  states?: IFSMStates;
  fsm?: string;
  id: string;
  condition?: any;
  language?: 'qore' | 'python';
  execution_order?: number;
  keyId?: string;
  disabled?: boolean;
  error?: boolean;
  injected?: boolean;
  injectedData?: {
    from: string;
    to: string;
    name?: string;
  };
}

export interface IFSMStates {
  [name: string]: IFSMState;
}

export const TOOLBAR_ITEM_TYPE = 'toolbar-item';
export const STATE_ITEM_TYPE = 'state';

const DIAGRAM_SIZE = 2000;
export const IF_STATE_SIZE = 80;
export const STATE_WIDTH = 180;
export const STATE_HEIGHT = 50;
const DIAGRAM_DRAG_KEY = 'Shift';
const DROP_ACCEPTS: string[] = [TOOLBAR_ITEM_TYPE, STATE_ITEM_TYPE];

export const StyledToolbarWrapper = styled.div`
  margin-bottom: 10px;
  margin-top: 10px;
  overflow: hidden;
`;

const StyledDiagramWrapper = styled.div`
  width: 100%;
  height: 100%;
  position: relative;
`;

const StyledDiagram = styled.div<{ path: string }>`
  width: ${DIAGRAM_SIZE}px;
  height: ${DIAGRAM_SIZE}px;
  background: ${({ path }) => `url(${TinyGrid})`};
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  box-shadow: inset 10px 10px 80px -50px red, inset -10px -10px 80px -50px red;
`;

export const StyledCompatibilityLoader = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: white;
  z-index: 2000;
  opacity: 0.6;
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
  setMapper,
  ...rest
}) => {
  const t = useContext(TextContext);
  const {
    sidebarOpen,
    path,
    image_path,
    confirmAction,
    callBackend,
    qorus_instance,
    saveDraft,
    ...init
  }: any = useContext(InitialContext);

  const fsm = rest?.fsm || init?.fsm;

  const { resetAllInterfaceData } = useContext(GlobalContext);
  const { maybeApplyDraft, draft } = useContext(DraftsContext);
  const [interfaceId, setInterfaceId] = useState(null);

  const wrapperRef = useRef(null);
  const fieldsWrapperRef = useRef(null);
  const showTransitionsToaster = useRef(0);
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
    target_dir: fsm?.target_dir || interfaceContext?.target_dir || null,
    name: fsm?.name || null,
    desc: fsm?.desc || null,
    groups: fsm?.groups || [],
    'input-type': fsm?.['input-type'] || interfaceContext?.inputType || null,
    'output-type': fsm?.['output-type'] || null,
  });
  const [selectedState, setSelectedState] = useState<string | null>(null);
  const [compatibilityChecked, setCompatibilityChecked] = useState<boolean>(false);
  const [outputCompatibility, setOutputCompatibility] = useState<
    { [key: string]: boolean } | undefined
  >(undefined);
  const [inputCompatibility, setInputCompatibility] = useState<
    { [key: string]: boolean } | undefined
  >(undefined);
  const [isReady, setIsReady] = useState<boolean>(embedded || false);
  const [editingState, setEditingState] = useState<string | null>(null);
  const [editingTransition, setEditingTransition] = useState<
    { stateId: number; index: number }[] | null
  >([]);
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
        const calculatePercDiff = (value) => value + (value / 100) * Math.abs(100 * (zoom - 1));
        x = x / zoom;
        y = y / zoom;
        x =
          x +
          calculatePercDiff(currentXPan.current) -
          (!embedded && sidebarOpen ? 333 : embedded ? 233 : 153);
        y =
          y +
          calculatePercDiff(currentYPan.current) -
          (fieldsWrapperRef.current.getBoundingClientRect().height + (embedded ? 380 : 200));

        addNewState(item, x, y);
      } else if (item.type === STATE_ITEM_TYPE) {
        moveItem(item.id, monitor.getDifferenceFromInitialOffset());
      }
    },
  });

  const addNewState = (item, x, y, onSuccess?: (stateId: string) => any) => {
    const ids: number[] = size(states) ? Object.keys(states).map((key) => parseInt(key)) : [0];
    const id = (Math.max(...ids) + 1).toString();

    setStates(
      (cur: IFSMStates): IFSMStates => ({
        ...cur,
        [id]: {
          position: {
            x,
            y,
          },
          initial: false,
          name: getStateName(item, id),
          desc: '',
          injected: item.injected,
          injectedData: item.injectedData,
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

    onSuccess?.(id);

    setEditingState(id);
  };

  const getStateName = (item, id) => {
    if (item.injected) {
      return `Map ${item.injectedData.from} to ${item.injectedData.to}`;
    }

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

  const areStatesValid = (states: IFSMStates): boolean => {
    let valid = true;

    forEach(states, (state) => {
      if (!isFSMStateValid(state)) {
        valid = false;
      }
    });

    return valid;
  };

  const isFSMValid = () => {
    if (metadata['input-type'] && !validateField('type-selector', metadata['input-type'])) {
      return false;
    }

    if (metadata['output-type'] && !validateField('type-selector', metadata['output-type'])) {
      return false;
    }

    return (
      validateField('string', metadata.target_dir) &&
      validateField('string', metadata.name) &&
      validateField('string', metadata.desc) &&
      areStatesValid(states) &&
      isTypeCompatible('input') &&
      isTypeCompatible('output') &&
      size(states)
    );
  };

  const handleMetadataChange: (name: string, value: any) => void = (name, value) => {
    console.log(name, value);
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

  const applyDraft = () => {
    maybeApplyDraft(
      'fsm',
      undefined,
      fsm,
      ({ fsmData: { metadata, states }, interfaceId }: IDraftData) => {
        setInterfaceId(interfaceId);
        setMetadata(metadata);
        setStates(states);
      },
      undefined,
      () => {
        setIsReady(true);
      }
    );
  };

  useUpdateEffect(() => {
    if (draft) {
      applyDraft();
    }
  }, [draft]);

  useMount(() => {
    if (!embedded) {
      setFsmReset(() => reset);
      // Set interface id
      setInterfaceId(fsm?.iface_id || defaultInterfaceId || shortid.generate());
      // Apply the draft with "type" as first parameter and a custom function
      applyDraft();
    } else {
      setInterfaceId(defaultInterfaceId);
    }
  });

  useDebounce(
    async () => {
      if (!embedded) {
        const draftId = getDraftId(fsm, interfaceId);
        const hasChanged = fsm
          ? some(metadata, (value, key) => {
              return !value && !fsm[key]
                ? false
                : !isEqual(value, key === 'groups' ? fsm[key] || [] : fsm[key]);
            }) || !isEqual(states, fsm.states)
          : true;

        if (
          draftId &&
          (hasValue(metadata.target_dir) ||
            hasValue(metadata.desc) ||
            hasValue(metadata.name) ||
            hasValue(metadata['input-type']) ||
            hasValue(metadata['output-type']) ||
            size(metadata.groups) ||
            size(states)) &&
          hasChanged
        ) {
          saveDraft(
            'fsm',
            draftId,
            {
              fsmData: {
                metadata,
                states,
              },
              interfaceId,
              associatedInterface: getTargetFile(fsm),
              isValid: isFSMValid(),
            },
            metadata.name
          );
        }
      }
    },
    1500,
    [metadata, states, inputCompatibility, outputCompatibility]
  );

  useEffect(() => {
    if (qorus_instance && isReady) {
      if (embedded || fsm) {
        let newStates = embedded ? states : cloneDeep(fsm?.states || {});

        (async () => {
          for await (const [stateId] of Object.entries(states)) {
            newStates = await fixIncomptibleStates(stateId, newStates);
          }

          updateHistory(newStates);
          setStates(newStates);
          setCompatibilityChecked(true);
        })();
      } else {
        setCompatibilityChecked(true);
      }

      const { width, height } = wrapperRef.current.getBoundingClientRect();

      currentXPan.current = 0;
      currentYPan.current = 0;

      setWrapperDimensions({ width, height });

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      if (!embedded) {
        setFsmReset(null);
      }
    };
  }, [qorus_instance, isReady]);

  useEffect(() => {
    if (states && onStatesChange) {
      onStatesChange(states);
    }
  }, [states]);

  useDebounce(
    () => {
      areFinalStatesCompatibleWithOutputType();
      areFinalStatesCompatibleWithInputType();
    },
    1000,
    [metadata?.['input-type'], metadata?.['output-type'], states]
  );

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

  // This function gets all the states that do not have any transitions out of them
  const getEndStates = (): IFSMState[] => {
    return filter(states, (state: IFSMState) => {
      return !size(state.transitions);
    });
  };

  const getStartStates = (): IFSMState[] => {
    return filter(states, (state: IFSMState) => {
      return !!state.initial;
    });
  };

  const getStateDataForComparison = (
    state: IFSMState,
    providerType: 'input' | 'output'
  ): ITypeComparatorData | null => {
    if (state.action) {
      const { type, value } = state.action;

      const obj = {
        interfaceName: type === 'connector' ? value.class : value,
        interfaceKind: type,
        connectorName: type === 'connector' ? value.connector : undefined,
        typeData: state[`${providerType}-type`] || state['input-output-type'],
      };

      if (!obj.typeData) {
        delete obj.typeData;
      }

      return obj;
    }

    if (!state[`${providerType}-type`] && !state['input-output-type']) {
      return null;
    }

    return {
      typeData: state[`${providerType}-type`] || state['input-output-type'],
    };
  };

  const isTypeCompatible = (position: 'input' | 'output') => {
    if (position === 'input' && !inputCompatibility) {
      return true;
    }

    if (position === 'output' && !outputCompatibility) {
      return true;
    }

    const isCompatible = every(
      position === 'input' ? inputCompatibility : outputCompatibility,
      (result) => {
        return result === true;
      }
    );

    return isCompatible;
  };

  const areFinalStatesCompatibleWithOutputType = async () => {
    setCompatibilityChecked(false);
    setOutputCompatibility(undefined);

    const endStates = getEndStates();

    if (!endStates.length) {
      setOutputCompatibility(undefined);
      setCompatibilityChecked(true);
      return;
    }

    const outputType: IProviderType | undefined = cloneDeep(metadata['output-type']);

    if (!outputType) {
      setOutputCompatibility(undefined);
      setCompatibilityChecked(true);
      return;
    }

    outputType.options = await formatAndFixOptionsToKeyValuePairs(outputType.options);

    const compareHash = {};

    for await (const state of endStates) {
      const stateData = getStateDataForComparison(state, 'output');
      if (!stateData) {
        continue;
      }

      const output = await getStateProvider(stateData, 'output');
      if (!output) {
        continue;
      }

      output.options = await formatAndFixOptionsToKeyValuePairs(output.options);

      compareHash[state.id] = {
        type: output,
        base_type: outputType,
      };
    }

    const comparison = await fetchData('/dataprovider/compareManyTypes', 'PUT', {
      types: compareHash,
    });

    setCompatibilityChecked(true);
    setOutputCompatibility(comparison.data);
  };

  const areFinalStatesCompatibleWithInputType = async () => {
    setCompatibilityChecked(false);
    setInputCompatibility(undefined);

    const startStates = getStartStates();

    if (!startStates.length) {
      setInputCompatibility(undefined);
      setCompatibilityChecked(true);
      return;
    }

    const inputType: IProviderType | undefined = cloneDeep(metadata['input-type']);

    if (!inputType) {
      setInputCompatibility(undefined);
      setCompatibilityChecked(true);
      return;
    }

    // Format and fix the options
    inputType.options = await formatAndFixOptionsToKeyValuePairs(inputType.options);

    const compareHash = {};

    for await (const state of startStates) {
      const stateData = getStateDataForComparison(state, 'input');

      if (!stateData) {
        continue;
      }

      const input: IProviderType = await getStateProvider(stateData, 'input');

      if (!input) {
        continue;
      }

      input.options = await formatAndFixOptionsToKeyValuePairs(input.options);

      compareHash[state.id] = {
        type: inputType,
        base_type: input,
      };
    }

    const comparison = await fetchData('/dataprovider/compareManyTypes', 'PUT', {
      types: compareHash,
    });

    setCompatibilityChecked(true);
    setInputCompatibility(comparison.data);
  };

  const areStatesCompatible = async (
    stateId: string,
    targetId: string,
    localStates: IFSMStates = states
  ): Promise<boolean> => {
    const outputState = localStates[stateId];
    const inputState = localStates[targetId];

    const compatible = await areTypesCompatible(
      getStateDataForComparison(outputState, 'output'),
      getStateDataForComparison(inputState, 'input')
    );

    return compatible;
  };

  const isAvailableForTransition = async (stateId: string, targetId: string): Promise<boolean> => {
    if (getTransitionByState(stateId, targetId)) {
      return false;
    }

    return await areStatesCompatible(stateId, targetId);
  };

  const handleStateClick = async (id: string) => {
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

      // Check if the states are compatible
      const isCompatible = await areStatesCompatible(selectedState, id);

      if (!isCompatible) {
        setSelectedState(null);

        const outputType = await getStateProvider(
          getStateDataForComparison(states[id], 'input'),
          'input'
        );
        const inputType = await getStateProvider(
          getStateDataForComparison(states[selectedState], 'output'),
          'output'
        );
        setMapper({
          hasInitialInput: true,
          hasInitialOutput: true,
          mapper_options: {
            'mapper-input': inputType,
            'mapper-output': outputType,
          },
        });

        addNewState(
          {
            name: 'state',
            type: 'toolbar-item',
            stateType: 'mapper',
            injected: true,
            injectedData: {
              from: states[selectedState].name,
              to: states[id].name,
              name: metadata.name,
            },
          },
          (states[selectedState].position.x + states[id].position.x) / 2,
          (states[selectedState].position.y + states[id].position.y) / 2,
          // Add both transition immediately when the state is added
          // to the diagram
          (stateId: string) => {
            setStates((cur) => {
              const newBoxes = { ...cur };

              newBoxes[selectedState].transitions = [
                ...(newBoxes[selectedState].transitions || []),
                {
                  state: stateId.toString(),
                  language: 'qore',
                },
              ];

              newBoxes[stateId].transitions = [
                ...(newBoxes[stateId].transitions || []),
                {
                  state: id.toString(),
                  language: 'qore',
                },
              ];

              updateHistory(newBoxes);

              return newBoxes;
            });
          }
        );

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

  const fixIncomptibleStates = async (
    id: string,
    localStates: IFSMStates,
    onFinish?: () => any
  ) => {
    const newStates = { ...localStates };

    for await (const [stateId, state] of Object.entries(newStates)) {
      if (
        !state.transitions ||
        size(state.transitions) === 0 ||
        !state.transitions.find((transitions) => transitions.state === id)
      ) {
        Promise.resolve();
      } else {
        // Check if this state is compatible with the modified state
        const isCompatible = await areStatesCompatible(stateId, id, newStates);
        // Is compatible no change needed
        if (!isCompatible) {
          showTransitionsToaster.current += 1;
          // Filter out any transitions
          newStates[stateId].transitions = state.transitions.filter(
            (transition) => transition.state !== id
          );
        }
      }

      // Set states without action
      if (!isFSMStateValid(state)) {
        newStates[stateId].error = true;
      }
    }

    if (onFinish) {
      onFinish();
    }

    return newStates;
  };

  const updateStateData = async (id: string, data: IFSMState) => {
    let fixedStates: IFSMStates = { ...states };

    fixedStates[id] = {
      ...fixedStates[id],
      ...data,
    };

    if (data.type !== states[id].type || !isEqual(data.action, states[id].action)) {
      if (size(fixedStates[id].transitions)) {
        const newTransitions = [];

        for await (const transition of fixedStates[id].transitions) {
          const isCompatible = await areStatesCompatible(id, transition.state, fixedStates);

          if (isCompatible) {
            newTransitions.push(transition);
          } else {
            showTransitionsToaster.current += 1;
          }
        }

        fixedStates[id].transitions = newTransitions;
      }

      // Check if transitions are null and remove them
      if (size(fixedStates[id].transitions) === 0) {
        delete fixedStates[id].transitions;
      }

      fixedStates = await fixIncomptibleStates(id, fixedStates);
    }

    updateHistory(fixedStates);
    setStates(fixedStates);
    setEditingState(null);
  };

  const updateMultipleTransitionData = async (newData: IModifiedTransitions) => {
    let fixedStates: IFSMStates = { ...states };

    for await (const [id, transitionData] of Object.entries(newData)) {
      const [stateId, index] = id.split(':');
      const anotherTransitionData = transitionData?.data;
      const remove = !transitionData;

      let transitionsCopy = [...(states[stateId].transitions || [])];

      if (remove) {
        delete transitionsCopy[index];
      } else {
        transitionsCopy[index] = {
          ...transitionsCopy[index],
          ...anotherTransitionData,
        };
      }

      transitionsCopy = transitionsCopy.filter((t) => t);

      // @ts-expect-error
      const data: IFSMState = { transitions: transitionsCopy };

      fixedStates[stateId] = {
        ...fixedStates[stateId],
        ...data,
      };

      // Remove the transitions if they are empty
      if (size(fixedStates[stateId].transitions) === 0) {
        delete fixedStates[stateId].transitions;
      }

      if (data?.type !== states[stateId].type || !isEqual(data.action, states[stateId].action)) {
        if (size(fixedStates[stateId].transitions)) {
          const newTransitions = [];

          for await (const transition of fixedStates[stateId].transitions) {
            const isCompatible = await areStatesCompatible(stateId, transition.state, fixedStates);

            if (isCompatible) {
              newTransitions.push(transition);
            } else {
              showTransitionsToaster.current += 1;
            }
          }

          fixedStates[stateId].transitions = newTransitions;
        }

        fixedStates = await fixIncomptibleStates(stateId, fixedStates);
      }
    }

    updateHistory(fixedStates);
    setStates(fixedStates);
    setEditingState(null);
  };

  const updateTransitionData = async (
    stateId: number,
    index: number,
    data: IFSMTransition,
    remove?: boolean
  ) => {
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

    await updateStateData(stateId, { transitions: transitionsCopy });
  };

  const handleStateEditClick = (id: string): void => {
    setEditingState(id);
  };

  const handleSubmitClick = async () => {
    const fixedMetadata = { ...metadata };

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

      const fileName = getDraftId(fsm, interfaceId);
      deleteDraft('fsm', fileName, false);
      reset();
      resetAllInterfaceData('fsm');
    }
  };

  const hasBothWayTransition = (
    stateId: string,
    targetId: string
  ): { stateId: string; index: number } | null => {
    const transitionIndex = states[targetId].transitions?.findIndex(
      (transition) => transition.state === stateId
    );

    if (transitionIndex && transitionIndex >= 0) {
      return { stateId: targetId, index: transitionIndex };
    }

    return null;
  };

  const handleToolbarItemDblClick = (name, type, stateType) => {
    addNewState(
      {
        name,
        type,
        stateType,
      },
      100,
      size(states) * 100 + 100
    );
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

      const stateTransitions = state.transitions.map(
        (transition: IFSMTransition, index: number) => ({
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
        })
      );

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
      'input-type': fsm?.['input-type'],
      'output-type': fsm?.['output-type'],
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
  const getIsMetadataHidden = () => {
    return embedded ? isExternalMetadataHidden : isMetadataHidden;
  };

  if (!qorus_instance) {
    return (
      <Callout title={t('NoInstanceTitle')} icon="warning-sign" intent="warning">
        {t('NoInstance')}
      </Callout>
    );
  }

  if (!isReady) {
    return (
      <Callout title={t('Loading')} icon="info-sign" intent="warning">
        {t('Loading FSM...')}
      </Callout>
    );
  }

  if (showTransitionsToaster.current) {
    AppToaster.show({
      message: `${showTransitionsToaster.current} ${t('IncompatibleTransitionsRemoved')}`,
      intent: 'warning',
    });
    showTransitionsToaster.current = 0;
  }

  return (
    <>
      {!compatibilityChecked && (
        <StyledCompatibilityLoader>
          <Loader text={t('CheckingCompatibility')} />
        </StyledCompatibilityLoader>
      )}
      <div
        ref={fieldsWrapperRef}
        id="fsm-fields-wrapper"
        style={{
          maxHeight: !isMetadataHidden ? '50%' : undefined,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
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
                  metadata.groups.length === 0
                    ? true
                    : validateField('select-array', metadata.groups)
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
            <FieldWrapper name="selected-field">
              <FieldLabel
                isValid={
                  !metadata['input-type']
                    ? true
                    : validateField('type-selector', metadata['input-type']) &&
                      isTypeCompatible('input')
                }
                info={t('Optional')}
                label={t('InputType')}
              />
              <FieldInputWrapper>
                {!isTypeCompatible('input') && (
                  <>
                    <Callout intent="danger">{t('FSMInputTypeError')}</Callout>
                    <Spacer size={20} />
                  </>
                )}
                <Connectors
                  inline
                  minimal
                  value={metadata['input-type']}
                  onChange={(n, v) => handleMetadataChange(n, v)}
                  name="input-type"
                  isInitialEditing={fsm?.['input-type']}
                />
              </FieldInputWrapper>
            </FieldWrapper>
            <FieldWrapper name="selected-field">
              <FieldLabel
                isValid={
                  !metadata['output-type']
                    ? true
                    : validateField('type-selector', metadata['output-type']) &&
                      isTypeCompatible('output')
                }
                info={t('Optional')}
                label={t('OutputType')}
              />
              <FieldInputWrapper>
                {!isTypeCompatible('output') && (
                  <>
                    <Callout intent="danger">{t('FSMOutputTypeError')}</Callout>
                    <Spacer size={20} />
                  </>
                )}
                <Connectors
                  inline
                  minimal
                  value={metadata['output-type']}
                  onChange={(n, v) => handleMetadataChange(n, v)}
                  name="output-type"
                  isInitialEditing={fsm?.['output-type']}
                />
              </FieldInputWrapper>
            </FieldWrapper>
          </>
        )}
      </div>
      {editingState && (
        <FSMStateDialog
          fsmName={metadata.name}
          target_dir={metadata.target_dir}
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
          onSubmit={async (newData) => {
            await updateMultipleTransitionData(newData);
          }}
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
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('Mapper')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="pipeline"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'pipeline'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('Pipeline')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="connector"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'connector'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('Connector')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="fsm"
            type="fsm"
            count={size(filter(states, ({ type }: IFSMState) => type === 'fsm'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('FSM')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="block"
            type="block"
            disabled={!qorus_instance}
            count={size(filter(states, ({ type }: IFSMState) => type === 'block'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('Block')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="if"
            type="if"
            count={size(filter(states, ({ type }: IFSMState) => type === 'if'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('If')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="apicall"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'apicall'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-apicall')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="search-single"
            count={size(
              filter(states, ({ action }: IFSMState) => action?.type === 'search-single')
            )}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-search-single')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="search"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'search'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-search')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="update"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'update'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-update')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="create"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'create'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-create')}
          </FSMToolbarItem>
          <FSMToolbarItem
            name="state"
            type="delete"
            count={size(filter(states, ({ action }: IFSMState) => action?.type === 'delete'))}
            onDoubleClick={handleToolbarItemDblClick}
          >
            {t('field-label-delete')}
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
              name="fsm-undo-button"
            />
            <Button
              onClick={() => {
                currentHistoryPosition.current += 1;
                setStates(JSON.parse(changeHistory.current[currentHistoryPosition.current]));
              }}
              disabled={currentHistoryPosition.current === size(changeHistory.current) - 1}
              text={`(${size(changeHistory.current) - (currentHistoryPosition.current + 1)})`}
              icon="redo"
              name="fsm-redo-button"
            />
            <Button
              onClick={() =>
                embedded ? onHideMetadataClick((cur) => !cur) : setIsMetadataHidden((cur) => !cur)
              }
              icon={getIsMetadataHidden() ? 'eye-open' : 'eye-off'}
              name="fsm-hide-metadata-button"
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
              name="fsm-drop-zone"
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
                  (
                    { x1, x2, y1, y2, state, targetState, isError, branch, transitionIndex },
                    index
                  ) =>
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
                          name={`fsm-transition${isError ? '-error' : branch ? `-${branch}` : ''}`}
                          stroke={getTransitionColor(isError, branch)}
                          strokeWidth={isError ? 2 : 1}
                          strokeDasharray={isError ? '10 2' : undefined}
                          markerEnd={`url(#arrowhead${getTransitionEndMarker(isError, branch)})`}
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
                name="fsm-submit"
                icon="tick"
                intent={Intent.SUCCESS}
              />
            </ButtonGroup>
          </div>
        </ActionsWrapper>
      )}
    </>
  );
};

export default compose(
  withGlobalOptionsConsumer(),
  withMessageHandler(),
  withMapperConsumer()
)(FSMView);
