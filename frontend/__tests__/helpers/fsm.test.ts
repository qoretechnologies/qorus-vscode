import { cloneDeep, size } from 'lodash';
import { IFSMStates } from '../../src/containers/InterfaceCreator/fsm';
import { IGrid, autoAlign, removeAllStatesWithVariable } from '../../src/helpers/fsm';
import multipleVariableStates from '../../src/stories/Data/multipleVariablesFsm.json';
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
