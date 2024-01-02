import { cloneDeep, pick, size } from 'lodash';
import { IApp } from '../../src/components/AppCatalogue';
import { DIAGRAM_SIZE, IFSMStates, TAppAndAction } from '../../src/containers/InterfaceCreator/fsm';
import {
  IGrid,
  areStatesAConnectedGroup,
  autoAlign,
  changeStateIdsToGenerated,
  checkOverlap,
  getAppAndAction,
  removeAllStatesWithVariable,
  removeTransitionsFromStateGroup,
  repositionStateGroup,
} from '../../src/helpers/fsm';
import OndewoFSM from '../../src/stories/Data/fsm.json';
import multipleVariableStates from '../../src/stories/Data/multipleVariablesFsm.json';
import QodexWithMultipleAppsAndActions from '../../src/stories/Data/qodexWithMultipleAppsAndActions.json';
import multipleStatesInMultipleRows from './json/fsmMultipleStatesInMultipleRows.json';
import multipleStatesInOneRow from './json/fsmMultipleStatesInOneRow.json';
import statesObj from './json/fsmStates.json';
import stateApart from './json/fsmStatesApart.json';
import statesOverlappedApart from './json/fsmStatesOverlappedApart.json';

const findGridIndex = (id: string, grid: IGrid[]) => {
  return grid.findIndex((cell) => cell.id === id);
};

const stateMargin = 90;

describe('Align states with the grid', () => {
  it('should align the states with proper grid index', () => {
    const { grid } = autoAlign(statesObj as IFSMStates, {
      rowHeight: stateMargin,
    });

    expect(grid[findGridIndex('00', grid)].state?.key).toEqual('1');
    expect(grid[findGridIndex('01', grid)].state?.key).toEqual('2');
    expect(grid[findGridIndex('10', grid)].state?.key).toEqual('3');
    expect(grid[findGridIndex('11', grid)].state?.key).toEqual('4');
    expect(grid[findGridIndex('20', grid)].state?.key).toEqual('5');
    expect(grid[findGridIndex('21', grid)].state?.key).toEqual('6');
    expect(grid[findGridIndex('30', grid)].state?.key).toEqual('7');
    expect(grid[findGridIndex('31', grid)].state?.key).toEqual('8');
  });

  it('should align states and distribute them in multiple rows', () => {
    const { grid } = autoAlign(multipleStatesInMultipleRows as IFSMStates, {
      rowHeight: stateMargin,
    });
    expect(grid[findGridIndex('00', grid)].state?.key).toEqual('1');
    expect(grid[findGridIndex('01', grid)].state?.key).toEqual('2');
    expect(grid[findGridIndex('02', grid)].state?.key).toEqual('3');
    expect(grid[findGridIndex('03', grid)].state?.key).toEqual('4');
    expect(grid[findGridIndex('04', grid)].state?.key).toEqual('5');
    expect(grid[findGridIndex('05', grid)].state?.key).toEqual('6');
    expect(grid[findGridIndex('06', grid)].state?.key).toEqual('7');
    expect(grid[findGridIndex('07', grid)].state?.key).toEqual('8');
    expect(grid[findGridIndex('08', grid)].state?.key).toEqual('9');
    expect(grid[findGridIndex('09', grid)].state?.key).toEqual('10');
    expect(grid[findGridIndex('10', grid)].state?.key).toEqual('11');
    expect(grid[findGridIndex('11', grid)].state?.key).toEqual('12');
    expect(grid[findGridIndex('12', grid)].state?.key).toEqual('13');
    expect(grid[findGridIndex('13', grid)].state?.key).toEqual('14');
    expect(grid[findGridIndex('14', grid)].state?.key).toEqual('15');
    expect(grid[findGridIndex('15', grid)].state?.key).toEqual('16');
    expect(grid[findGridIndex('20', grid)].state?.key).toEqual('22');
    expect(grid[findGridIndex('16', grid)].state?.key).toEqual('18');
    expect(grid[findGridIndex('17', grid)].state?.key).toEqual('19');
    expect(grid[findGridIndex('18', grid)].state?.key).toEqual('20');
    expect(grid[findGridIndex('19', grid)].state?.key).toEqual('21');
    expect(grid[findGridIndex('21', grid)].state?.key).toEqual('23');
    expect(grid[findGridIndex('22', grid)].state?.key).toEqual('24');
    expect(grid[findGridIndex('23', grid)].state?.key).toEqual('25');
    expect(grid[findGridIndex('24', grid)].state?.key).toEqual('26');
    expect(grid[findGridIndex('25', grid)].state?.key).toEqual('27');
  });

  it('should align states and distribute them in one row', () => {
    const { grid } = autoAlign(multipleStatesInOneRow as IFSMStates, {
      rowHeight: stateMargin,
    });
    expect(grid[findGridIndex('00', grid)].state?.key).toEqual('1');
    expect(grid[findGridIndex('01', grid)].state?.key).toEqual('2');
    expect(grid[findGridIndex('02', grid)].state?.key).toEqual('3');
    expect(grid[findGridIndex('03', grid)].state?.key).toEqual('4');
    expect(grid[findGridIndex('04', grid)].state?.key).toEqual('5');
    expect(grid[findGridIndex('05', grid)].state?.key).toEqual('6');
    expect(grid[findGridIndex('06', grid)].state?.key).toEqual('7');
    expect(grid[findGridIndex('07', grid)].state?.key).toEqual('8');
    expect(grid[findGridIndex('08', grid)].state?.key).toEqual('9');
    expect(grid[findGridIndex('09', grid)].state?.key).toEqual('10');
    expect(grid[findGridIndex('10', grid)].state?.key).toEqual('11');
    expect(grid[findGridIndex('11', grid)].state?.key).toEqual('12');
    expect(grid[findGridIndex('12', grid)].state?.key).toEqual('13');
    expect(grid[findGridIndex('13', grid)].state?.key).toEqual('14');
    expect(grid[findGridIndex('14', grid)].state?.key).toEqual('15');
    expect(grid[findGridIndex('15', grid)].state?.key).toEqual('16');
    expect(grid[findGridIndex('30', grid)].state?.key).toEqual('17');
  });

  it('should align states together which are far apart on the grid', () => {
    const { grid } = autoAlign(stateApart as IFSMStates, {
      rowHeight: stateMargin,
    });
    expect(grid[findGridIndex('00', grid)].state?.key).toEqual('1');
    expect(grid[findGridIndex('01', grid)].state?.key).toEqual('2');
  });

  it('should align states together which are far apart on the grid and overlapped', () => {
    const { grid } = autoAlign(statesOverlappedApart as IFSMStates, {
      rowHeight: stateMargin,
    });
    expect(grid[findGridIndex('00', grid)].state?.key).toEqual('1');
    expect(grid[findGridIndex('01', grid)].state?.key).toEqual('2');
    expect(grid[findGridIndex('02', grid)].state?.key).toEqual('3');
  });

  it('should not mutate the original object', () => {
    const originalStatesObj = cloneDeep(statesOverlappedApart);
    const { alignedStates } = autoAlign(statesOverlappedApart as IFSMStates, {
      rowHeight: stateMargin,
    });
    expect(JSON.stringify(alignedStates)).not.toEqual(JSON.stringify(statesOverlappedApart));
    expect(JSON.stringify(statesOverlappedApart)).toEqual(JSON.stringify(originalStatesObj));
  });

  it('should never have two states with same position after auto align', () => {
    const { alignedStates } = autoAlign(statesOverlappedApart as IFSMStates, {
      rowHeight: stateMargin,
    });

    // Changing the position of a single state
    alignedStates['2'].position.x = alignedStates['2'].position.x - 200;
    alignedStates['2'].position.y = alignedStates['2'].position.y + 200;

    // Auto aligning again
    const autoAligned = autoAlign(alignedStates, { rowHeight: stateMargin });
    const newAlignedStates = autoAligned.alignedStates;
    const grid = autoAligned.grid;

    // Checking if any two states have same position
    let isOverlapped = false;
    Object.keys(newAlignedStates).forEach((key) => {
      const selectedState = newAlignedStates[key];

      Object.keys(newAlignedStates).forEach((newKey) => {
        if (newAlignedStates[newKey].position === selectedState.position && !(newKey === key)) {
          isOverlapped = true;
        }
      });
    });

    // Checking if all the states are aligned to a grid cell
    let gridOverlapped = false;
    Object.keys(newAlignedStates).forEach((key) => {
      const state = newAlignedStates[key];
      if (!grid.find((cell) => cell.state === state)) {
        gridOverlapped = true;
      }
    });

    expect(isOverlapped).toBe(false);
    expect(gridOverlapped).toBe(false);
  });
});

test('it should remove all states with a certain variable', () => {
  const states: IFSMStates = multipleVariableStates.states as IFSMStates;

  expect(size(states)).toBe(2);
  expect(size(states['2'].states)).toBe(4);
  expect(size(states['2'].states['3'].states)).toBe(6);

  const modifiedStates = removeAllStatesWithVariable(
    'RootVariableProvider',
    'globalvar',
    states,
    'asdf'
  );

  expect(size(modifiedStates)).toBe(1);
  expect(modifiedStates['1']).toBe(undefined);
  expect(size(modifiedStates['2'].states)).toBe(3);
  expect(size(modifiedStates['2'].states['3'].states)).toBe(3);

  const newModifiedStates = removeAllStatesWithVariable(
    'WhileVariableProvider',
    'globalvar',
    modifiedStates,
    'asdf'
  );

  expect(size(newModifiedStates['2'].states)).toBe(2);
  expect(size(newModifiedStates['2'].states['3'].states)).toBe(2);
});

test.skip('it should return true if 2 states are overlapping', () => {
  const overlappingStates: IFSMStates = OndewoFSM.states as IFSMStates;
  let overlapping = checkOverlap(overlappingStates);

  expect(overlapping).toBe(true);

  const nonOverlappingStates: IFSMStates = multipleVariableStates.states as IFSMStates;

  overlapping = checkOverlap(nonOverlappingStates);

  expect(overlapping).toBe(false);
});

describe('getAppAndAction', () => {
  let apps: IApp[];

  beforeEach(() => {
    apps = [
      {
        name: 'app1',
        display_name: 'App 1',
        short_desc: 'Description of App 1',
        actions: [
          {
            app: 'app1',
            action: 'action1',
            display_name: 'Action 1',
            short_desc: 'Description of Action 1',
          },
          {
            app: 'app1',
            action: 'action2',
            display_name: 'Action 2',
            short_desc: 'Description of Action 2',
          },
        ],
      },
      {
        name: 'app2',
        display_name: 'App 2',
        short_desc: 'Description of App 2',
        actions: [
          {
            app: 'app2',
            action: 'action3',
            display_name: 'Action 3',
            short_desc: 'Description of Action 3',
          },
          {
            app: 'app2',
            action: 'action4',
            display_name: 'Action 4',
            short_desc: 'Description of Action 4',
          },
        ],
      },
    ];
  });

  it('should return the correct app and action when both are specified', () => {
    const result = getAppAndAction(apps, 'app1', 'action1');
    expect(result.app.name).toEqual('app1');
    expect(result.action.action).toEqual('action1');
  });

  it('should return the correct app when only the app name is specified', () => {
    const result = getAppAndAction(apps, 'app2');
    expect(result.app.name).toEqual('app2');
  });

  it('should return undefined for the action when only the app name is specified', () => {
    const result = getAppAndAction(apps, 'app2');
    expect(result.action).toBeUndefined();
  });

  it('should return undefined for both the app and action when the app name is not found', () => {
    const result = getAppAndAction(apps, 'app3', 'action1');
    expect(result.app).toBeUndefined();
    expect(result.action).toBeUndefined();
  });

  it('should return undefined for the action when the action name is not found', () => {
    const result = getAppAndAction(apps, 'app1', 'action3');
    expect(result.app.name).toEqual('app1');
    expect(result.action).toBeUndefined();
  });
});

describe('Are states a connected group', () => {
  const states: IFSMStates = QodexWithMultipleAppsAndActions.states as unknown as IFSMStates;

  it('should return true if a group of lineary connected states are passed', () => {
    const connected = areStatesAConnectedGroup(pick(states, ['1', '2', '3']));

    expect(connected).toBe(true);
  });

  it('should return true if a group of parallel connected states are passed', () => {
    const connected = areStatesAConnectedGroup(pick(states, ['4', '2', '3']));

    expect(connected).toBe(true);
  });

  it('should return true if a group of parallel and linear connected states are passed', () => {
    const connected = areStatesAConnectedGroup(pick(states, ['1', '4', '2', '3']));

    expect(connected).toBe(true);
  });

  it('should return false if separated states are passed', () => {
    expect(areStatesAConnectedGroup(pick(states, ['1', '4']))).toBe(false);
    expect(areStatesAConnectedGroup(pick(states, ['2', '4']))).toBe(false);
    expect(areStatesAConnectedGroup(pick(states, ['3', '4']))).toBe(false);
    expect(areStatesAConnectedGroup(pick(states, ['1']))).toBe(false);
  });
});

describe('Repoisitioning state groups', () => {
  const states: IFSMStates = {
    state1: {
      display_name: 'State 1',
      type: 'state',
      id: 'state1',
      position: {
        x: 350,
        y: 0,
      },
    },
    state2: {
      display_name: 'State 2',
      type: 'state',
      id: 'state2',
      position: {
        x: 150,
        y: 250,
      },
    },
    state3: {
      display_name: 'State 3',
      type: 'state',
      id: 'state3',
      position: {
        x: 20,
        y: 20,
      },
    },
    state4: {
      display_name: 'State 4',
      type: 'state',
      id: 'state4',
      position: {
        x: DIAGRAM_SIZE - 50,
        y: DIAGRAM_SIZE - 50,
      },
    },
  };

  it('should reposition a group of states based on the top left most state', () => {
    const repositionedStates = repositionStateGroup(states, 100, 100);

    expect(repositionedStates.state3.position.x).toBe(100);
    expect(repositionedStates.state3.position.y).toBe(100);

    expect(repositionedStates.state1.position.x).toBe(430);
    expect(repositionedStates.state1.position.y).toBe(80);

    expect(repositionedStates.state4.position.x).toBe(DIAGRAM_SIZE);
    expect(repositionedStates.state4.position.y).toBe(DIAGRAM_SIZE);
  });
});

describe.only('Remove transitions', () => {
  const states: IFSMStates = {
    state1: {
      display_name: 'State 1',
      type: 'state',
      id: 'state1',
      transitions: [
        {
          state: 'state2',
        },
      ],
      position: {
        x: 350,
        y: 0,
      },
    },
    state2: {
      display_name: 'State 2',
      type: 'state',
      id: 'state2',
      position: {
        x: 150,
        y: 250,
      },
      transitions: [
        {
          state: 'state3',
        },
        {
          state: 'state7',
        },
      ],
    },
    state3: {
      display_name: 'State 3',
      type: 'state',
      id: 'state3',
      position: {
        x: 20,
        y: 20,
      },
      transitions: [
        {
          state: 'state4',
        },
      ],
    },
    state4: {
      display_name: 'State 4',
      type: 'state',
      id: 'state4',
      position: {
        x: DIAGRAM_SIZE - 50,
        y: DIAGRAM_SIZE - 50,
      },
      transitions: [
        {
          state: 'state5',
        },
      ],
    },
  };

  it('should remove transitions to states not in a state group', () => {
    const fixedStates = removeTransitionsFromStateGroup(states);

    expect(fixedStates.state1.transitions.length).toBe(1);
    expect(fixedStates.state2.transitions.length).toBe(1);
    expect(fixedStates.state3.transitions.length).toBe(1);
    expect(fixedStates.state4.transitions.length).toBe(0);
  });
});

describe('Regenerating state IDs', () => {
  const states: IFSMStates = {
    state1: {
      display_name: 'State 1',
      type: 'state',
      id: 'state1',
      position: {
        x: 350,
        y: 0,
      },
      transitions: [
        {
          state: 'state2',
        },
      ],
      action: {
        type: 'appaction',
        value: {
          app: 'Discord',
          action: 'Get user info',
          options: {
            qorus_app_connection: {
              type: 'connection',
              value: 'discord',
            },
          },
        },
      },
    },
    state2: {
      display_name: 'State 2',
      type: 'state',
      id: 'state2',
      position: {
        x: 150,
        y: 250,
      },
      transitions: [
        {
          state: 'state3',
        },
      ],
      action: {
        type: 'appaction',
        value: {
          app: 'Discord',
          action: 'Get user info',
          options: {
            qorus_app_connection: {
              type: 'connection',
              value: 'discord',
            },
            content: {
              type: 'string',
              value: 'I use $data:{state1.connection} to connect to $data:{1.app}',
            },
          },
        },
      },
    },
    state3: {
      display_name: 'State 3',
      type: 'state',
      id: 'state3',
      position: {
        x: 20,
        y: 20,
      },
      action: {
        type: 'appaction',
        value: {
          app: 'Discord',
          action: 'Get user info',
          options: {
            qorus_app_connection: {
              type: 'connection',
              value: 'discord',
            },
            server: {
              type: 'string',
              value: 'server $data:{state2.server}',
            },
            content: {
              type: 'string',
              value:
                'I use $data:{state1.connection} to connect to $data:{state2.app} and $data:{state1.app}',
            },
          },
        },
      },
    },
  };

  it('correctly changes the state IDs in all required places', () => {
    const newStates = changeStateIdsToGenerated(states);
    const newState1Id = Object.keys(newStates).find(
      (key) => newStates[key].display_name === 'State 1'
    );
    const newState2Id = Object.keys(newStates).find(
      (key) => newStates[key].display_name === 'State 2'
    );
    const newState3Id = Object.keys(newStates).find(
      (key) => newStates[key].display_name === 'State 3'
    );

    expect(newStates[newState1Id].id).toBe(newState1Id);
    expect(newStates[newState1Id].key).toBe(newState1Id);
    expect(newStates[newState1Id].keyId).toBe(newState1Id);

    expect(newStates[newState1Id].transitions[0].state).toBe(newState2Id);
    expect(newStates[newState2Id].transitions[0].state).toBe(newState3Id);

    expect((newStates[newState2Id].action.value as TAppAndAction).options.content.value).toBe(
      `I use $data:{${newState1Id}.connection} to connect to $data:{1.app}`
    );
    expect((newStates[newState3Id].action.value as TAppAndAction).options.server.value).toBe(
      `server $data:{${newState2Id}.server}`
    );
    expect((newStates[newState3Id].action.value as TAppAndAction).options.content.value).toBe(
      `I use $data:{${newState1Id}.connection} to connect to $data:{${newState2Id}.app} and $data:{${newState1Id}.app}`
    );
  });
});
