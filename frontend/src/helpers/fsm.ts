import { cloneDeep, every, forEach, omit, reduce, size, some } from 'lodash';
import shortid from 'shortid';
import { IApp, IAppAction } from '../components/AppCatalogue';
import { IProviderType } from '../components/Field/connectors';
import { IOptions, IOptionsSchema } from '../components/Field/systemOptions';
import {
  DIAGRAM_SIZE,
  IFSMMetadata,
  IFSMState,
  IFSMStates,
  IFSMTransition,
  STATE_WIDTH,
  TAppAndAction,
  TFSMClassConnectorAction,
  TVariableActionValue,
} from '../containers/InterfaceCreator/fsm';
import { TQodexStatesForTemplates } from '../containers/InterfaceCreator/fsm/AppActionOptions';
import { TAction } from '../containers/InterfaceCreator/fsm/stateDialog';
import { isConditionValid } from '../containers/InterfaceCreator/fsm/transitionDialog';
import { postMessage } from '../hocomponents/withMessageHandler';
import { getStateBoundingRect } from './diagram';
import { validateField } from './validations';

export const autoAlign = (states: IFSMStates, config?: IAutoAlignConfig) => {
  let _margin = 50;
  let _columnWidth = _margin + 350;
  let _gridWidth = 4000;
  let _gridHeight = 4000;
  let _rowHeight = _margin + 150;

  let _grid: IGrid[] = [];
  let alignedStates: IFSMStates = cloneDeep(states);

  /**
   * Creates the background grid to align the states
   * @param states states to be aligned
   * @returns IGrid[] array of grid cells sorted row wise
   */
  const createGrid = (states: IFSMStates): IGrid[] => {
    const keys = Object.keys(states);
    let yAxisAllState: number[] = [];
    let xAxisAllState: number[] = [];

    // Separate the x and y coordinates of all the states, sort them to find the starting point of the grid
    keys.forEach((key) => {
      yAxisAllState.push(states[key].position?.y);
      xAxisAllState.push(states[key].position?.x);
    });
    yAxisAllState.sort((a, b) => {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
    xAxisAllState.sort((a, b) => {
      if (Number(a) < Number(b)) {
        return -1;
      }
      if (Number(a) > Number(b)) {
        return 1;
      }
      return 0;
    });

    // Starting point of the grid
    const gridStartingPoint = { x: xAxisAllState[0], y: yAxisAllState[0] };
    const noOfColumns = Math.round((_gridWidth - gridStartingPoint.x) / _columnWidth);
    const noOfRows = Math.round(_gridHeight / _rowHeight);

    // Create the grid
    for (let i = 0; i < noOfRows; i++) {
      for (let j = 0; j < noOfColumns; j++) {
        let obj: any = {};
        obj.id = `${i}${j}`;
        const xPosition = gridStartingPoint.x + j * _columnWidth;
        const yPosition = gridStartingPoint.y + i * _rowHeight;
        const position = { x: xPosition, y: yPosition };
        obj.position = position;
        _grid.push(obj);
      }
    }

    // Sort the grid row wise
    _grid.sort((a, b) => {
      if (Number(a.id) < Number(b.id)) {
        return -1;
      }
      return 1;
    });

    // Assign cells to occupied states
    let gridOccupied: IGrid[] = _grid;
    _grid.forEach((cell) => {
      const cellPosition = cell.position;
      const alignedStateKey = Object.keys(alignedStates).find(
        (key) => alignedStates[key].position === cellPosition
      );
      if (alignedStateKey) {
        if (cell.occupied) {
          const cellId = Number(cell.id);
          for (let i = cellId; i < _grid.length; i++) {
            const newCell = _grid.find((cell) => cell.id === cellId.toString());
            if (!newCell?.occupied) {
              newCell.occupied = true;
              newCell.state = alignedStates[alignedStateKey];
              const newCellIndex = gridOccupied.findIndex((cell) => newCell.id === cell.id);
              gridOccupied[newCellIndex] = newCell;
            }
          }
        } else {
          const newCell = _grid.find((_cell) => _cell.id === cell.id.toString());

          newCell.occupied = true;
          newCell.state = alignedStates[alignedStateKey];
          const newCellIndex = gridOccupied.findIndex((cell) => newCell.id === cell.id);
          gridOccupied[newCellIndex] = newCell;
        }
      }
    });
    _grid = gridOccupied;

    return _grid;
  };

  /**
   * Finds the next row index of the grid cell on the same column
   * @param id id of the grid cell
   * @returns index of the next row cell
   */
  const getNextLineIndex = (id: string): number => {
    const idSplit = id.split('');
    let nextLineId = String(Number(idSplit[0]) + 1);
    nextLineId = `${nextLineId}${idSplit[1]}`;
    const index = _grid.findIndex((cell) => cell.id === nextLineId);
    return index;
  };

  /**
   * Finds the next column index of the grid cell on the same row
   * @param id id of the grid cell
   * @returns index of the next column cell
   */
  const getNextColumnIndex = (id: string): number => {
    let nextId = String(Number(id) + 1);
    let padded: string;
    if (nextId.length < 2) {
      padded = nextId.padStart(2, '0');
    } else {
      padded = nextId;
    }
    const nextColumnIndex = _grid.findIndex((cell) => cell.id === padded);
    return nextColumnIndex;
  };

  /**
   * Finds the previous row index of the grid cell on the same column
   * @param id id of the grid cell
   * @returns index of the previous row cell in the same column
   */
  const getPreviousLineIndex = (id: string): number => {
    const idSplit = id.split('');
    let nextLineId = String(Number(idSplit[0]) - 1);
    nextLineId = `${nextLineId}${idSplit[1]}`;
    const index = _grid.findIndex((cell) => cell.id === nextLineId);
    return index;
  };

  const isAligned = (state: IFSMState, selectedGrid: IGrid): boolean => {
    const position = state.position;
    const selectedGridIndex = _grid.findIndex((cell) => cell === selectedGrid);
    const aligned = _grid.find((cell) => {
      return cell.position.x === position.x && cell.position.y === position.y;
    });
    if (aligned) {
      _grid[selectedGridIndex].occupied = true;
      _grid[selectedGridIndex].state = state;
    }
    return aligned ? true : false;
  };

  /**
   * Finds the row for the state to be aligned and shifts the state to the end of the row
   * @param state state to be aligned
   */
  const shiftState = (state: IFSMState): void => {
    let selectedGrid: IGrid | undefined;
    for (let i = 0; i < _grid.length; i++) {
      const nextLineIndex = getNextLineIndex(_grid[i].id);
      const row = {
        top: _grid[i].position,
        bottom: _grid[nextLineIndex].position,
      };
      // tackle states that are not overlapped by row
      if (row.top.y <= state.position.y && row.bottom.y >= state.corners?.bottomLeftCorner.y!) {
        selectedGrid = _grid[i];
        if (selectedGrid.occupied) {
          if (selectedGrid.state?.corners?.bottomLeftCorner.y! < state.position.y) {
            selectedGrid = _grid[nextLineIndex];
          }
        }
        break;
      }
      // tackle the states that are overlapped between rows towards bottom
      if (
        row.top.y <= state.position.y &&
        row.bottom.y >= state.position.y &&
        row.bottom.y <= state.corners?.bottomLeftCorner.y!
      ) {
        selectedGrid = _grid[nextLineIndex] ? _grid[nextLineIndex] : undefined;
        break;
      }
      // tackle the states that are overlapped between rows towards top
      if (
        row.top.y >= state.position.y &&
        row.top.y <= state.corners?.bottomLeftCorner.y! &&
        row.bottom.y > state.corners?.bottomLeftCorner.y!
      ) {
        selectedGrid = _grid[getPreviousLineIndex(_grid[i].id)] ?? _grid[i];
      }
    }
    if (typeof selectedGrid !== 'undefined') {
      if (selectedGrid.occupied) {
        let i = _grid.findIndex((cell) => cell === selectedGrid) + 1;
        while (i < _grid.length) {
          if (!_grid[i].occupied) {
            selectedGrid = _grid[i];
            break;
          }
          i++;
        }
      }
      state.position = selectedGrid!.position;
      alignedStates[state.key!] = state;
      const index = _grid.findIndex((cell) => cell.id === selectedGrid!.id);
      _grid[index].occupied = true;
      _grid[index].state = state;
    }
  };

  /**
   * Aligns the states in the array with the grid
   * @param statesArr array of states to be aligned
   */
  const findOverlapAndShift = (statesArr: IFSMState[]): void => {
    for (let j = 0; j < statesArr.length; j++) {
      const activeState = statesArr[j];
      shiftState(activeState);
    }
  };

  /**
   * Calculates the corners of the state with margin
   * @param state state for which corners with margin are to be calculated
   * @returns corners of the state with margin
   */
  const getStateCornersWithMargin = (state: IFSMState): IStateCorners => {
    const stateRef = getStateBoundingRect(state.key!);

    // Calculating all four corners of the state with margin
    const topLeftCorner = {
      x: state.position?.x - _margin,
      y: state.position?.y - _margin,
    };
    const topRightCorner = {
      x: state.position?.x + stateRef.width + _margin,
      y: state.position?.y - _margin,
    };
    const bottomLeftCorner = {
      x: state.position?.x - _margin,
      y: state.position?.y + stateRef.height + _margin,
    };
    const bottomRightCorner = {
      x: state.position?.x + stateRef.width + _margin,
      y: state.position?.y + stateRef.height + _margin,
    };
    return {
      topLeftCorner,
      topRightCorner,
      bottomLeftCorner,
      bottomRightCorner,
    };
  };

  /**
   * Finds the overlapping states and aligns them with the grid
   * @param states states to be aligned
   */
  const alignStates = (states: IFSMStates): void => {
    // alignedStates = states;
    const keys = Object.keys(states);
    let statesArr: IFSMState[] = [];

    // Create an array of states and calculate the corners with margin
    keys.forEach((key) => {
      const state = states[key];
      state.key = key;
      state.corners = getStateCornersWithMargin(state);
      if (state.position?.x && state.position?.y) statesArr.push(state);
    });

    findOverlapAndShift(statesArr);
  };

  // If config is provided then use the values from config else use the default values
  if (config) {
    _margin = config.margin ?? 50;
    _columnWidth = _margin + (config.columnWidth ?? 350);
    _gridWidth = config.gridWidth ?? 4000;
    _gridHeight = config.gridHeight ?? 4000;
    _rowHeight = _margin + (config.rowHeight ?? 150);
  }

  if (config?.grid && config.grid.length > 0) {
    _grid = cloneDeep(config.grid);
  } else {
    createGrid(states);
  }

  // Align the states with the grid
  alignStates(alignedStates);
  return { alignedStates, grid: _grid };
};

export interface IStateCorners {
  topLeftCorner: IFSMState['position'];
  topRightCorner: IFSMState['position'];
  bottomRightCorner: IFSMState['position'];
  bottomLeftCorner: IFSMState['position'];
}

export interface IStateRows {
  [x: string | number]: IFSMState[];
}

export interface IGrid {
  position: IFSMState['position'];
  id: string;
  occupied?: boolean;
  state?: IFSMState;
}

export interface IAutoAlignConfig {
  margin?: number;
  columnWidth?: number;
  gridWidth?: number;
  gridHeight?: number;
  rowHeight?: number;
  grid?: IGrid[];
}

export const getVariable = (
  varName: string,
  varType: 'globalvar' | 'localvar' | 'autovar',
  metadata: Partial<IFSMMetadata>
) => {
  const global = metadata?.globalvar || {};
  const local = metadata?.localvar || {};
  const auto = metadata?.autovar || {};

  if (varType === 'globalvar') {
    return global[varName];
  }

  if (varType === 'autovar') {
    return auto[varName];
  }

  return local[varName];
};

export const removeAllStatesWithVariable = (
  varName: string,
  varType: 'globalvar' | 'localvar',
  states: IFSMStates,
  interfaceId: string
): IFSMStates => {
  let newStates = cloneDeep(states);
  const removedStatesIds: (string | number)[] = [];

  newStates = reduce<IFSMStates, IFSMStates>(
    newStates,
    (modifiedStates, state, stateId): IFSMStates => {
      const newState = cloneDeep(state);
      // If this state uses the defined variable, we simply removed it
      if (
        state.action?.type === 'var-action' &&
        (state.action?.value as TVariableActionValue)?.var_name === varName &&
        (state.action?.value as TVariableActionValue)?.var_type === varType
      ) {
        removedStatesIds.push(stateId);
        return modifiedStates;
      }

      if (newState.states) {
        newState.states = removeAllStatesWithVariable(
          varName,
          varType,
          newState.states,
          interfaceId
        );

        // If there are no states left in this state, we remove it
        if (!size(newState.states)) {
          return modifiedStates;
        }
      }

      return {
        ...modifiedStates,
        [stateId]: newState,
      };
    },
    {}
  );

  // Remove the states properly
  removedStatesIds.forEach((stateId) => {
    newStates = removeFSMState(newStates, stateId, interfaceId);
  });

  return newStates;
};

export const getTransitionByState = (
  states: IFSMStates,
  stateId: string | number,
  targetId: string | number
): IFSMTransition | null => {
  const { transitions } = states[stateId];

  return transitions?.find((transition) => transition.state === targetId && !transition.fake);
};

/* A function that given an object of states with x and y coordinates
 * returns boolean if any of the states overlap
 */
export function checkOverlap(states: IFSMStates = {}): boolean {
  const keys = Object.keys(states);
  const length = keys.length;

  for (let i = 0; i < length - 1; i++) {
    const {
      position: { x: aX, y: aY },
    } = states[keys[i]];
    const { width: aW, height: aH } = getStateBoundingRect(keys[i]);

    for (let j = i + 1; j < length; j++) {
      const {
        position: { x: bX, y: bY },
      } = states[keys[j]];
      const { width: bW, height: bH } = getStateBoundingRect(keys[j]);

      if (aX < bX + bW && aX + aW > bX && aY < bY + bH && aY + aH > bY) {
        return true; // Overlapping states found
      }
    }
  }

  return false; // No overlapping states found
}

export const alignStates = (
  axis: 'horizontal' | 'vertical',
  alignment: 'top' | 'center' | 'bottom',
  states: IFSMStates,
  zoom?: number
): IFSMStates => {
  const statesWithDimensions: IFSMStates = reduce(
    states,
    (newStates, state, stateId) => {
      const { height, width } = getStateBoundingRect(stateId);

      return {
        ...newStates,
        [stateId]: {
          ...state,
          height,
          width,
          position: {
            ...state.position,
            x1: state.position.x + width,
            y1: state.position.y + height,
          },
        },
      };
    },
    {}
  );

  const axisPoint = axis === 'horizontal' ? 'x' : 'y';
  const farAxisPoint = axis === 'horizontal' ? 'x1' : 'y1';
  const axisDimension = axis === 'horizontal' ? 'width' : 'height';
  const statesArray = Object.values(statesWithDimensions);
  const sortedStates = statesArray.sort((a, b) => {
    return a.position[farAxisPoint] - b.position[farAxisPoint];
  });
  const topMostState = sortedStates[0];
  const topMostStateDimension = topMostState[axisDimension];
  const bottomMostState = sortedStates[sortedStates.length - 1];

  let newPosition;

  if (alignment === 'top') {
    newPosition = topMostState.position[axisPoint];
  }

  if (alignment === 'bottom') {
    newPosition = bottomMostState.position[farAxisPoint];
  }

  if (alignment === 'center') {
    newPosition =
      (topMostState.position[axisPoint] +
        topMostStateDimension +
        bottomMostState.position[axisPoint]) /
      2;
  }

  // Set the middle point as the middle coordinate of all the states
  return reduce(
    statesWithDimensions,
    (modifiedStates: IFSMStates, state: IFSMState, stateId: string) => {
      const height = state.height;
      const width = state.width;
      const dimension = axis === 'horizontal' ? width : height;

      let stateSpecificPosition = newPosition;

      if (alignment === 'center') {
        stateSpecificPosition = newPosition - dimension / 2;
      }

      if (alignment === 'bottom') {
        stateSpecificPosition = newPosition - dimension;
      }

      return {
        ...modifiedStates,
        [stateId]: {
          ...omit(state, ['height', 'width', 'key', 'corners']),
          position: {
            ...omit(state.position, ['x1', 'y1']),
            [axisPoint]: stateSpecificPosition,
          },
        },
      };
    },
    {}
  );
};

export const removeTransitionsWithStateId = (
  states: IFSMStates,
  removedStateId: string | number,
  targetStateId: string | number
) => {
  const newState = cloneDeep(states[targetStateId]);

  if (newState.transitions && getTransitionByState(states, targetStateId, removedStateId)) {
    newState.transitions = newState.transitions.reduce(
      (newTransitions: IFSMTransition[], transition: IFSMTransition) => {
        if (transition.state === removedStateId) {
          return newTransitions;
        }

        return [...newTransitions, transition];
      },
      []
    );
  }

  return newState;
};

export const isFSMNameValid: (name: string) => boolean = (name) => validateField('string', name);

export const isFSMBlockConfigValid = (data: IFSMState): boolean => {
  return size(data['block-config']) === 0 || validateField('system-options', data['block-config']);
};

export const isFSMActionValid = (
  state: IFSMState,
  actionType: TAction,
  metadata?: Partial<IFSMMetadata>,
  optionsSchema?: IOptionsSchema
): boolean => {
  switch (actionType) {
    case 'mapper': {
      return !!state?.action?.value;
    }
    case 'pipeline': {
      return !!state?.action?.value;
    }
    case 'connector': {
      return (
        !!(state?.action?.value as TFSMClassConnectorAction)?.class &&
        !!(state?.action?.value as TFSMClassConnectorAction)?.connector
      );
    }
    case 'apicall': {
      return validateField('api-call', state?.action?.value);
    }
    case 'send-message': {
      return validateField('send-message', state?.action?.value);
    }
    case 'search':
    case 'delete':
    case 'update':
    case 'create':
    case 'search-single': {
      return validateField(actionType, state?.action?.value);
    }
    case 'var-action': {
      if (!metadata) {
        return false;
      }

      const currentValue = state?.action?.value as TVariableActionValue;
      // We need to get the value from the variable
      const variableData: { value: IProviderType } = getVariable(
        currentValue?.var_name,
        currentValue?.var_type,
        metadata
      );

      if (!variableData) {
        return false;
      }

      return validateField('var-action', state?.action?.value, { variableData });
    }
    case 'appaction': {
      return (
        validateField('string', state.action.value.app) &&
        validateField('string', state.action.value.action) &&
        validateField('options', state.action.value.options, { optionSchema: optionsSchema }, true)
      );
    }
    default: {
      return true;
    }
  }
};

export const isStateValid = (
  state: IFSMState,
  metadata?: Partial<IFSMMetadata>,
  optionsSchema?: IOptionsSchema
): boolean => {
  const blockLogicType = state.type === 'fsm' ? 'fsm' : 'custom';
  const actionType: TAction = state.action?.type || 'none';

  if (state.type === 'block') {
    return (
      isFSMNameValid(state.name) &&
      isFSMBlockConfigValid(state) &&
      (blockLogicType === 'custom'
        ? size(state.states) !== 0 && every(state.states, (data) => data.isValid)
        : validateField('string', state.fsm))
    );
  }

  if (state.type === 'if') {
    return (
      isFSMNameValid(state.name) &&
      isConditionValid(state) &&
      (!state['input-output-type'] || validateField('type-selector', state['input-output-type']))
    );
  }

  return (
    isFSMNameValid(state.name) &&
    isFSMActionValid(state, actionType, metadata, optionsSchema) &&
    (!state['input-type'] || validateField('type-selector', state['input-type'])) &&
    (!state['output-type'] || validateField('type-selector', state['output-type']))
  );
};

export const removeFSMState = (
  states: IFSMStates,
  id: string | number,
  interfaceId: string,
  onFinish?: (newStates: IFSMStates) => any
): IFSMStates => {
  let newStates: IFSMStates = cloneDeep(states);

  newStates = reduce(
    newStates,
    (modifiedStates: IFSMStates, state: IFSMState, stateId: string) => {
      let newState: IFSMState = { ...state };

      if (stateId === id) {
        return modifiedStates;
      }

      newState = removeTransitionsWithStateId(states, id, stateId);

      return { ...modifiedStates, [stateId]: newState };
    },
    {}
  );

  postMessage('remove-fsm-state', {
    iface_id: interfaceId,
    state_id: id,
  });

  onFinish?.(newStates);

  return newStates;
};

export const getRecursiveStatesConnectedtoState = (
  id: string | number,
  states: IFSMStates
): IFSMStates => {
  let connectedStates: IFSMStates = {};

  forEach(states, (state, stateId) => {
    const transition = getTransitionByState(states, stateId, id);

    if (transition) {
      connectedStates = {
        ...connectedStates,
        [stateId]: state,
        ...getRecursiveStatesConnectedtoState(stateId, states),
      };
    }
  });

  return connectedStates;
};

export const getStatesConnectedtoState = (id: string | number, states: IFSMStates): IFSMStates => {
  const connectedStates: IFSMStates = {};

  forEach(states, (state, stateId) => {
    const transition = getTransitionByState(states, stateId, id);

    if (transition && !transition.fake) {
      connectedStates[stateId] = state;
    }
  });

  return connectedStates;
};

export const getStatesForTemplates = (
  id: string | number,
  states: IFSMStates
): TQodexStatesForTemplates => {
  const connectedStates = getRecursiveStatesConnectedtoState(id, states);

  return reduce(
    connectedStates,
    (newStates, state, stateId): TQodexStatesForTemplates => ({
      ...newStates,
      [stateId]: {
        ...state.action,
        isValid: state.isValid,
      },
    }),
    {}
  );
};

export const getAppAndAction = (
  apps: IApp[],
  appName: string,
  actionName?: string
): { app: IApp; action: IAppAction } => {
  if (!apps || !size(apps)) {
    return { app: undefined, action: undefined };
  }

  const app = apps.find((a) => a.name === appName);
  const action = app?.actions.find((a) => a.action === actionName);

  return { app, action };
};

export const areStatesAConnectedGroup = (states: IFSMStates): boolean => {
  // Every state has to be connected to at least one other state
  return every(states, (state, stateId) => {
    // Is there any other state connecting to this state?
    if (size(getStatesConnectedtoState(stateId, states))) {
      return true;
    }

    // Is this state connecting to any other state from the provided states?
    if (size(state.transitions)) {
      // Check that all of the transitions are not fake & connected to a state from the provided states
      return every(state.transitions, (transition) => {
        return !transition.fake && !!states[transition.state];
      });
    }

    return false;
  });
};

export const getBuiltInAppAndAction = (
  apps: IApp[],
  type: Omit<TAction, 'appaction'>
): { app: IApp; action: IAppAction } => {
  if (!apps || !size(apps)) {
    return { app: undefined, action: undefined };
  }

  // Get all the built in apps
  const builtInApps = apps.filter((a) => a.builtin);
  // Get the built in app that has the action
  const app = builtInApps.find((a) => a.actions.find((action) => action.action === type));
  // Get the action
  const action = app?.actions.find((a) => a.action === type);

  return { app, action };
};

export const changeStateIdsToGenerated = (states: IFSMStates): IFSMStates => {
  const idMapper: { [x: string]: string } = {};
  // Change the state ID to a generated one
  const fixedStates: IFSMStates = reduce(
    states,
    (newStates, state, stateId) => {
      const id = shortid.generate();
      idMapper[stateId] = id;
      newStates[id] = {
        ...state,
        id,
        key: id,
        keyId: id,
      };
      return newStates;
    },
    {}
  );

  // Change the state IDs in the transitions
  forEach(fixedStates, (state, stateId) => {
    const newState = { ...state };

    if (size(newState.transitions)) {
      newState.transitions = newState.transitions.map((transition) => {
        return {
          ...transition,
          state: idMapper[transition.state],
        };
      });
    }

    // We also need to change every template in all of action options
    if (state.action?.type === 'appaction' && size((state.action.value as TAppAndAction).options)) {
      const fixedOptions: IOptions = reduce(
        (state.action.value as TAppAndAction).options,
        (newOptions, option, optionName) => {
          if (typeof option.value !== 'string') {
            return {
              ...newOptions,
              [optionName]: option,
            };
          }

          let fixedValue = option.value;

          forEach(idMapper, (newId, oldId) => {
            // Get the old id pattern
            const regex = new RegExp(`\\$data:{${oldId}.`, 'g');
            // Replace it with the new id
            fixedValue = fixedValue.replace(regex, `$data:{${newId}.`);
          });

          return {
            ...newOptions,
            [optionName]: {
              ...option,
              value: fixedValue,
            },
          };
        },
        {}
      );

      (newState.action.value as TAppAndAction).options = fixedOptions;
    }

    fixedStates[stateId] = newState;
  });

  return fixedStates;
};

export const removeTransitionsFromStateGroup = (states: IFSMStates): IFSMStates => {
  return reduce(
    states,
    (newStates, state, stateId) => {
      // Check if this state has transitions to a state not in this group
      if (size(state.transitions)) {
        const newState = cloneDeep(state);

        newState.transitions = newState.transitions.filter((transition) => {
          return !!states[transition.state];
        });

        return {
          ...newStates,
          [stateId]: newState,
        };
      }

      return {
        ...newStates,
        [stateId]: state,
      };
    },
    {}
  );
};

export const repositionStateGroup = (states: IFSMStates, x: number, y: number): IFSMStates => {
  // Get the left top most state
  const leftTopMostState: IFSMState = reduce(
    states,
    (leftTopMostState, state) => {
      if (
        !leftTopMostState ||
        state.position.x < leftTopMostState.position.x ||
        state.position.y < leftTopMostState.position.y
      ) {
        return state;
      }

      return leftTopMostState;
    },
    undefined
  );
  // Get the difference of x and y from the provided coords and the left top most state
  const xDiff = x - leftTopMostState.position.x;
  const yDiff = y - leftTopMostState.position.y;

  // Reposition the states
  return reduce(
    states,
    (newStates, state, stateId) => {
      let newX = state.id === leftTopMostState.id ? x : state.position.x + xDiff;
      let newY = state.id === leftTopMostState.id ? y : state.position.y + yDiff;

      if (newX < 0) {
        newX = 0;
      }

      if (newY < 0) {
        newY = 0;
      }

      if (newX > DIAGRAM_SIZE) {
        newX = DIAGRAM_SIZE;
      }

      if (newY > DIAGRAM_SIZE) {
        newY = DIAGRAM_SIZE;
      }

      return {
        ...newStates,
        [stateId]: {
          ...state,
          position: {
            x: newX,
            y: newY,
          },
        },
      };
    },
    {}
  );
};

export const isAnyStateAtPosition = (states: IFSMStates, x: number, y: number): boolean => {
  return some(states, (state) => {
    return state.position.x === x && state.position.y === y;
  });
};

export const positionStateInFreeSpot = (states: IFSMStates, x: number, y: number) => {
  let newX = x;
  let newY = y;

  // Check if there is already a state at this position
  while (isAnyStateAtPosition(states, newX, newY)) {
    if (newX + STATE_WIDTH + 50 > DIAGRAM_SIZE) {
      newY += 450;
    } else {
      newX += STATE_WIDTH + 50;
    }
  }

  return { x: newX, y: newY };
};

export const buildMetadata = (data?: IFSMMetadata, context?: any): IFSMMetadata => {
  const metadata: IFSMMetadata = {
    display_name: 'Untitled Qodex',
    autovar: data?.autovar || context?.autovar,
    globalvar: data?.globalvar,
    localvar: data?.localvar,
  };

  if (data?.name) {
    metadata.name = data.name;
  }

  if (data?.display_name) {
    metadata.display_name = data.display_name;
  } else if (data?.name) {
    metadata.display_name = data.name;
  }

  if (data?.short_desc) {
    metadata.short_desc = data.short_desc;
  }

  if (data?.desc) {
    metadata.desc = data.desc;
  }

  if (data?.groups) {
    metadata.groups = data.groups;
  }

  if (data?.['input-type'] || context?.inputType) {
    metadata['input-type'] = data?.['input-type'] || context?.inputType;
  }

  if (data?.['output-type']) {
    metadata['output-type'] = data['output-type'];
  }

  return metadata;
};
