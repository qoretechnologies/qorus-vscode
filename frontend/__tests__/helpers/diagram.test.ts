import {
  add,
  centerNodes,
  create,
  findRef,
  getPosition,
  getStateBoundingRect,
  getWidth,
  isRef,
  normalize,
  setBalancedDepth,
  setBalancedWeight,
  setBalancedWidthAndPosition,
} from '../../src/helpers/diagram';

describe('normalize', () => {
  it('returns a map of dependencies with no duplicates', () => {
    const deps = {
      '1': [2, 3],
      '2': [3],
      '3': [],
      '4': [],
    };
    const normalized = normalize(deps);
    expect(normalized.get(1)).toEqual([2, 3]);
    expect(normalized.get(2)).toEqual([3]);
    expect(normalized.get(3)).toEqual([]);
    expect(normalized.get(4)).toEqual([]);
  });
});

describe('create', () => {
  it('returns a new TempGraphNode', () => {
    const node = create(1);
    expect(node).toEqual({
      id: 1,
      above: [],
      below: [],
      depth: 0,
      weight: 1,
    });
  });
});

describe('add', () => {
  it('adds cross-references between the given nodes', () => {
    const above = create(1);
    const below = create(2);
    const [newAbove, newBelow] = add(above, below);
    expect(newAbove).toEqual({
      id: 1,
      above: [],
      below: [2],
      depth: 0,
      weight: 1,
    });
    expect(newBelow).toEqual({
      id: 2,
      above: [1],
      below: [],
      depth: 0,
      weight: 1,
    });
  });
});

describe('setBalancedDepth', () => {
  test('should return an empty map when passed an empty map', () => {
    const nodes = new Map();
    const balanced = setBalancedDepth(nodes);
    expect(balanced).toEqual(new Map());
  });

  test('should correctly set depth when given a simple map', () => {
    const nodes = new Map([
      [1, { above: [], below: [], depth: 0 }],
      [2, { above: [1], below: [], depth: 0 }],
      [3, { above: [2], below: [], depth: 0 }],
    ]);
    const balanced = setBalancedDepth(nodes);
    expect(balanced.get(1).depth).toBe(0);
    expect(balanced.get(2).depth).toBe(1);
    expect(balanced.get(3).depth).toBe(2);
  });

});

describe('findRef', () => {
  test('should return null when given a node with no nodes above', () => {
    const node = { above: [], below: [], width: 0 };
    expect(findRef(node)).toBeNull();
  });

  test('should return the center node when given an odd number of nodes above', () => {
    const node = { above: [{ below: [] }, { below: [] }, { below: [] }], below: [], width: 0 };
    expect(findRef(node)).toEqual(node.above[1]);
  });

  test('should return the center-left node when given an even number of nodes above', () => {
    const node = {
      above: [{ below: [] }, { below: [] }, { below: [] }, { below: [] }],
      below: [],
      width: 0,
    };
    expect(findRef(node)).toEqual(node.above[1]);
  });

});

describe('isRef', () => {
  test('should return false when given an empty nodesBelow array', () => {
    const node = { above: [], below: [], width: 0 };
    expect(isRef(node, [])).toBe(false);
  });

  test('should return false when given a node whose reference is not the first node in nodesBelow', () => {
    const refNode = { above: [], below: [], width: 0 };
    const node1 = { above: [], below: [[refNode], []], width: 0 };
    const node2 = { above: [], below: [[], [refNode]], width: 0 };
    expect(isRef(refNode, node1.below[1])).toBe(false);
    expect(isRef(refNode, node2.below[0])).toBe(false);
  });

});

describe('getWidth', () => {
  it('returns the correct width for a node with no nodes below it', () => {
    const node = {
      id: 1,
      width: 50,
      below: [],
    };

    const result = getWidth(node);

    expect(result).toEqual(50);
  });
});

describe('getPosition', () => {
  it('returns 0 if the node has no reference node', () => {
    const node = {
      id: 1,
      width: 10,
      above: [],
      below: [],
    };
    const position = getPosition(node);
    expect(position).toBe(0);
  });
});

test('setBalancedWeight() handles empty input', () => {
  const nodes = new Map();

  const result = setBalancedWeight(nodes);

  expect(result).toEqual(new Map());
});

test('centerNodes() handles empty input', () => {
  const nodes = [];

  const result = centerNodes(nodes);

  expect(result).toEqual([]);
});

test('setBalancedWidthAndPosition() handles empty input', () => {
  const nodes = new Map();

  const result = setBalancedWidthAndPosition(nodes);

  expect(result).toEqual(new Map());
});

describe('getStateBoundingRect', () => {
  it('should return a default bounding rect for an invalid state element', () => {
    document.body.innerHTML = '';

    const expected = {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      toJSON: expect.any(Function),
    };

    const result = getStateBoundingRect('test');

    expect(result).toEqual(expected);
  });
});
