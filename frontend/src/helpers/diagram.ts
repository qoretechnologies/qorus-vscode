import _, { noop } from 'lodash';

/**
 * Graph node with all its attributes and nodes above and below.
 *
 * Nodes `above` are all nodes with edges pointing to this nodes.
 *
 * Nodes `below` are nodes with edges pointing to them from this
 * node. Nodes below divided by depth below this node.
 *
 * Both nodes `above` and `below` are sorted with heaviest and deepest
 * nodes in the center.
 *
 * Attribute `depth` is a level from the beginning of the graph
 * starting from zero for the root node.
 *
 * Attribute `weight` is node's own weight (1) plus a sum of weights
 * of all nodes below divided by their number of nodes above.
 *
 * Attribute `width` represents how wide is current branch - the
 * widest number of nodes below for all descendants.
 *
 * Attribute `position` is a relative position among nodes below
 * sharing the same nodes above. Zero means the middle, negative
 * numbers are on the left and positive numbers are on the right.
 *
 * @typedef {{
 *   id: number,
 *   above: !Array<!GraphNode>,
 *   below: !Array<!Array<!GraphNode>>,
 *   depth: number,
 *   weight: number,
 *   width: number,
 *   position: number,
 * }} GraphNode
 */

/**
 * Internal structure used by this module while processing graph
 * nodes.
 *
 * @typedef {{
 *   id: number,
 *   above: !Array<number>,
 *   below: !Array<number>,
 *   depth: number,
 *   weight: number,
 * }} TempGraphNode
 */

/**
 * Direction for node comparator.
 *
 * @enum {number}
 */
const Dir = {
  ASC: +1,
  DESC: -1,
};

/**
 * Returns node comparator.
 *
 * Nodes are compared based on product of their depth and weight.
 *
 * @param {Dir} dir
 * @return {function(!GraphNode, !GraphNode): number}
 */
function createComparator(dir) {
  return function compare(a, b) {
    return dir * (a.depth * a.weight - b.depth * b.weight);
  };
}

/**
 * Returns new dependency map with dependencies declared before used.
 *
 * @param {!Object<number, !Array<number>>} deps
 * @return {!Map<number, !Array<number>>}
 */
function normalize(deps) {
  function ensureSafeSet(map, id) {
    if (map.has(id)) {
      return;
    }

    deps[id].forEach((dId) => ensureSafeSet(map, dId));
    map.set(id, deps[id].slice());
  }

  return Object.keys(deps).reduce((map, id) => {
    ensureSafeSet(map, parseInt(id, 10));

    return map;
  }, new Map());
}

/**
 * Initializes node structure.
 *
 * @param {number} id
 * @return {!TempGraphNode}
 */
function create(id) {
  return {
    id,
    above: [],
    below: [],
    depth: 0,
    weight: 1,
  };
}

/**
 * Adds cross-references below and above.
 *
 * @param {!TempGraphNode} above
 * @param {!TempGraphNode} below
 * @return {!Array<!TempGraphNode>} 0: above, 1: below
 */
function add(above, below) {
  const na = Object.assign({}, above, {
    below: above.below.concat(below.id),
  });
  const nb = Object.assign({}, below, {
    above: below.above.concat(above.id),
  });

  return [na, nb];
}

/**
 * Sets balanced depth on all nodes in the graph.
 *
 * Nodes on the same depth always share the same nodes above. Other
 * nodes can be on that depth level too if they do not share any other
 * node above - i.e., there are no conflicts. The root node which has
 * no nodes above has depth of zero.
 *
 * @param {!Map<number, !TempGraphNode>} nodes
 * @return {!Map<number, !TempGraphNode>}
 */
function setBalancedDepth(nodes) {
  const balanced = new Map();

  const nodesAboveEql = (n, tmp, bId) =>
    n.above.length === tmp.get(bId).above.length &&
    n.above.every((na, i) => na === tmp.get(bId).above[i]);
  const isKnown = (tmp, aId) => tmp.get(aId).below.some((bId) => tmp.has(bId));
  const nextDepth = (tmp, d, bId) => Math.max(d, tmp.get(bId).depth + 1);

  for (const [id, n] of nodes) {
    let depth;

    const commonId = [...balanced.keys()].reverse().find(nodesAboveEql.bind(null, n, balanced));
    depth = balanced.has(commonId) && balanced.get(commonId).depth;

    if (!depth && !n.above.some(isKnown.bind(null, balanced))) {
      depth = n.above.reduce(nextDepth.bind(null, balanced), 0);
    }

    if (!depth) {
      depth = [...balanced.keys()].reduce(nextDepth.bind(null, balanced), 0);
    }

    balanced.set(id, Object.assign({}, n, { depth }));
  }

  return balanced;
}

/**
 * Tries to find reference node from nodes above.
 *
 * Refence node is in the center of nodes above. However, nodes above
 * can be empty (in case of root node), so `null` can be returned.
 *
 * @param {!GraphNode} node
 * @return {GraphNode}
 */
function findRef(node) {
  const centerIdx = Math.floor(node.above.length / 2);

  return node.above[centerIdx] || null;
}

/**
 * Checks if given `node` is a reference node above for nodes `below`.
 *
 * It is enough to check the first node from nodes below, because they
 * are expected to be on the same depth level and therefore share the
 * same nodes above. If this condition is not met, the result can be
 * absolutely random.
 *
 * Given the expectation above, it best to use this function to filter
 * depth level below given `node` which are associated to it (e.g., to
 * find reference to position nodes below).
 *
 * @param {!GraphNode} node
 * @param {!Array<!GraphNode>} nodesBelow
 * @return {boolen}
 * @see findRef
 * @see setBalancedDepth
 */
function isRef(node, nodesBelow) {
  return nodesBelow.length > 0 && findRef(nodesBelow[0]) === node;
}

/**
 * Computes node width from nodes below it.
 *
 * The resulting width is a sum of widths from nodes below. Only
 * widths from nodes whose reference node is given `node` are
 * counted. If there is no node below, currently set node's width is
 * returned.
 *
 * @param {!GraphNode} node
 * @return {number}
 */
function getWidth(node) {
  const width = Math.max(
    node.width,
    node.below
      .filter(isRef.bind(null, node))
      .reduce((ws, nbs) => ws + nbs.reduce((w, nb) => w + nb.width, 0), 0)
  );

  return width;
}

/**
 * Computes node's relative position to its reference node.
 *
 * Positions on the left are negative. Position on the right are
 * positive. Default position (if there is no reference node) is zero.
 *
 * @param {!GraphNode} node
 * @return {number}
 */
function getPosition(node) {
  const ref = findRef(node);
  const lvl = ref && ref.below.find(isRef.bind(null, ref));
  const pos = lvl && lvl.findIndex((nb) => nb === node);

  return ref ? pos - (lvl.length - 1) / 2 : 0;
}

/**
 * Sets balanced weight on all nodes in the graph.
 *
 * Weight of a node is shared among all its nodes above. Therefore,
 * nodes above has a weight of their own plus sum of weights of their
 * nodes below divided by number of those nodes' nodes above.
 *
 * @param {!Map<number, !TempGraphNode>} node
 * @return {!Map<number, !TempGraphNode>}
 */
function setBalancedWeight(nodes) {
  const balanced = new Map();

  for (const [id, n] of [...nodes.entries()].reverse()) {
    balanced.set(id, Object.assign({}, n));
    for (const bId of balanced.get(id).below) {
      balanced.get(id).weight += balanced.get(bId).weight / balanced.get(bId).above.length;
    }
  }

  return new Map([...balanced.entries()].reverse());
}

/**
 * Sorts nodes so that the heaviest and deepest nodes in the center.
 *
 * @param {!Array<!GraphNode>} nodes
 * @return {!Array<!GraphNode>}
 */
function centerNodes(nodes) {
  const sorted = nodes.slice().sort(createComparator(Dir.ASC));

  const even = sorted.filter((n, i) => i % 2 === 0);
  const odd = sorted.filter((n, i) => i % 2 === 1);

  return even.concat(odd.reverse());
}

/**
 * Sets balanced width and position on all nodes in the graph.
 *
 * Nodes above and below are transformed so that they comply with
 * {@link GraphNode} contract. Then, width and position is computed.
 *
 * @param {!Map<number, !TempGraphNode>} node
 * @return {!Map<number, !GraphNode>}
 * @see centerNodes
 * @see getWidth
 * @see getPosition
 */
function setBalancedWidthAndPosition(nodes) {
  const balanced = new Map();

  const toExport = (exported, id) => exported.get(id);

  const divideByDepth = (n, tmp, b, bId) => {
    const below = b.slice();

    const relDepth = tmp.get(bId).depth - n.depth - 1;

    for (let i = relDepth; i >= 0; i -= 1) {
      if (below[i]) break;

      below[i] = [];
    }

    below[relDepth].push(bId);

    return below;
  };

  for (const [id, n] of nodes) {
    balanced.set(id, Object.assign({}, n));

    balanced.get(id).above = centerNodes(balanced.get(id).above.map(toExport.bind(null, balanced)));

    balanced.get(id).below = n.below.reduce(divideByDepth.bind(null, n, nodes), []);

    balanced.get(id).width = 1;
  }

  const belowToExport = (tmp, bIds) => centerNodes(bIds.map(toExport.bind(null, tmp)));

  for (const n of balanced.values()) {
    n.below = n.below.map(belowToExport.bind(null, balanced));
  }

  for (const n of [...balanced.values()].reverse()) {
    n.width = getWidth(n);
  }

  for (const n of balanced.values()) {
    n.position = getPosition(n);
  }

  return balanced;
}

/**
 * Makes sure graph is balanced.
 *
 * It also makes transition from temporary {@link TempGraphNode}
 * structure to {@link GraphNode}.
 *
 * @param {!Object<number, !TempGraphNode>} nodes
 * @return {!Object<number, !GraphNode>}
 * @see setBalancedDepth
 * @see setBalancedWeight
 * @see setBalancedWidthAndPosition
 */
function balance(nodes) {
  return _.flow([setBalancedDepth, setBalancedWeight, setBalancedWidthAndPosition])(nodes);
}

/**
 * Returns root node of balanced directional graph.
 *
 * Graph is organized with a root on the top. Each node can have many
 * node above and below. The root node has no node above.
 *
 * Dependency map assigns nodes to particular node. These nodes are
 * above that particular node. Nodes are referenced as number
 * identifiers.
 *
 * It is expected that given dependency map does not contain any
 * cycles but no attempt to detect them is made.
 *
 * @param {!Object<number, !Array<number>>} deps
 * @return {!Map<number, !GraphNode>}
 * @see balance
 */
export function graph(deps) {
  const normalized = normalize(deps);
  const nodes = new Map();

  for (const id of normalized.keys()) {
    nodes.set(id, create(id));
  }

  for (const [id, ds] of normalized) {
    for (const depId of ds) {
      const [above, below] = add(nodes.get(depId), nodes.get(id));
      nodes.set(above.id, above);
      nodes.set(below.id, below);
    }
  }

  return balance(nodes);
}

export const getStateBoundingRect = (stateId: string): DOMRect => {
  const state = document.getElementById(`state-${stateId}`);

  if (!state) {
    return {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      toJSON: noop,
    };
  }

  return state.getBoundingClientRect();
};
