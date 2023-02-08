import {
  ReqoreDrawer,
  ReqoreHorizontalSpacer,
  ReqoreMenu,
  ReqoreMenuDivider,
  ReqoreMessage,
  ReqoreTabs,
  ReqoreTabsContent,
  ReqoreThemeContext,
  ReqoreVerticalSpacer,
  useReqore,
} from '@qoretechnologies/reqore';
import { every, some } from 'lodash';
import cloneDeep from 'lodash/cloneDeep';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';
import maxBy from 'lodash/maxBy';
import reduce from 'lodash/reduce';
import size from 'lodash/size';
import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { XYCoord, useDrop } from 'react-dnd';
import { useDebounce, useUpdateEffect } from 'react-use';
import useMount from 'react-use/lib/useMount';
import compose from 'recompose/compose';
import shortid from 'shortid';
import styled, { css, keyframes } from 'styled-components';
import Content from '../../../components/Content';
import Field from '../../../components/Field';
import Connectors, { IProviderType } from '../../../components/Field/connectors';
import FileString from '../../../components/Field/fileString';
import {
  NegativeColorEffect,
  PositiveColorEffect,
  SaveColorEffect,
} from '../../../components/Field/multiPair';
import MultiSelect from '../../../components/Field/multiSelect';
import String from '../../../components/Field/string';
import FieldGroup from '../../../components/FieldGroup';
import { ContentWrapper, FieldWrapper } from '../../../components/FieldWrapper';
import { InputOutputType } from '../../../components/InputOutputType';
import Loader from '../../../components/Loader';
import { Messages } from '../../../constants/messages';
import { DraftsContext, IDraftData } from '../../../context/drafts';
import { GlobalContext } from '../../../context/global';
import { InitialContext } from '../../../context/init';
import { TextContext } from '../../../context/text';
import { getStateBoundingRect } from '../../../helpers/diagram';
import {
  ITypeComparatorData,
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
} from '../../../helpers/functions';
import { validateField } from '../../../helpers/validations';
import withGlobalOptionsConsumer from '../../../hocomponents/withGlobalOptionsConsumer';
import withMapperConsumer from '../../../hocomponents/withMapperConsumer';
import withMessageHandler from '../../../hocomponents/withMessageHandler';
import TinyGrid from '../../../images/graphy-dark.png';
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

const DIAGRAM_SIZE = 4000;
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
  border-radius: 10px;
  overflow: hidden;
`;

const StyledDiagram = styled.div<{ path: string }>`
  width: ${DIAGRAM_SIZE}px;
  height: ${DIAGRAM_SIZE}px;
  background: ${({ bgColor }) => `${bgColor} url(${TinyGrid})`};

  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const StyledCompatibilityLoader = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background: #00000030;
  z-index: 2000;
`;

const StyledFSMLineAnimation = keyframes`
  to {
    stroke-dashoffset: 0;
  }
`;

const StyledFSMLine = styled.path`
  cursor: pointer;
  fill: none;
  filter: drop-shadow(0 0 2px #000000);
  transition: all 0.2s linear;
  stroke-dashoffset: 1000;

  &:hover {
    stroke-width: 6;
  }

  ${({ deselected }) =>
    deselected &&
    css`
      opacity: 0.2;
    `}

  ${({ selected }) =>
    selected &&
    css`
      opacity: 1;
      stroke-dasharray: 7;
      animation: ${StyledFSMLineAnimation} 10s linear infinite;
    `}
`;

const StyledLineText = styled.text`
  ${({ deselected }) =>
    deselected &&
    css`
      opacity: 0.2;
    `}
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
  embedded = false,
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
  const { addNotification } = useReqore();
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
  const [activeState, setActiveState] = useState<string | number>(undefined);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [showStateIds, setShowStateIds] = useState<boolean>(false);

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
  const [editingInitialOrder, setEditingInitialOrder] = useState<boolean>(false);
  const [wrapperDimensions, setWrapperDimensions] = useState<{ width: number; height: number }>({
    width: 0,
    height: 0,
  });
  const [isMetadataHidden, setIsMetadataHidden] = useState<boolean>(embedded);
  const [zoom, setZoom] = useState<number>(1);
  const theme = useContext(ReqoreThemeContext);

  const targetStatesTransitionIndexes = useRef<
    Record<string | number, Record<'left' | 'right' | 'top' | 'bottom', number>>
  >({});
  const statesTransitionIndexes = useRef<
    Record<string | number, Record<'left' | 'right' | 'top' | 'bottom', number>>
  >({});
  const transitionIndexes = useRef<
    Record<string | number, Record<'left' | 'right' | 'top' | 'bottom', number>>
  >({});

  const [, drop] = useDrop({
    accept: DROP_ACCEPTS,
    drop: (item: IDraggableItem, monitor) => {
      if (item.type === TOOLBAR_ITEM_TYPE) {
        const diagram = document.getElementById('fsm-diagram')!.getBoundingClientRect();

        let { x, y } = monitor.getClientOffset();
        const calculatePercDiff = (value) => value + (value / 100) * Math.abs(100 * (zoom - 1));
        x = x / zoom;
        y = y / zoom;
        x = x - diagram.left + calculatePercDiff(currentXPan.current);
        y = y - diagram.top + calculatePercDiff(currentYPan.current);

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
          isNew: true,
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

    setActiveState(undefined);
    setEditingState(undefined);
    setEditingTransitionOrder(undefined);
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
    return STATE_WIDTH / 2;
  };

  const getYDiff = (type) => {
    return STATE_HEIGHT / 2;
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
    if (qorus_instance && isReady && isMetadataHidden) {
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
    }
  }, [qorus_instance, isReady, isMetadataHidden]);

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

  const setWrapperPan = (x, y) => {
    currentXPan.current = x;
    currentYPan.current = y;
  };

  const getTransitionByState = (stateId: string, targetId: string): IFSMTransition | null => {
    const { transitions } = states[stateId];

    return transitions?.find((transition) => transition.state === targetId);
  };

  const getTransitionsCountForTargetState = (targetId: string): number => {
    return Object.values(states).reduce((acc, state) => {
      const { transitions } = state;

      if (transitions) {
        return transitions.find((transition) => transition.state === targetId) ? acc + 1 : acc;
      }

      return acc;
    }, 0);
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

  const getStateDisplayName = (id: string): string => {
    const state = states[id];

    return state.name;
  };

  const getStateDataForComparison = (
    state: IFSMState,
    providerType: 'input' | 'output'
  ): ITypeComparatorData | null => {
    if (state.action) {
      if (!state.action.value) {
        return null;
      }

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

    // Delete `isNew` from the fixed state
    delete fixedStates[id].isNew;

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

  const hasTransitionToItself = (stateId: string): boolean => {
    return !!states[stateId].transitions?.find((transition) =>
      isTransitionToSelf(stateId, transition.state)
    );
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

  const getTargetStateLocation = ({
    x1,
    y1,
    x2,
    y2,
    startStateId,
    endStateId,
  }): 'left' | 'right' | 'bottom' | 'top' => {
    const modifiedX1 = x1 + 10000;
    const modifiedX2 = x2 + 10000;
    const modifiedY1 = y1 + 10000;
    const modifiedY2 = y2 + 10000;

    const startStateData = getStateBoundingRect(startStateId);
    const endStateData = getStateBoundingRect(endStateId);
    const endOfStartState = x1 + startStateData.width;
    const endOfEndState = x2 + endStateData.width;

    if (!startStateData || !endStateData) {
      return 'left';
    }

    const sides = [];
    const horizontal = modifiedX1 - modifiedX2;
    const vertical = modifiedY1 - modifiedY2;

    if (
      (x1 > x2 && x1 < endOfEndState) ||
      (endOfStartState > x2 && endOfStartState < endOfEndState)
    ) {
      if (y1 > y2) {
        sides.push({ side: 'top', value: Math.abs(vertical) });
      } else {
        sides.push({ side: 'bottom', value: Math.abs(vertical) });
      }
    } else {
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
    }

    const { side } = maxBy(sides, 'value');

    return side;
  };

  const getTransitionPath = (
    { x1, y1, x2, y2, startStateId, endStateId, side },
    startIndex,
    endIndex,
    startStateCountPerSide,
    endStateCountPerSide
  ): string => {
    const startStateData = getStateBoundingRect(startStateId);
    const endStateData = getStateBoundingRect(endStateId);
    const linesGap = (startStateData.height * 0.9) / startStateCountPerSide;
    const endLinesGap = (endStateData.height * 0.9) / endStateCountPerSide;

    let path = '';
    const startStateCenter = {
      x: x1 + startStateData.width / 2,
      y: y1 + startStateData.height / 2,
    };
    const endStateCenter = {
      x: x2 + endStateData.width / 2,
      y: y2 + endStateData.height / 2,
    };
    const startEndVerticalDifference = Math.abs(y1 - y2);

    // If we are going to the bottom
    if (side === 'bottom') {
      path = `M ${startStateCenter.x - linesGap * startIndex} ${
        startStateCenter.y + startStateData.height / 2
      } V ${startStateCenter.y + startEndVerticalDifference / 2 + 10 * startIndex}
      H ${endStateCenter.x - endLinesGap * endIndex}
      V ${endStateCenter.y - endStateData.height / 2}`;
    }

    if (side === 'top') {
      path = `M ${startStateCenter.x - linesGap * startIndex} ${
        startStateCenter.y - startStateData.height / 2
      } V ${startStateCenter.y - startEndVerticalDifference / 2 - 10 * startIndex} H ${
        endStateCenter.x - endLinesGap * endIndex
      } V ${endStateCenter.y + endStateData.height / 2}`;
    }

    if (side === 'left') {
      const horizontalDiff = x1 - (x2 + endStateData.width);

      path = `M ${startStateCenter.x - startStateData.width / 2} ${
        startStateCenter.y - linesGap * startIndex
      } H ${x2 + endStateData.width + horizontalDiff / 2 - 10 * startIndex} V ${
        endStateCenter.y - endLinesGap * endIndex
      } H ${endStateCenter.x + endStateData.width / 2}`;
    }

    if (side === 'right') {
      const endOfStartState = x1 + startStateData.width;
      const horizontalDiff = x2 - endOfStartState;

      path = `M ${endOfStartState} ${startStateCenter.y - linesGap * startIndex} H ${
        endOfStartState + horizontalDiff / 2 + 10 * startIndex
      } V ${endStateCenter.y - endLinesGap * endIndex} H ${x2}`;
    }

    return path;
  };

  // Turn 1 2 3 4 5 into -1 -2 0 1 2
  const getTransitionIndex = (index: number, length: number): number => {
    // Create the array of length and fill it with numbers from 1 to length
    const indexes = Array.from(Array(length).keys()).map((i) => i + 1);
    const list = indexes.map((i) => i - 1 - (length - 1) / 2);

    return list[index - 1];
  };

  const mirrorSide = (side) => {
    switch (side) {
      case 'top':
        return 'bottom';
      case 'bottom':
        return 'top';
      case 'left':
        return 'right';
      case 'right':
        return 'left';
      default:
        return side;
    }
  };

  const transitions = useMemo(() => {
    transitionIndexes.current = {};
    statesTransitionIndexes.current = {};
    targetStatesTransitionIndexes.current = {};

    return reduce(
      states,
      (newTransitions: any[], state: IFSMState, id: string) => {
        if (!state.transitions) {
          return newTransitions;
        }

        const stateTransitions = state.transitions.map(
          (transition: IFSMTransition, index: number) => {
            const transitionData: any = {
              isError: !!transition.errors,
              transitionIndex: index,
              state: id,
              targetState: transition.state,
              startStateId: id,
              endStateId: transition.state,
              x1: state.position.x,
              y1: state.position.y,
              x2: states[transition.state].position.x,
              y2: states[transition.state].position.y,
              order: !!transition.errors ? 0 : 1,
              branch: transition.branch,
            };

            // Get the transition line path and the locaiton of the target state
            const side = getTargetStateLocation(transitionData);

            if (!targetStatesTransitionIndexes.current[transition.state]) {
              targetStatesTransitionIndexes.current[transition.state] = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              };
            }
            targetStatesTransitionIndexes.current[transition.state][mirrorSide(side)] += 1;

            if (!statesTransitionIndexes.current[id]) {
              statesTransitionIndexes.current[id] = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              };
            }

            statesTransitionIndexes.current[id][side] += 1;

            if (!transitionIndexes.current[id]) {
              transitionIndexes.current[id] = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              };
            }
            transitionIndexes.current[id][side] += 1;

            if (!transitionIndexes.current[transition.state]) {
              transitionIndexes.current[transition.state] = {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0,
              };
            }

            transitionIndexes.current[transition.state][mirrorSide(side)] += 1;

            transitionData.transitionIndexPerStateSide = statesTransitionIndexes.current[id][side];
            transitionData.transitionIndexPerTargetStateSide =
              targetStatesTransitionIndexes.current[transition.state][mirrorSide(side)];
            transitionData.transitionIndexPerSide = transitionIndexes.current[id][side];
            transitionData.transitionEndIndexPerSide =
              transitionIndexes.current[transition.state][mirrorSide(side)];

            return {
              ...transitionData,
              side,
              endSide: mirrorSide(side),
            };
          }
        );

        return [...newTransitions, ...stateTransitions];
      },
      []
    ).sort((a, b) => a.order - b.order);
  }, [states]);

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

    return '#068df5';
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

  const calculateMargin = () => (zoom - 1) * 1000;
  const getIsMetadataHidden = () => {
    return isMetadataHidden;
  };

  if (!qorus_instance) {
    return (
      <ReqoreMessage title={t('NoInstanceTitle')} intent="warning">
        {t('NoInstance')}
      </ReqoreMessage>
    );
  }

  if (!isReady) {
    return (
      <ReqoreMessage title={t('Loading')} intent="pending">
        {t('Loading FSM...')}
      </ReqoreMessage>
    );
  }

  if (showTransitionsToaster.current) {
    addNotification({
      content: `${showTransitionsToaster.current} ${t('IncompatibleTransitionsRemoved')}`,
      intent: 'warning',
    });
    showTransitionsToaster.current = 0;
  }

  function calculateTextRotation(side: any) {
    switch (side) {
      case 'top':
        return 90;
      case 'bottom':
        return 270;
      case 'left':
        return 180;
      case 'right':
        return 0;
      default:
        return 0;
    }
  }

  function calculateTextTranslation(side: any) {
    switch (side) {
      case 'top':
        return 5;
      case 'bottom':
        return -15;
      case 'left':
        return 20;
      case 'right':
        return -5;
      default:
        return 0;
    }
  }

  const handleDragStart = () => {
    setActiveState(undefined);
    setEditingState(undefined);
    setEditingTransitionOrder(undefined);
  };

  const renderStateDetail = () => {
    const state = activeState || editingState || editingTransitionOrder;

    if (!state || !states[state]) {
      return null;
    }

    const stateData = states[state];

    return (
      <ReqoreDrawer
        position="right"
        isOpen
        label={stateData.name}
        hidable
        flat={false}
        floating
        hasBackdrop={false}
        onClose={() => {
          setActiveState(undefined);
          setEditingState(undefined);
          setEditingTransitionOrder(undefined);
        }}
        contentStyle={{
          display: 'flex',
          flexFlow: 'column',
          overflow: 'hidden',
        }}
        size="40vw"
        actions={[
          {
            label: t('Delete state'),
            effect: NegativeColorEffect,
            icon: 'DeleteBinLine',
            onClick: () => {
              handleStateDeleteClick(state);
            },
          },
        ]}
      >
        <FSMState
          {...states[state]}
          isStatic
          id={state}
          onUpdate={updateStateData}
          onMouseEnter={() => setHoveredState(state)}
          onMouseLeave={() => setHoveredState(null)}
          hasTransitionToItself={hasTransitionToItself(state)}
          isAvailableForTransition={isAvailableForTransition}
          onTransitionOrderClick={(id) => setEditingTransitionOrder(id)}
          onExecutionOrderClick={() => setEditingInitialOrder(true)}
          isIsolated={isStateIsolated(state, states)}
        />
        <ReqoreVerticalSpacer height={10} />
        <ReqoreTabs
          fill
          fillParent
          tabs={[
            { label: 'Configuration', id: 'configuration', icon: 'SettingsLine' },
            { label: 'Types', id: 'info', icon: 'InformationLine', disabled: stateData.isNew },
            {
              label: 'Transitions',
              id: 'transitions',
              icon: 'LinksLine',
              badge: size(stateData.transitions),
              disabled: stateData.isNew,
            },
          ]}
          activeTab={editingTransitionOrder ? 'transitions' : 'configuration'}
          tabsPadding="vertical"
          padded={false}
          activeTabIntent="info"
          style={{ overflow: 'hidden' }}
        >
          <ReqoreTabsContent tabId="info">
            <InputOutputType
              inputProvider={getStateDataForComparison(states[state], 'input')}
              outputProvider={getStateDataForComparison(states[state], 'output')}
            />
          </ReqoreTabsContent>

          <ReqoreTabsContent tabId="configuration">
            <FSMStateDialog
              key={state}
              fsmName={metadata.name}
              target_dir={metadata.target_dir}
              onSubmit={(id, data) => {
                updateStateData(id, data);
                setActiveState(undefined);
                setEditingState(undefined);
                setEditingTransitionOrder(undefined);
              }}
              onClose={() => setEditingState(null)}
              data={states[state]}
              id={state}
              deleteState={handleStateDeleteClick}
              interfaceId={interfaceId}
              otherStates={reduce(
                states,
                (newStates, localState, id) =>
                  id === state ? { ...newStates } : { ...newStates, [id]: localState },
                {}
              )}
            />
          </ReqoreTabsContent>
          <ReqoreTabsContent tabId="transitions">
            <FSMTransitionOrderDialog
              transitions={states[state].transitions}
              id={state}
              onClose={() => setEditingTransitionOrder(null)}
              getStateData={(id) => states[id]}
              onSubmit={updateStateData}
              states={states}
            />
          </ReqoreTabsContent>
        </ReqoreTabs>
      </ReqoreDrawer>
    );
  };

  return (
    <>
      {!compatibilityChecked && (
        <StyledCompatibilityLoader>
          <Loader text={t('CheckingCompatibility')} />
        </StyledCompatibilityLoader>
      )}

      {renderStateDetail()}

      <Content
        title={
          embedded
            ? undefined
            : getIsMetadataHidden()
            ? t('CreateFlowDiagram')
            : t('DescribeYourFSM')
        }
        bottomActions={
          !embedded
            ? [
                {
                  label: t('Reset'),
                  icon: 'HistoryLine',
                  onClick: () => {
                    confirmAction(
                      'ResetFieldsConfirm',
                      () => {
                        reset();
                      },
                      'Reset',
                      'warning'
                    );
                  },
                },
                {
                  label: t('Back'),
                  onClick: () => {
                    embedded
                      ? onHideMetadataClick((cur) => !cur)
                      : setIsMetadataHidden((cur) => !cur);
                  },
                  icon: 'ArrowLeftLine',
                  show: getIsMetadataHidden(),
                },
                {
                  label: t('Submit'),
                  onClick: handleSubmitClick,
                  disabled: !isFSMValid(),
                  icon: 'CheckLine',
                  effect: SaveColorEffect,
                  position: 'right',
                  show: getIsMetadataHidden(),
                },
                {
                  label: t('Go to flow builder'),
                  onClick: () => {
                    embedded
                      ? onHideMetadataClick((cur) => !cur)
                      : setIsMetadataHidden((cur) => !cur);
                  },
                  icon: 'ArrowRightLine',
                  effect: PositiveColorEffect,
                  position: 'right',
                  show: !getIsMetadataHidden(),
                },
              ]
            : undefined
        }
      >
        <ContentWrapper
          style={{
            display: isMetadataHidden ? 'none' : undefined,
          }}
        >
          {!isMetadataHidden && !embedded ? (
            <>
              <FieldWrapper
                name="selected-field"
                label={t('field-label-target_dir')}
                isValid={validateField('file-string', metadata.target_dir)}
              >
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
              </FieldWrapper>
              <FieldGroup
                label={t('Info')}
                isValid={
                  validateField('string', metadata.name) && validateField('string', metadata.desc)
                }
              >
                <FieldWrapper
                  compact
                  name="selected-field"
                  isValid={validateField('string', metadata.name)}
                  label={t('field-label-name')}
                >
                  <String onChange={handleMetadataChange} value={metadata.name} name="name" />
                </FieldWrapper>
                <FieldWrapper
                  compact
                  name="selected-field"
                  isValid={validateField('string', metadata.desc)}
                  label={t('field-label-desc')}
                >
                  <Field
                    type="long-string"
                    onChange={handleMetadataChange}
                    value={metadata.desc}
                    name="desc"
                    markdown
                  />
                </FieldWrapper>
              </FieldGroup>
              <FieldWrapper
                name="selected-field"
                isValid={
                  metadata.groups.length === 0
                    ? true
                    : validateField('select-array', metadata.groups)
                }
                detail={t('Optional')}
                label={t('field-label-groups')}
              >
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
              </FieldWrapper>
              <FieldGroup
                label={t('Types')}
                isValid={
                  (!metadata['input-type']
                    ? true
                    : validateField('type-selector', metadata['input-type']) &&
                      isTypeCompatible('input')) &&
                  (!metadata['output-type']
                    ? true
                    : validateField('type-selector', metadata['output-type']) &&
                      isTypeCompatible('output'))
                }
              >
                <FieldWrapper
                  name="selected-field"
                  isValid={
                    !metadata['input-type']
                      ? true
                      : validateField('type-selector', metadata['input-type']) &&
                        isTypeCompatible('input')
                  }
                  type={t('Optional')}
                  label={t('InputType')}
                >
                  {!isTypeCompatible('input') && (
                    <>
                      <ReqoreMessage intent="danger">{t('FSMInputTypeError')}</ReqoreMessage>
                      <ReqoreVerticalSpacer height={20} />
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
                </FieldWrapper>
                <FieldWrapper
                  name="selected-field"
                  isValid={
                    !metadata['output-type']
                      ? true
                      : validateField('type-selector', metadata['output-type']) &&
                        isTypeCompatible('output')
                  }
                  type={t('Optional')}
                  label={t('OutputType')}
                >
                  {!isTypeCompatible('output') && (
                    <>
                      <ReqoreMessage intent="danger">{t('FSMOutputTypeError')}</ReqoreMessage>
                      <ReqoreVerticalSpacer height={20} />
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
                </FieldWrapper>
              </FieldGroup>
            </>
          ) : null}
        </ContentWrapper>
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
        {isMetadataHidden && (
          <>
            <div style={{ display: 'flex', overflow: 'hidden' }}>
              <ReqoreMenu>
                <ReqoreMenuDivider label="Interfaces" effect={{ textAlign: 'left' }} />
                <FSMToolbarItem
                  name="state"
                  category="interfaces"
                  type="mapper"
                  count={size(filter(states, ({ action }: IFSMState) => action?.type === 'mapper'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('Mapper')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="interfaces"
                  type="pipeline"
                  count={size(
                    filter(states, ({ action }: IFSMState) => action?.type === 'pipeline')
                  )}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('Pipeline')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="interfaces"
                  type="connector"
                  count={size(
                    filter(states, ({ action }: IFSMState) => action?.type === 'connector')
                  )}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('Connector')}
                </FSMToolbarItem>
                <ReqoreMenuDivider label="Logic" effect={{ textAlign: 'left' }} />
                <FSMToolbarItem
                  name="fsm"
                  category="logic"
                  type="fsm"
                  count={size(filter(states, ({ type }: IFSMState) => type === 'fsm'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('FSM')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="block"
                  type="block"
                  category="logic"
                  disabled={!qorus_instance}
                  count={size(filter(states, ({ type }: IFSMState) => type === 'block'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('Block')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="if"
                  category="logic"
                  type="if"
                  count={size(filter(states, ({ type }: IFSMState) => type === 'if'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('If')}
                </FSMToolbarItem>
                <ReqoreMenuDivider label="API" effect={{ textAlign: 'left' }} />
                <FSMToolbarItem
                  name="state"
                  type="apicall"
                  category="api"
                  count={size(
                    filter(states, ({ action }: IFSMState) => action?.type === 'apicall')
                  )}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-apicall')}
                </FSMToolbarItem>
                <ReqoreMenuDivider label="Data" effect={{ textAlign: 'left' }} />
                <FSMToolbarItem
                  name="state"
                  category="other"
                  type="search-single"
                  count={size(
                    filter(states, ({ action }: IFSMState) => action?.type === 'search-single')
                  )}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-search-single')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="other"
                  type="search"
                  count={size(filter(states, ({ action }: IFSMState) => action?.type === 'search'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-search')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="other"
                  type="update"
                  count={size(filter(states, ({ action }: IFSMState) => action?.type === 'update'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-update')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="other"
                  type="create"
                  count={size(filter(states, ({ action }: IFSMState) => action?.type === 'create'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-create')}
                </FSMToolbarItem>
                <FSMToolbarItem
                  name="state"
                  category="other"
                  type="delete"
                  count={size(filter(states, ({ action }: IFSMState) => action?.type === 'delete'))}
                  onDoubleClick={handleToolbarItemDblClick}
                  onDragStart={handleDragStart}
                >
                  {t('field-label-delete')}
                </FSMToolbarItem>
              </ReqoreMenu>
              <ReqoreHorizontalSpacer width={10} />
              <div style={{ flex: 1, overflow: 'hidden', minHeight: 100 }}>
                <StyledDiagramWrapper ref={wrapperRef} id="fsm-diagram">
                  <FSMDiagramWrapper
                    wrapperDimensions={wrapperDimensions}
                    setPan={setWrapperPan}
                    setShowStateIds={setShowStateIds}
                    showStateIds={showStateIds}
                    zoom={zoom}
                    setZoom={setZoom}
                    items={map(states, (state, id) => ({
                      x: state.position.x,
                      y: state.position.y,
                      type: getStateType(state),
                      id,
                    }))}
                  >
                    <StyledDiagram
                      name="fsm-drop-zone"
                      key={JSON.stringify(wrapperDimensions)}
                      ref={drop}
                      path={image_path}
                      onClick={() => setSelectedState(null)}
                      bgColor={theme.main}
                      style={{
                        transform: `scale(${zoom})`,
                        transformOrigin: 'left top',
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
                          onMouseEnter={() => setHoveredState(id)}
                          onMouseLeave={() => setHoveredState(null)}
                          hasTransitionToItself={hasTransitionToItself(id)}
                          showStateIds={showStateIds}
                          selectedState={selectedState}
                          isAvailableForTransition={isAvailableForTransition}
                          onTransitionOrderClick={(id) => setEditingTransitionOrder(id)}
                          onExecutionOrderClick={() => setEditingInitialOrder(true)}
                          isIsolated={isStateIsolated(id, states)}
                          stateInputProvider={getStateDataForComparison(states[id], 'input')}
                          stateOutputProvider={getStateDataForComparison(states[id], 'output')}
                          activateState={(id, data) => setActiveState(id)}
                        />
                      ))}
                      <svg
                        height="100%"
                        width="100%"
                        style={{ position: 'absolute', boxShadow: 'inset 0 0 50px 2px #00000080' }}
                      >
                        <defs>
                          <marker
                            id="arrowhead"
                            markerUnits="userSpaceOnUse"
                            markerWidth="30"
                            markerHeight="30"
                            refX="20"
                            refY="10"
                            orient="auto"
                          >
                            <path
                              d="M2,2 L2,20 L20,10 L2,2"
                              fill={getTransitionColor(null, null)}
                            />
                          </marker>
                          <marker
                            id="arrowheaderror"
                            markerUnits="userSpaceOnUse"
                            markerWidth="30"
                            markerHeight="30"
                            refX="20"
                            refY="10"
                            orient="auto"
                          >
                            <path
                              d="M2,2 L2,20 L20,10 L2,2"
                              fill={getTransitionColor(null, 'false')}
                            />
                          </marker>
                          <marker
                            id="arrowheadtrue"
                            markerUnits="userSpaceOnUse"
                            markerWidth="30"
                            markerHeight="30"
                            refX="20"
                            refY="10"
                            orient="auto"
                          >
                            <path
                              d="M2,2 L2,20 L20,10 L2,2"
                              fill={getTransitionColor(null, 'true')}
                            />
                          </marker>
                          <marker
                            id="arrowheadfalse"
                            markerUnits="userSpaceOnUse"
                            markerWidth="30"
                            markerHeight="30"
                            refX="20"
                            refY="10"
                            orient="auto"
                          >
                            <path
                              d="M2,2 L2,20 L20,10 L2,2"
                              fill={getTransitionColor(null, 'false')}
                            />
                          </marker>
                        </defs>
                        {transitions.map(
                          (
                            {
                              state,
                              targetState,
                              isError,
                              branch,
                              transitionIndex,
                              path,
                              side,
                              endSide,
                              transitionIndexPerSide,
                              transitionEndIndexPerSide,
                              ...rest
                            },
                            index
                          ) =>
                            !isTransitionToSelf(state, targetState) ? (
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
                                  name={`fsm-transition${
                                    isError ? '-error' : branch ? `-${branch}` : ''
                                  }`}
                                  id={`fsm-transition-${index}`}
                                  stroke={getTransitionColor(isError, branch)}
                                  strokeWidth={isError || branch ? 2 : 1}
                                  strokeDasharray={isError || branch ? '7' : undefined}
                                  markerEnd={`url(#arrowhead${getTransitionEndMarker(
                                    isError,
                                    branch
                                  )})`}
                                  d={getTransitionPath(
                                    { side, endSide, ...rest, state, targetState },
                                    getTransitionIndex(
                                      transitionIndexPerSide,
                                      transitionIndexes.current[state][side]
                                    ),
                                    getTransitionIndex(
                                      transitionEndIndexPerSide,
                                      transitionIndexes.current[targetState][endSide]
                                    ),
                                    transitionIndexes.current[state][side],
                                    transitionIndexes.current[targetState][endSide]
                                  )}
                                  deselected={hoveredState && hoveredState !== state}
                                  selected={hoveredState === state}
                                />
                                {showStateIds && (
                                  <StyledLineText
                                    style={{
                                      transform: `rotate(${calculateTextRotation(
                                        side
                                      )}deg) translateY(${calculateTextTranslation(side)}px)`,
                                      transformBox: 'fill-box',
                                      transformOrigin: 'center',
                                    }}
                                    deselected={hoveredState && hoveredState !== state}
                                  >
                                    <textPath
                                      href={`#fsm-transition-${index}`}
                                      startOffset="10px"
                                      fill="#ffffff"
                                    >
                                      {targetState}
                                    </textPath>
                                  </StyledLineText>
                                )}
                              </>
                            ) : null
                        )}
                      </svg>
                    </StyledDiagram>
                  </FSMDiagramWrapper>
                </StyledDiagramWrapper>
              </div>
            </div>
          </>
        )}
      </Content>
    </>
  );
};

export default compose(
  withGlobalOptionsConsumer(),
  withMessageHandler(),
  withMapperConsumer()
)(FSMView);
