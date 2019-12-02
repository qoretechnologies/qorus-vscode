// @flow
import React, { Component, useState, useEffect } from 'react';
import classNames from 'classnames';

import onlyUpdateForKeys from 'recompose/onlyUpdateForKeys';
import { graph } from '../../helpers/diagram';
import { reduce, map, size, forEach } from 'lodash';
import { FieldName, FieldType } from '../FieldSelector';
import withTextContext from '../../hocomponents/withTextContext';
import withMessageHandler from '../../hocomponents/withMessageHandler';
import { Messages } from '../../constants/messages';

/**
 * Typical list of arguments for step-specific functions.
 *
 * These arguments resemble typical array iterators like `forEach` or
 * `map`.
 *
 * @typedef {{
 *   stepId: number,
 *   colIdx: number,
 *   row: Array<number>,
 *   rowIdx: number
 * }} StepArgs
 */

/**
 * Identifier of helper root (start) step.
 */
const ROOT_STEP_ID = 0;

/**
 * Identifier of null (connecting) step.
 * 
 * This is an empty node through which a line is going
 * connecting actual parent and child.
 */
const NULL_STEP_ID = -1;

/**
 * Identifier of connection node.
 * 
 * This node is describing the connection between a group of parent nodes
 * from one row and a group of children nodes from the next row.
 */
const CONNECTION_NODE_STEP_ID = -2;

/**
 * Width of one box on a diagram in SVG user units.
 */
const BOX_MIN_WIDTH = 250;

/**
 * Approximate width of one character of box text in SVG user units.
 *
 * It an approximate width of letter "n".
 */
// const BOX_CHARACTER_WIDTH = 10;

/**
 * Ration between width and height.
 */
const BOX_DIMENSION_RATIO = 3 / 1;

/**
 * Margin between boxes.
 *
 * It expected that this margin behaves similarly to margins CSS for
 * HTML. For example, a box at the edge of diagram has a full margin
 * width diagram border and box. But between boxes margin overlap --
 * in terms of SVG, each is shifted a half of margin in each direction
 * compared to a case without margins.
 */
const BOX_MARGIN = 20;

/**
 * Box rounded corner radius.
 */
const BOX_ROUNDED_CORNER = 5;

/**
 * Height of a step box.
 */
const BOX_HEIGHT = BOX_MIN_WIDTH / BOX_DIMENSION_RATIO;

/**
 * Horizontal margin between boxes.
 */
const BOX_H_MARGIN = BOX_MARGIN / 3;

/**
 * Vertical margin between boxes.
 */
const BOX_V_MARGIN = BOX_MARGIN * 4;

/**
 * Half of vertical margin between boxes.
 */
const BOX_V_MARGIN_HALF = BOX_V_MARGIN / 2;

/**
 * One seventh of vertical margin between boxes.
 */
const BOX_V_MARGIN_SMALL = BOX_V_MARGIN / 7;

/**
 * Radius of connection circle.
 */
const CONN_CIRCLE_R = 5;

/**
 * Radius of root node circle.
 */
const ROOT_CIRCLE_R = 22;

/**
 * Minimal numbers of columns diagram must have.
 */
const DIAGRAM_MIN_COLUMNS = 1;

/**
 * Diagram with functions and dependencies between them.
 *
 * The diagram is a SVG drawn by rows which are computed from `steps`
 * dependency graph which is a member of workflow object.
 *
 * Every step (function) is clickable and displays modal with details
 * about that function including its source code. The source code must
 * be fetched via API as it is not usually part of the workflow
 * object.
 */
export interface IStepDiagramProps {
    steps: { [key: string]: number[] };
    highlightedGroupSteps: any;
}

/**
 * Helper step counter. Used for assigning internal step node IDs.
 */
let StepCounter: number = 0;

/**
 * Position of an element in the grid.
 */
class GridElementPosition {
    level: number;
    rowPos: number;

    constructor(level, rowPos) {
        this.level = level;
        this.rowPos = rowPos;
    }
}

class StepNode {
    id: number = NULL_STEP_ID;
    internalId: number = 0;
    level: number = 0;
    children: Array<StepNode> = [];
    parents: Array<StepNode> = [];
    connectionNode: StepNode | undefined = undefined;

    constructor(id?: number, level?: number) {
        this.internalId = ++StepCounter;
        if (id !== undefined) {
            this.id = id;
        }
        if (level !== undefined) {
            this.level = level;
        }
    }

    /**
     * Is this a null step?
     */
    isNull(): boolean {
        return (this.id === NULL_STEP_ID);
    }

    /**
     * Is this a null step with no children and no parents?
     */
    isLoneNull() {
        return (
            this.isNull() &&
            (this.children.length === 0) &&
            (this.parents.length === 0)
        );
    }

    /**
     * Is this the root step?
     */
    isRoot(): boolean {
        return (this.id === ROOT_STEP_ID);
    }
}

/**
 * Check if nodes are the same node.
 * @param a first node
 * @param b second node
 */
function sameNodes(a: StepNode, b: StepNode): boolean {
    if (a.id != b.id) {
        return false;
    }

    if (!a.isNull()) {
        return true;
    }

    if (a.internalId == b.internalId) {
        return true;
    }

    return false;
}

/**
 * Check if two arrays contain the same nodes.
 * @param a first node array
 * @param b second node array
 */
function equalNodeArray(a: Array<StepNode>, b: Array<StepNode>): boolean {
    if (a.length != b.length) {
        return false;
    }
    for (const anode of a) {
        let contains = false;
        for (const bnode of b) {
            if (sameNodes(anode, bnode)) {
                contains = true;
                break;
            }
        }
        if (!contains) {
            return false;
        }
    }
    return true;
}

/**
 * Check if a node array contains a specific node.
 * @param arr array to check
 * @param node node which we want to chexk
 */
function arrayContainsNode(arr: Array<StepNode>, node: StepNode): boolean {
    for (const arrNode of arr) {
        if (sameNodes(arrNode, node)) {
            return true;
        }
    }
    return false;
}

/**
 * Remove a specific node from an array.
 * @param arr array from which to remove a node
 * @param node node to remove
 */
function removeNodeFromArray(arr: Array<StepNode>, node: StepNode) {
    for (let x = 0; x < arr.length; ++x) {
        let arrNode = arr[x];
        if (sameNodes(arrNode, node)) {
            arr.splice(x, 1);
            break;
        }
    }
}

class StepNodeGrid {
    private _cols: number = 0;
    private _grid: Array<Array<StepNode>> = new Array<Array<StepNode>>();

    getColCount(): number {
        return this._cols;
    }

    getRowCount(): number {
        return this._grid.length;
    }

    getRow(row: number): Array<StepNode> {
        return this._grid[row];
    }

    getFirstRow(): Array<StepNode> {
        return this.getRow(0);
    }

    getLastRow(): Array<StepNode> {
        return this.getRow(this.getRowCount() - 1);
    }

    addRow() {
        let newRow = new Array<StepNode>();
        for (let index = 0; index < this._cols; ++index) {
            newRow.push(new StepNode());
        }
        this._grid.push(newRow);
    }

    addColumnFront() {
        for (const row of this._grid) {
            row.unshift(new StepNode());
        }
        this._cols += 1;
    }

    addColumnBack() {
        for (const row of this._grid) {
            row.push(new StepNode());
        }
        this._cols += 1;
    }

    getGridArray(): Array<Array<StepNode>> {
        return this._grid;
    }

    findGridElemPos(elem: StepNode): GridElementPosition | undefined {
        for (let level = 0; level < this._grid.length; ++level) {
            let row = this._grid[level];
            for (let rowPos = 0; rowPos < row.length; ++rowPos) {
                let rowElem = row[rowPos];
                if (sameNodes(elem, rowElem)) {
                    return new GridElementPosition(level, rowPos); 
                }
            }
        }
        return undefined;
    }
}

class DefferedAssignment {
    stepNode: StepNode;
    parentId: number;

    constructor(stepNode: StepNode, parentId: number) {
        this.stepNode = stepNode;
        this.parentId = parentId;
    }
}

class GridConnection {
    parents: Array<StepNode> = [];
    children: Array<StepNode> = [];
}

class GridBuilder {
    /**
     * Find a step node in a tree.
     * @param startNode node from which to start searching
     * @param stepNodeId id of step node we want to find
     */
    static findStepNodeById(startNode: StepNode, stepNodeId: number): StepNode | undefined {
        if (startNode.id === stepNodeId) {
            return startNode;
        }
        for (const child of startNode.children) {
            let result = GridBuilder.findStepNodeById(child, stepNodeId);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    /**
     * Recursively assign levels to the steps in a tree.
     * 
     * @param node 
     * @param level 
     */
    static setStepNodeLevels(node: StepNode, level: number) {
        if (node.level < level) {
            node.level = level;
        }
        for (const child of node.children) {
            GridBuilder.setStepNodeLevels(child, node.level + 1);
        }
    }

    /**
     * Fill in null step nodes in-between parents and children in a tree.
     * 
     * This is done for parents and children which are farther away
     * from each other than 1 level.
     * 
     * @param node root node from which to start
     */
    static fillInNullStepNodes(node: StepNode) {
        let newList = [];
        for (const child of node.children) {
            if ((node.level + 1) == child.level) { // child is direct child
                newList.push(child);
            } else { // empty levels between node and child -> fill in a null step node
                // possible optimization here - create all the null nodes between
                // node and child right here in one step, instead of gradually
                // in the recursive calls

                // remove original parent
                let parentNode: StepNode | undefined = undefined;
                for (let i = 0; i < child.parents.length; ++i) {
                    let parent = child.parents[i];
                    if (parent.id == node.id) {
                        if (node.isNull()) {
                            if (node.internalId == parent.internalId) {
                                parentNode = child.parents.splice(i, 1)[0];
                                break;
                            }
                        } else {
                            parentNode = child.parents.splice(i, 1)[0];
                            break;
                        }
                    }
                }

                if (parentNode === undefined) {
                    console.log("could not find parentNode of child: ", child);
                    console.log("node: ", node);
                }

                // add new null step node and assign it as a parent of the child node
                // and assign the original parent node as parent of the null node
                let nullStepNode = new StepNode(NULL_STEP_ID, node.level + 1);
                child.parents.push(nullStepNode);
                nullStepNode.parents.push(parentNode);
                nullStepNode.children.push(child);
                newList.push(nullStepNode);
            }
        }
        node.children = newList;

        for (const child of node.children) {
            GridBuilder.fillInNullStepNodes(child);
        }
    }

    /**
     * Go through the rows and merge null steps with same children.
     * @param rows rows to check
     */
    static mergeNullStepsWithSameChildren(rows: Array<Array<StepNode>>) {
        // merge null steps with same children
        for (let level = rows.length - 2; level >= 1; --level) {
            let row = rows[level];
            for (let rowPos = 0; rowPos < row.length; ++rowPos) {
                let firstNode = row[rowPos];
                if (!firstNode.isNull()) {
                    continue;
                }
                for (let x = 0; x < row.length; ++x) {
                    let secondNode = row[x];
                    if (!secondNode.isNull()) {
                        continue;
                    }
                    if (sameNodes(firstNode, secondNode)) {
                        continue;
                    }
                    if (!equalNodeArray(firstNode.children, secondNode.children)) {
                        continue;
                    }

                    // first and second are both null steps, have same children
                    // and arent the same null step node -> merge them

                    // assign parents of the second one to the first one
                    // and assign the first node as child to the parents
                    for (const parent of secondNode.parents) {
                        // remove the second node from parents
                        removeNodeFromArray(parent.children, secondNode);

                        if (arrayContainsNode(firstNode.parents, parent)) {
                            continue;
                        }
                        firstNode.parents.push(parent);
                        parent.children.push(firstNode);
                    }

                    // remove the second node from children
                    for (const child of secondNode.children) {
                        removeNodeFromArray(child.parents, secondNode);
                    }

                    // remove the second node from the row
                    row.splice(x, 1);
                }
            }
        }
    }

    /**
     * Go through the rows and merge null steps with same parents.
     * @param rows rows to check
     */
    static mergeNullStepsWithSameParents(rows: Array<Array<StepNode>>) {
        // merge null steps with same parents
        for (let level = rows.length - 2; level >= 1; --level) {
            let row = rows[level];
            for (let rowPos = 0; rowPos < row.length; ++rowPos) {
                let firstNode = row[rowPos];
                if (!firstNode.isNull()) {
                    continue;
                }
                for (let x = 0; x < row.length; ++x) {
                    let secondNode = row[x];
                    if (!secondNode.isNull()) {
                        continue;
                    }
                    if (sameNodes(firstNode, secondNode)) {
                        continue;
                    }
                    if (!equalNodeArray(firstNode.parents, secondNode.parents)) {
                        continue;
                    }

                    // first and second are both null steps, have same parents
                    // and arent the same null step node -> merge them

                    // assign children of the second one to the first one
                    // and assign the first node as parents to the children
                    for (const child of secondNode.children) {
                        // remove the second node from children
                        removeNodeFromArray(child.parents, secondNode);

                        if (arrayContainsNode(firstNode.children, child)) {
                            continue;
                        }
                        firstNode.children.push(child);
                        child.parents.push(firstNode);
                    }

                    // remove the second node from parents
                    for (const parent of secondNode.parents) {
                        removeNodeFromArray(parent.children, secondNode);
                    }

                    // remove the second node from the row
                    row.splice(x, 1);
                }
            }
        }
    }

    static fillInConnectionNodes(grid: StepNodeGrid) {
        let arr = grid.getGridArray();
        for (let level = 0; level < arr.length; ++level) {
            let connections: Array<GridConnection> = [];
            let row = arr[level];
            for (let rowPos = 0; rowPos < row.length; ++rowPos) {
                let elem = row[rowPos];
                if (elem === undefined) {
                    // shouldn't happen
                    console.log("elem is undefined: ", rowPos);
                    console.log("row: ", row);
                    console.log("arr: ", arr);
                }
                if (elem.isLoneNull()) {
                    continue;
                }
                let addedToConnection = false;
                for (const conn of connections) {
                    if (equalNodeArray(conn.children, elem.children)) {
                        conn.parents.push(elem);
                        addedToConnection = true;
                        break;
                    }
                }
                if (!addedToConnection) {
                    let newConn = new GridConnection();
                    newConn.parents.push(elem);
                    for (const child of elem.children) {
                        newConn.children.push(child);
                    }
                    connections.push(newConn);
                }
            }
    
            // create a connection node, assign the children to it
            // and assign the connection node to the parents
            for (const conn of connections) {
                let connectionNode = new StepNode(CONNECTION_NODE_STEP_ID);
                for (const child of conn.children) {
                    connectionNode.children.push(child);
                }
                for (const parent of conn.parents) {
                    connectionNode.parents.push(parent);
                    parent.connectionNode = connectionNode;
                }
            }
        }
        return;
    }

    /**
     * Build a graph/tree of step nodes from the steps parameter.
     * @param steps original steps parameter
     */
    buildGraph(steps): StepNode {
        let rootNode: StepNode = new StepNode(ROOT_STEP_ID);
        let assignLater = new Array<DefferedAssignment>();

        for (let stepKey in steps) {
            if (!steps.hasOwnProperty(stepKey)) {
                continue;
            }
            let stepDeps = steps[stepKey];
            let stepNode: StepNode = new StepNode(parseInt(stepKey));
            if (stepDeps.length === 0) {
                stepNode.parents.push(rootNode);
                rootNode.children.push(stepNode);
                continue;
            }
            for (const dep of stepDeps) {
                let depId = parseInt(dep);
                let parentNode = GridBuilder.findStepNodeById(rootNode, depId);
                if (parentNode !== undefined) {
                    stepNode.parents.push(parentNode);
                    if (!arrayContainsNode(parentNode.children, stepNode)) {
                        parentNode.children.push(stepNode);
                    }
                } else {
                    // parent does not exist yet
                    // store temporarily
                    assignLater.push(new DefferedAssignment(stepNode, depId));
                }
            }
        }

        while (assignLater.length > 0) {
            for (let i = 0; i < assignLater.length; ++i) {
                let item = assignLater[i];
                let parentNode = GridBuilder.findStepNodeById(rootNode, item.parentId);
                if (parentNode !== undefined) {
                    item.stepNode.parents.push(parentNode);
                    if (!arrayContainsNode(parentNode.children, item.stepNode)) {
                        parentNode.children.push(item.stepNode);
                    }
                    assignLater.splice(i, 1);
                }
            }
        }

        GridBuilder.setStepNodeLevels(rootNode, ROOT_STEP_ID);
        GridBuilder.fillInNullStepNodes(rootNode);
        return rootNode;
    }

    /**
     * Build a list of rows of step nodes from the graph.
     * @param rootNode root node of the step node graph
     */
    buildRows(rootNode: StepNode): Array<Array<StepNode>> {
        let rows = new Array<Array<StepNode>>();
        let handleNode = (rows: Array<Array<StepNode>>, node: StepNode) => {
            while (rows.length <= node.level) {
                rows.push(new Array<StepNode>());
            }
            if (!arrayContainsNode(rows[node.level], node)) {
                rows[node.level].push(node);
                for (const child of node.children) {
                    handleNode(rows, child);
                }
            }
        };
        handleNode(rows, rootNode);
        GridBuilder.mergeNullStepsWithSameChildren(rows);
        GridBuilder.mergeNullStepsWithSameParents(rows);
        GridBuilder.mergeNullStepsWithSameParents(rows);
        return rows;
    }

    /**
     * Build a final grid layout for the step nodes.
     * @param rows rows of the step nodes
     */
    buildGrid(rows: Array<Array<StepNode>>): StepNodeGrid {
        let grid = new StepNodeGrid();
        grid.addColumnBack();

        let getCenterOfRow = (cols: number) => {
            return Math.trunc(cols / 2);
        };

        let findParentPos = (parent: StepNode, node: StepNode, row: Array<StepNode>): number => {
            for (let i = 0; i < row.length; ++i) {
                if (row[i].id == parent.id) {
                    if (parent.isNull() && row[i].internalId != parent.internalId) {
                        continue;
                    }
                    for (const child of parent.children) {
                        if (child.id == node.id) {
                            return i;
                        }
                    }
                }
            }
            return -1;
        };

        let findParentPositions = (node: StepNode): Array<number> => {
            let positions = new Array<number>();
            for (const parent of node.parents) {
                let pos = findParentPos(parent, node, grid.getRow(parent.level));
                if (pos == -1) {
                    throw Error("couldn't find parent position");
                }
                positions.push(pos);
            }
            return positions;
        };

        for (let index = 0; index < rows.length; ++index) {
            const row = rows[index];

            // add new row to grid
            grid.addRow();

            let gridRow = grid.getLastRow();
            for (const node of row) {
                let cols = grid.getColCount();
                let center = getCenterOfRow(cols);

                // put root node in the center
                if (node.isRoot()) {
                    gridRow[center] = node;
                    continue;
                }

                let parentPositions = findParentPositions(node);
                let finalPos: number = -1;

                // test directly under parent positions
                for (const pos of parentPositions) {
                    if (gridRow[pos].isLoneNull()) {
                        finalPos = pos;
                        break;
                    }
                }
                if (finalPos > -1) {
                    gridRow[finalPos] = node;
                    continue;
                }

                // test gradually getting farther from the parent positions
                let frontPos = 0;
                let backPos = cols - 1;
                for (let dist = 1; dist < cols; ++dist) {
                    for (const pos of parentPositions) {
                        let leftOfCenter: boolean = (pos <= center);
                        let testDist = leftOfCenter ? dist : -dist;

                        // first try closer to center
                        let testPos = pos + testDist;
                        if (testPos >= frontPos && testPos <= backPos && gridRow[testPos].isLoneNull()) {
                            finalPos = testPos;
                            break;
                        }

                        // then try farther from center
                        testPos = pos - testDist;
                        if (testPos >= frontPos && testPos <= backPos && gridRow[testPos].isLoneNull()) {
                            finalPos = testPos;
                            break;
                        }
                    }
                    if (finalPos > -1) {
                        break;
                    }
                }

                // place node if we have found emtpy space
                if (finalPos > -1) {
                    gridRow[finalPos] = node;
                    continue;
                }

                // no space -> we have to widen the grid
                // first find position of root node
                let firstGridRow = grid.getFirstRow();
                //console.log("have to widen the grid; firstGridRow.len: ", firstGridRow.length);
                for (let i = 0; i < firstGridRow.length; ++i) {
                    if (firstGridRow[i].isRoot()) { 
                        // if root is left of center, add column in the left (front) of grid
                        // and vice versa
                        if (i < center) {
                            grid.addColumnFront();
                            gridRow[0] = node;
                        } else {
                            grid.addColumnBack();
                            gridRow[cols] = node;
                        }
                        break;
                    }
                }
            }
        }

        // fill in connection nodes to the step nodes
        GridBuilder.fillInConnectionNodes(grid);

        return grid;
    }
}

@withTextContext()
@onlyUpdateForKeys(['highlightedGroupSteps', 'steps', 'stepsData', 't'])
export default class StepDiagram extends Component<IStepDiagramProps> {
    state = {
        nodes: null,
        rows: null,
        graph: null,
        rows2: null,
        grid: null,
        highlightedSteps: this.props.highlightedGroupSteps || [],
    };

    getGridTotalWidth() {
        let cols = this.state.grid.getColCount();
        return cols * BOX_MIN_WIDTH + (cols-1) * BOX_H_MARGIN;
    }

    getGridTotalHeight() {
        let rows = this.state.grid.getRowCount();
        return rows * BOX_HEIGHT + (rows) * BOX_V_MARGIN;
    }

    getGridElemHCenter(level: number, rowPos: number) {
        return (BOX_MIN_WIDTH / 2) + rowPos * (BOX_MIN_WIDTH + BOX_H_MARGIN);
    }

    getGridElemVCenter(level: number) {
        return (BOX_HEIGHT / 2) + level * (BOX_HEIGHT + BOX_V_MARGIN);
    }

    getGridElemLeftCoord(level: number, rowPos: number) {
        return this.getGridElemHCenter(level, rowPos) - (BOX_MIN_WIDTH / 2);
    }

    getGridElemTopCoord(level: number) {
        return this.getGridElemVCenter(level) - (BOX_HEIGHT / 2);
    }

    getGridElemBottomCoord(level: number) {
        return this.getGridElemVCenter(level) + (BOX_HEIGHT / 2);
    }

    getGridElemTransform(level: number, rowPos: number) {
        return `translate(${(BOX_MIN_WIDTH + BOX_H_MARGIN) * rowPos} ${this.getGridElemTopCoord(level)})`;
    }

    getGridRootElemTransform(level: number, rowPos: number) {
        return `translate(${this.getGridElemHCenter(level, rowPos)} ${this.getGridElemVCenter(level)})`;
    }

    findChildGridPos(child: StepNode): GridElementPosition | undefined {
        return this.state.grid.findGridElemPos(child);
    }

    renderGridPath(startX, startY, endX, endY) {
        return (
            <path
                fill="none"
                stroke="#aaa"
                d={`M${startX},${startY} L${endX},${endY}`}
            />
        );
    }

    renderGrid2PartPath(startX, startY, middleX, middleY, endX, endY) {
        return (
            <path
                fill="none"
                stroke="#aaa"
                d={`M${startX},${startY} L${middleX},${middleY} L${endX},${endY}`}
            />
        );
    }

    findGridBoxConnectionPos(conn: StepNode): GridElementPosition | undefined {
        if (conn.children.length == 0) {
            // no children therefore no connection node position exists
            return undefined;
        }

        let childPositions = [];
        let combinedLevel = 0;
        let combinedRowPos = 0;
        let count = 0;
        for (const child of conn.children) {
            let childPos = this.findChildGridPos(child);
            if (childPos !== undefined) {
                childPositions.push(childPos);
                combinedLevel += childPos.level;
                combinedRowPos += childPos.rowPos;
                count += 1;
            }
        }
        if (count == 0) {
            // no children therefore no connection node position exists
            return undefined;
        }
        combinedLevel /= count;
        combinedRowPos /= count;
        return new GridElementPosition(combinedLevel, combinedRowPos);
    }

    renderGridConnectionCircle(posX: number, posY: number) {
        return (
            <circle cx={posX} cy={posY} r={CONN_CIRCLE_R} fill="#aaa" />
        );
    }

    renderGridConnectionBeginCircle(conn: StepNode, posX: number, posY: number) {
        if (conn.parents.length > 1) {
            return this.renderGridConnectionCircle(posX, posY);
        }
        return undefined;
    }

    renderGridConnectionEndCircle(conn: StepNode, posX: number, posY: number) {
        if (conn.children.length > 1) {
            return this.renderGridConnectionCircle(posX, posY);
        }
        return undefined;
    }

    renderGridConnectionChildPath(conn: StepNode, child: StepNode, connPos: GridElementPosition, level: number, rowPos: number) {
        let childPos = this.findChildGridPos(child);
        if (childPos === undefined) {
            return undefined;
        }

        let startX = this.getGridElemHCenter(connPos.level, connPos.rowPos);
        let startY = this.getGridElemTopCoord(connPos.level) - BOX_V_MARGIN_HALF + BOX_V_MARGIN_SMALL;
        let endX = this.getGridElemHCenter(childPos.level, childPos.rowPos);
        let endY = this.getGridElemTopCoord(childPos.level);
        let middleY = endY - BOX_V_MARGIN_SMALL;
        return this.renderGrid2PartPath(startX, startY, endX, middleY, endX, endY);
    }

    renderGridBoxConnection(elem: StepNode, level: number, rowPos: number) {
        if (elem.children.length == 0) {
            return undefined;
        }

        let connPos = this.findGridBoxConnectionPos(elem.connectionNode);
        if (connPos === undefined) {
            // no position therefore nothing to draw
            console.log("could not find connection node position: ", elem);
            return undefined;
        }

        let startX = this.getGridElemHCenter(level, rowPos);
        let startY = this.getGridElemBottomCoord(level);
        let middleY = startY + BOX_V_MARGIN / 8;
        let endX = this.getGridElemHCenter(connPos.level, connPos.rowPos);
        let endY = this.getGridElemTopCoord(connPos.level) - BOX_V_MARGIN_HALF;

        // root node is aligned above the center of the connection circle
        if (elem.isRoot()) {
            startX = endX;
        }

        let beginCircleY = endY - BOX_V_MARGIN_SMALL;
        let endCircleY = endY + BOX_V_MARGIN_SMALL;
        return (
            <g>
                {this.renderGridConnectionBeginCircle(elem.connectionNode, endX, beginCircleY)}
                {this.renderGridConnectionEndCircle(elem.connectionNode, endX, endCircleY)}
                {this.renderGrid2PartPath(startX, startY, startX, middleY, endX, beginCircleY)}
                {this.renderGridPath(endX, beginCircleY, endX, endCircleY)}
                {elem.connectionNode.children.map((value, index) => {
                    return this.renderGridConnectionChildPath(elem.connectionNode, value, connPos, level, rowPos);
                })}
            </g>
        );
    }

    renderGridBoxElem(row: Array<StepNode>, elem: StepNode, level: number, rowPos: number) {
        const { stepsData, steps, t } = this.props;
        const { highlightedSteps } = this.state;
        return (
            <g>
                <g
                    className={classNames({
                        diagram__box: true,
                    })}
                    fill="transparent"
                    transform={this.getGridElemTransform(level, rowPos)}
                >
                    <rect {...this.getDefaultParams()} />
                    <foreignObject x={0} y={0} width={BOX_MIN_WIDTH} height={BOX_HEIGHT}>
                        <StepBox
                            stepsData={stepsData}
                            t={t}
                            highlightedSteps={highlightedSteps}
                            stepId={elem.id}
                            onMouseEnter={() => {
                                // Get the step dependencies
                                const deps: number[] = steps[elem.id];
                                // Check if the step has any dependencies
                                if (deps.length) {
                                    this.setState({
                                        highlightedSteps: [...deps, elem.id],
                                    });
                                }
                            }}
                            onMouseLeave={() => {
                                this.setState({
                                    highlightedSteps: [],
                                });
                            }}
                        />
                    </foreignObject>
                </g>
                {(elem.connectionNode !== undefined)
                ? this.renderGridBoxConnection(elem, level, rowPos)
                : undefined
                }
            </g>
        );
    }

    renderGridNullElem(row: Array<StepNode>, elem: StepNode, level: number, rowPos: number) {
        let x = this.getGridElemHCenter(level, rowPos);
        let startY = this.getGridElemTopCoord(level);
        let endY = this.getGridElemBottomCoord(level);
        return (
            <g>
                {this.renderGridPath(x, startY, x, endY)}
                {(elem.connectionNode !== undefined)
                ? this.renderGridBoxConnection(elem, level, rowPos)
                : undefined
                }
            </g>
        );
    }

    renderGridRootElem(elem: StepNode, level: number, rowPos: number) {
        let connPos = this.findGridBoxConnectionPos(elem.connectionNode);
        let x;
        if (connPos === undefined) {
            x = this.getGridElemHCenter(level, rowPos);
        } else {
            x = this.getGridElemHCenter(connPos.level, connPos.rowPos);
        }
        let circleBottomY = this.getGridElemVCenter(level) + ROOT_CIRCLE_R;

        let endY = this.getGridElemBottomCoord(level);
        return (
            <g>
                <g className={`diagram__box`} transform={
                    (connPos === undefined)
                    ? this.getGridRootElemTransform(level, rowPos)
                    : this.getGridRootElemTransform(level, connPos.rowPos)
                    }
                >
                    <circle cx="0" cy="0" r={ROOT_CIRCLE_R} fill="#ddd" />
                </g>
                {this.renderGridPath(x, circleBottomY, x, endY)}
                {(elem.connectionNode !== undefined)
                ? this.renderGridBoxConnection(elem, level, rowPos)
                : undefined
                }
            </g>
        );
    }

    renderGridElement(row: Array<StepNode>, elem: StepNode, level: number, rowPos: number) {
        if (elem === undefined) {
            // shouldn't happen
            console.log(
                "render elem is undefined: ", elem,
                "; level: ", level,
                " ; rowPos: ", rowPos
            );
            console.log("row: ", row);
            console.log("grid: ", this.state.grid.getGridArray());
        }
        if (elem.isLoneNull()) {
            return undefined;
        } else if (elem.isNull()) {
            return this.renderGridNullElem(row, elem, level, rowPos);
        } else if (elem.isRoot()) {
            return this.renderGridRootElem(elem, level, rowPos);
        } else {
            return this.renderGridBoxElem(row, elem, level, rowPos);
        }
    }

    renderGridRow(row: Array<StepNode>, level: number) {
        let renderedElems = new Array();
        for (let i = 0; i < row.length; ++i) {
            renderedElems.push(this.renderGridElement(row, row[i], level, i));
        }
        return (
            <g>
              {renderedElems}
            </g>
        );
    }

    renderGridRows(gridRows: Array<Array<StepNode>>) {
        let renderedRows = new Array();
        for (let i = 0; i < gridRows.length; ++i) {
            renderedRows.push(this.renderGridRow(gridRows[i], i));
        }
        return (
            <g>
              {renderedRows}
            </g>
        );
    }

    renderGridContent() {
        return (
            <div
                style={{
                    width: this.getGridTotalWidth(),
                    transformOrigin: 'center top',
                    height: this.getGridTotalHeight(),
                    margin: 'auto',
                }}
            >
                <svg viewBox={`0 0 ${this.getGridTotalWidth()} ${this.getGridTotalHeight()}`} className="diagram">
                    {this.renderGridRows(this.state.grid.getGridArray())}
                </svg>
            </div>
        );
    }

    getStepDeps(stepId: number, steps) {
        const initIds = Object.keys(steps).filter(id => steps[id].length <= 0);

        const initialDeps = initIds.map(initId => ({ [initId]: [ROOT_STEP_ID] }));

        const deps = Object.assign({ [ROOT_STEP_ID]: [] }, steps, ...initialDeps);

        return typeof stepId !== 'undefined' ? deps[stepId] : deps;
    }

    /**
     * Computes rows with step identifiers.
     *
     * Steps are placed in a matrix based on their
     * dependencies. Returned matrix has at least {@link
     * DIAGRAM_MIN_COLUMNS} columns. Each row has nodes from equivalent
     * depth with each node positioned relatively to its parent taken
     * width into account.
     *
     * @return {Array<Array<number>>}
     * @see graph
     * @see getStepDeps
     * @see DIAGRAM_MIN_COLUMNS
     */
    componentDidMount() {
        let builder = new GridBuilder();
        let bgraph = builder.buildGraph(this.props.steps);
        let rows2 = builder.buildRows(bgraph);
        let grid = builder.buildGrid(rows2);
        this.setState({
            nodes: graph(this.getStepDeps(undefined, this.props.steps)),
            rows: this.buildRows(graph(this.getStepDeps(undefined, this.props.steps))),
            graph: bgraph,
            rows2: rows2,
            grid: grid,
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.steps !== this.props.steps) {
            let builder = new GridBuilder();
            let bgraph = builder.buildGraph(nextProps.steps);
            let rows2 = builder.buildRows(bgraph);
            let grid = builder.buildGrid(rows2);

            this.setState({
                nodes: graph(this.getStepDeps(undefined, nextProps.steps)),
                rows: this.buildRows(graph(this.getStepDeps(undefined, nextProps.steps))),
                graph: bgraph,
                rows2: rows2,
                grid: grid,
            });
        }

        if (nextProps.highlightedGroupSteps !== this.props.highlightedGroupSteps) {
            this.setState({
                highlightedSteps: nextProps.highlightedGroupSteps,
            });
        }
    }

    buildRows = nodes => {
        const cols = Math.max(DIAGRAM_MIN_COLUMNS, nodes.get(ROOT_STEP_ID).width) - 1;
        const rows = [];
        let newRows = [];
        const savedData = [];

        for (const [id, n] of nodes) {
            if (!rows[n.depth]) {
                rows[n.depth] = new Array(cols);
            }
            if (!newRows[n.depth]) {
                newRows[n.depth] = {};
            }

            let refColMin = cols - 1;
            for (const na of n.above) {
                let col = -1;
                for (const r of rows.slice().reverse()) {
                    col = (r || []).indexOf(na.id);
                    if (col >= 0) {
                        break;
                    }
                }
                refColMin = Math.min(refColMin, col);
            }

            let refColMax = 0;
            for (const na of n.above) {
                let col = -1;
                for (const r of rows.slice().reverse()) {
                    col = (r || []).indexOf(na.id);
                    if (col >= 0) {
                        break;
                    }
                }
                refColMax = Math.max(refColMax, col);
            }

            const refCol = refColMin + (refColMax - refColMin) / 2;
            let col = Math.round(refCol + n.position * n.width * 2);

            // Check if this depth and position already exists
            while (
                savedData.includes(`${n.depth}-${col}`) ||
                savedData.includes(`${n.depth}-${col - 1}`) ||
                savedData.includes(`${n.depth}-${col + 1}`)
            ) {
                // Add 1 to the column
                col += 1;
            }
            // save the depth and column
            savedData.push(`${n.depth}-${col}`);
            newRows[n.depth][col] = { id };
            rows[n.depth][col] = id;
        }

        return newRows;
    }

    /**
     * Returns rows in a flat array suitable for iteration.
     *
     * @return {Array<StepArgs>}
     * @see getRows
     */
    getFlattenRows() {
        return reduce(
            this.state.rows,
            (res, rowData, rowIdx) => [
                ...res,
                ...map(rowData, ({ id }, colIdx) => ({
                    stepId: id,
                    colIdx: parseInt(colIdx),
                    rowIdx,
                })),
            ],
            []
        );
    }

    /**
     * Returns arguments for step render methods.
     *
     * @param {number} stepId
     * @return {StepArgs}
     * @see getFlattenRows
     */
    getStepArgs(stepId) {
        return this.getFlattenRows().find(s => s.stepId === stepId) || null;
    }

    /**
     * Returns flatten dependencies between steps.
     *
     * @return {Array<{
     *   start: StepArgs,
     *   end: StepArgs
     * }>}
     * @see getFlattenRows
     * @see getStepDeps
     * @see getStepArgs
     */
    getFlattenDeps() {
        return this.getFlattenRows().reduce(
            (flatten, step) =>
                flatten.concat(
                    this.getStepDeps(step.stepId, this.props.steps).map(depId => ({
                        start: this.getStepArgs(depId),
                        end: step,
                    }))
                ),
            []
        );
    }

    /**
     * Returns width of a box.
     *
     * The box width is determined from the longest step name but cannot
     * be less than {@link BOX_MIN_WIDTH}.
     *
     * @return {number}
     * @see getMaxTextWidth
     * @see BOX_MIN_WIDTH
     * @see BOX_CHARACTER_WIDTH
     */
    getBoxWidth() {
        return BOX_MIN_WIDTH;
    }

    /**
     * Returns height of a box.
     *
     * The box height is determined by a ratio between width and height.
     *
     * @return {number}
     * @see getBoxWidth
     * @see BOX_DIMENSION_RATIO
     */
    getBoxHeight() {
        return this.getBoxWidth() / BOX_DIMENSION_RATIO;
    }

    /**
     * Returns number of columns on the diagram.
     *
     * It cannot be less than {@link DIAGRAM_MIN_COLUMNS}.
     *
     * @return {number}
     * @see DIAGRAM_MIN_COLUMNS
     * @see getRows
     */
    getDiagramColumns(): number {
        // Get the lowest column value
        const lowestColumn = this.getLowestColumn();

        // Get the lowest column value
        const highestColumn = this.getHighestColumns();

        return ((lowestColumn - highestColumn) * -1) / 2 + 1;
    }

    /**
     * Returns number of rows in the diagram.
     *
     * @return {number}
     * @see getRows
     */
    getDiagramRows() {
        return this.state.rows.length;
    }

    /**
     * Returns width of a diagram in SVG user units.
     *
     * The diagram width is determined from a number columns and a size
     * of each column (one column = one box width + box margin).
     *
     * @return {number}
     * @see getDiagramColumns
     * @see getBoxWidth
     * @see BOX_MARGIN
     */
    getDiagramWidth() {
        const columns = this.getDiagramColumns();

        return columns * this.getBoxWidth();
    }

    /**
     * Returns height of a diagram in SVG user units.
     *
     * The diagram height is determined from a number rows and a size of
     * each row (one row = one box height + box margin).
     *
     * @return {number}
     * @see getDiagramRows
     * @see getBoxHeight
     * @see BOX_MARGIN
     */
    getDiagramHeight(): number {
        return this.getDiagramRows() * (this.getBoxHeight() + BOX_MARGIN) + BOX_MARGIN;
    }

    /**
     * Returns center of a box on x-axis.
     *
     * Boxes are spread across the whole space of a row to occupy the
     * same amount of space each.
     *
     * @param {number} colIdx
     * @return {number}
     * @see getDiagramWidth
     * @see BOX_MARGIN
     */
    getBoxHorizontalCenter(colIdx) {
        //const hSpace = (this.getBoxWidth() + BOX_MARGIN) / 2;

        return (BOX_MIN_WIDTH / 2) * (colIdx + 2) - BOX_MIN_WIDTH / 2;
    }

    /**
     * Returns center of a box on y-axis.
     *
     * Rows are stacked from the top to the bottom.
     *
     * @param {number} rowIdx
     * @return {number}
     * @see getBoxHeight
     * @see BOX_MARGIN
     */
    getBoxVerticalCenter(rowIdx) {
        const vSpace = this.getBoxHeight() + BOX_MARGIN;

        return BOX_MARGIN / 2 + vSpace * rowIdx + vSpace / 2;
    }

    /**
     * Returns top coordinate of a box.
     *
     * @param {number} colIdx
     * @return {number}
     * @see getBoxHorizontalCenter
     * @see getBoxWidth
     */
    getBoxTopCoord(colIdx) {
        const top = this.getBoxHorizontalCenter(colIdx) + 20;

        return top;
    }

    /**
     * Returns left coordinate of a box.
     *
     * @param {number} rowIdx
     * @return {number}
     * @see getBoxVerticalCenter
     * @see getBoxHeight
     */
    getBoxLeftCoord(rowIdx) {
        const left = this.getBoxVerticalCenter(rowIdx) - this.getBoxHeight() / 2;

        return left;
    }

    /**
     * Returns coordinates and dimensions of a start step.
     *
     * Start (root) step is expected to be an ellipse so its center and
     * radiuses are returned.
     *
     * @return {number}
     * @see getBoxWidth
     * @see getBoxHeight
     */
    getStartParams() {
        return {
            cx: this.getBoxWidth() / 2,
            cy: this.getBoxHeight() / 2,
            rx: this.getBoxWidth() / 2,
            ry: this.getBoxHeight() / 2,
        };
    }

    /**
     * Returns coordinates and dimensions of a general step.
     *
     * Step is generally expected to be a rect so its top-right corner
     * coordinates and width and height are retuned. Rect's corners are
     * rounded to corner radiuses are returned too.
     *
     * @return {number}
     * @see BOX_ROUNDED_CORNER
     */
    getDefaultParams() {
        return {
            rx: BOX_ROUNDED_CORNER,
            ry: BOX_ROUNDED_CORNER,
            width: BOX_MIN_WIDTH,
            height: BOX_HEIGHT,
        };
    }

    getIconParams(ord) {
        return {
            x: this.getBoxWidth() - 20 - 22 * ord,
            y: 16,
        };
    }

    /**
     * Returns translate spec for transform attribute of a box.
     *
     * @param {number} colIdx
     * @param {number} rowIdx
     * @return {string}
     * @see getBoxTopCoord
     * @see getBoxLeftCoord
     */
    getBoxTransform(colIdx, rowIdx, margin = 0) {
        return `translate(${(BOX_MIN_WIDTH / 2) * colIdx} ${this.getBoxLeftCoord(rowIdx) + margin})`;
    }

    /**
     * Returns mask element for a start (root) step.
     *
     * Mask has an identifier from slugified step name to be referenced
     * by `mask` attribute.
     *
     * @param {number} stepId
     * @param {number} colIdx
     * @param {Array<number>} row
     * @param {number} rowIdx
     * @return {ReactElement}
     * @see getStepDomId
     * @see getStartParams
     */
    renderStartMask(stepId) {
        return (
            <mask id={stepId}>
                <ellipse {...this.getStartParams()} className="diagram__mask" />
            </mask>
        );
    }

    /**
     * Returns group element for a start (root) step.
     *
     * The group element contains an ellipse and a text with step name.
     *
     * @param {number} stepId
     * @param {number} colIdx
     * @param {Array<number>} row
     * @param {number} rowIdx
     * @return {ReactElement}
     * @see getStepFullname
     * @see getStartParams
     * @see getTextParams
     */
    renderStartBox(stepId, colIdx, row, rowIdx) {
        const lowestColumn = this.getLowestColumn();
        const half = this.getDiagramColumns() / 2;
        const left = this.getBoxWidth() * half - 22 - (BOX_MIN_WIDTH / 2) * (lowestColumn * -1);

        const transform = `translate(${left} ${this.getBoxLeftCoord(rowIdx)})`;
        return (
            <g className={`diagram__box`} transform={transform}>
                <circle cx="22" cy="22" r="22" fill="#ddd" />
            </g>
        );
    }

    /**
     * Returns mask element for a general step.
     *
     * Mask has an identifier from slugified step name to be referenced
     * by `mask` attribute.
     *
     * @param {number} stepId
     * @return {ReactElement}
     * @see getStepDomId
     * @see getDefaultParams
     */
    renderDefaultMask(stepId) {
        return (
            <mask id={stepId}>
                <rect {...this.getDefaultParams()} className="diagram__mask" />
            </mask>
        );
    }

    /**
     * Returns group element for a general step.
     *
     * The group element contains a rect and a text with step name. Box
     * can have special styling based on its type which is reflected by
     * setting class name with that type. It is expected that all
     * general steps have info available because it is a source of step
     * type.
     *
     * @param {number} stepId
     * @param {number} colIdx
     * @param {Array<number>} row
     * @param {number} rowIdx
     * @return {ReactElement}
     * @see getStepFullname
     * @see getDefaultParams
     * @see getStepInfo
     * @see getTextParams
     */
    renderDefaultBox(stepId, colIdx, row, rowIdx) {
        const { stepsData, steps, t } = this.props;
        const { highlightedSteps } = this.state;
        return (
            <g
                className={classNames({
                    diagram__box: true,
                })}
                fill="transparent"
                transform={this.getBoxTransform(colIdx, rowIdx)}
            >
                <rect {...this.getDefaultParams()} />
                <foreignObject x={0} y={0} width={this.getBoxWidth()} height={this.getBoxHeight()}>
                    <StepBox
                        stepsData={stepsData}
                        t={t}
                        highlightedSteps={highlightedSteps}
                        stepId={stepId}
                        onMouseEnter={() => {
                            // Get the step dependencies
                            const deps: number[] = steps[stepId];
                            // Check if the step has any dependencies
                            if (deps.length) {
                                this.setState({
                                    highlightedSteps: [...deps, stepId],
                                });
                            }
                        }}
                        onMouseLeave={() => {
                            this.setState({
                                highlightedSteps: [],
                            });
                        }}
                    />
                </foreignObject>
            </g>
        );
    }

    /**
     * Returns mask element for either start (root) or general step.
     *
     * A step with identifier equals to zero is considered a start
     * (root) step.
     *
     * @param {number} stepId
     * @return {ReactElement}
     * @see renderStartMask
     * @see renderDefaultMask
     * @see ROOT_STEP_ID
     */
    renderMask(stepId) {
        return stepId === ROOT_STEP_ID ? this.renderStartMask(stepId) : this.renderDefaultMask(stepId);
    }

    /**
     * Returns group element for either start (root) or general step.
     *
     * A step with identifier equals to zero is considered a start
     * (root) step.
     *
     * @param {number} stepId
     * @param {number} colIdx
     * @param {Array<number>} row
     * @param {number} rowIdx
     * @return {ReactElement}
     * @see renderStartBox
     * @see renderStartBox
     * @see ROOT_STEP_ID
     */
    renderBox(stepId, colIdx, row, rowIdx) {
        return stepId === ROOT_STEP_ID
            ? this.renderStartBox(stepId, colIdx, row, rowIdx)
            : this.renderDefaultBox(stepId, colIdx, row, rowIdx);
    }

    /**
     * Returns path element linking two step boxes (groups).
     *
     * The path has a joint right above bottom of the two
     * boxes. Obviously, this joint is invisible for vertically aligned
     * boxes. Otherwise, it makes sure the path is perpendicular to x-
     * and y-axis.
     *
     * @param {StepArgs} start
     * @param {StepArgs} end
     * @return {ReactElement}
     * @see getBoxHorizontalCenter
     * @see getBoxVerticalCenter
     * @see getBoxHeight
     * @see BOX_MARGIN
     */
    renderPath(start, end) {
        const startX = start.leftStart ? start.leftStart : this.getBoxHorizontalCenter(start.colIdx);
        const startY = this.getBoxVerticalCenter(start.rowIdx);

        const endX = this.getBoxHorizontalCenter(end.colIdx);
        const endY = this.getBoxVerticalCenter(end.rowIdx);

        const joint = Math.max(startY, endY) - this.getBoxHeight() / 2 - BOX_MARGIN / 2;

        return (
            <path
                fill="none"
                stroke="#aaa"
                d={`M${startX},${startY} ` + `L${startX},${joint} ` + `L${endX},${joint} ` + `L${endX},${endY}`}
            />
        );
    }

    /**
     * Returns all mask elements.
     *
     * @return {Array<ReactElement>}
     * @see getFlattenRows
     * @see renderMask
     */
    renderMasks() {
        return this.getFlattenRows().map(({ stepId }) => this.renderMask(stepId));
    }

    /**
     * Returns all box group elements.
     *
     * @return {Array<ReactElement>}
     * @see getFlattenRows
     * @see renderBox
     */
    renderBoxes() {
        return this.getFlattenRows().map(({ stepId, colIdx, row, rowIdx }) =>
            this.renderBox(stepId, colIdx, row, rowIdx)
        );
    }

    /**
     * Returns all path elements.
     *
     * @return {Array<ReactElement>}
     * @see getFlattenDeps
     * @see renderPath
     */
    renderPaths() {
        return this.getFlattenDeps().map(({ start, end }, index) => {
            // This means this is the first row
            // Make sure that the first row paths
            // start from the middle of the diagram
            if (start.stepId === 0) {
                const lowestColumn = this.getLowestColumn();
                const half = this.getDiagramColumns() / 2;
                const left = this.getBoxWidth() * half - (BOX_MIN_WIDTH / 2) * (lowestColumn * -1);

                return this.renderPath(
                    {
                        rowIdx: start.rowIdx,
                        leftStart: left,
                    },
                    {
                        rowIdx: end.rowIdx,
                        colIdx: end.colIdx,
                    }
                );
            }
            return this.renderPath(start, end);
        });
    }

    getLowestColumn = () => {
        return this.state.rows.reduce((newValue, row) => {
            let res = newValue;
            // Find the lowest column in this row
            forEach(row, (rowData, colIdx) => {
                if (parseFloat(colIdx) < parseFloat(res)) {
                    res = colIdx;
                }
            });

            return res;
        }, 0);
    }

    getHighestColumns = () => {
        // Get the lowest column value
        return this.state.rows.reduce((newValue, row) => {
            let res = newValue;
            // Find the lowest column in this row
            forEach(row, (rowData, colIdx) => {
                if (parseFloat(colIdx) > parseFloat(res)) {
                    res = colIdx;
                }
            });

            return res;
        }, 0);
    }

    renderContent: Function = (diagramScale, diaWidth) => {
        const leftViewBox = (BOX_MIN_WIDTH / 2) * this.getLowestColumn();

        return (
            <div
                style={{
                    width: diaWidth,
                    transformOrigin: 'center top',
                    height: this.getDiagramHeight(),
                    margin: 'auto',
                }}
            >
                <svg viewBox={`${leftViewBox} 0 ${diaWidth} ${this.getDiagramHeight()}`} className="diagram">
                    <defs>{this.renderMasks()}</defs>
                    {this.renderPaths()}
                    {this.renderBoxes()}
                </svg>
            </div>
        );
    }

    render() {
        if (!this.state.rows) {
            return 'Loading...';
        }

        return (
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'column',
                    flex: '1 1 auto',
                }}
            >
                {this.renderGridContent()}
            </div>
        );
    }
}

const StepBox = withMessageHandler()(
    ({ highlightedSteps, stepId, onMouseLeave, onMouseEnter, stepsData, t, addMessageListener, postMessage }) => {
        const [stepData, setStepData] = useState({
            name: 'Unknown step',
            version: 0,
            type: 'Unknown step type',
        });

        useEffect(() => {
            // Wait for the interface data message
            const msgListener = addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
                if (
                    data.step &&
                    stepsData[stepId].name === data.step.name &&
                    stepsData[stepId].version == data.step.version
                ) {
                    setStepData({
                        name: data.step.name,
                        version: data.step.version,
                        type: data.step['base-class-name'],
                    });
                }
            });
            // Ask for the interface data on every change to
            // this step
            postMessage(Messages.GET_INTERFACE_DATA, {
                iface_kind: 'step',
                name: `${stepsData[stepId].name}:${stepsData[stepId].version}`,
                include_tabs: false,
            });
            // Remove the listener when unmounted
            return () => {
                msgListener();
            };
        }, [stepId, stepsData]);
        return (
            <div
                style={{
                    height: '100%',
                    margin: '0 10px',
                    padding: '7px',
                    backgroundColor: '#fff',
                    border: highlightedSteps.includes(stepId) ? '2px dashed #137cbd' : '1px solid #eee',
                    borderRadius: '5px',
                    transform: `scale(${highlightedSteps.includes(stepId) ? 1.05 : 1})`,
                    boxShadow: `0 0 ${highlightedSteps.includes(stepId) ? 15 : 2}px 0px #ccc`,
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
            >
                <div
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        clear: 'both',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                    }}
                >
                    <FieldName>
                        {stepData.name}:{stepData.version}
                    </FieldName>
                    <FieldType>{t(stepData.type)}</FieldType>
                </div>
            </div>
        );
    }
);
