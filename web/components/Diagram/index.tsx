// @flow
import { Button, ButtonGroup, Icon, Intent, NonIdealState, Tooltip } from '@blueprintjs/core';
import classNames from 'classnames';
import { size } from 'lodash';
import React, { Component, useContext, useEffect, useState } from 'react';
import styled, { css } from 'styled-components';
import { Messages } from '../../constants/messages';
import { calculateFontSize } from '../../containers/InterfaceCreator/fsm/state';
import {
    ActionsWrapper,
    ContentWrapper,
    FieldInputWrapper,
    FieldWrapper,
} from '../../containers/InterfaceCreator/panel';
import { ContextMenuContext } from '../../context/contextMenu';
import { FieldContext } from '../../context/fields';
import { InitialContext } from '../../context/init';
import { TextContext } from '../../context/text';
import { validateField } from '../../helpers/validations';
import { addMessageListener, postMessage } from '../../hocomponents/withMessageHandler';
import withTextContext from '../../hocomponents/withTextContext';
import Content from '../Content';
import CustomDialog from '../CustomDialog';
import Field from '../Field';
import FieldLabel from '../FieldLabel';
import { FieldName, FieldType } from '../FieldSelector';
import Spacer from '../Spacer';

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
 * Width of one box on a diagram in SVG user units.
 */
const BOX_WIDTH = 249;

/**
 * Approximate width of one character of box text in SVG user units.
 *
 * It an approximate width of letter "n".
 */
// const BOX_CHARACTER_WIDTH = 10;

/**
 * Height of a step box.
 */
const BOX_HEIGHT = 75;

/**
 * Box rounded corner radius.
 */
const BOX_ROUNDED_CORNER = 5;

/**
 * Horizontal margin between boxes.
 */
const BOX_H_MARGIN = 1;

/**
 * Vertical margin between boxes.
 */
const BOX_V_MARGIN = 50;

/**
 * Length of the small part of the connection lines, entering and leaving boxes.
 */
const BOX_LINE_SHORT = BOX_V_MARGIN / 8;

/**
 * Radius of root node circle.
 */
const ROOT_CIRCLE_R = 22;

function strcmp(str1, str2) {
    // http://kevin.vanzonneveld.net
    // +   original by: Waldo Malqui Silva
    // +      input by: Steve Hilder
    // +   improved by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
    // +    revised by: gorthaur
    // *     example 1: strcmp( 'waldo', 'owald' );
    // *     returns 1: 1
    // *     example 2: strcmp( 'owald', 'waldo' );
    // *     returns 2: -1

    return str1 == str2 ? 0 : str1 > str2 ? 1 : -1;
}

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

class StepNode {
    id: number;
    internalId: number = 0;
    level: number = 0;
    children: Array<StepNode> = [];
    parents: Array<StepNode> = [];
    sortName: string = '';
    centerX: number = 0; // center x-coordinate
    x: number = 0; // left x-coordinate
    y: number = 0; // top y-coordinate

    constructor(id: number, level?: number) {
        this.internalId = ++StepCounter;
        this.id = id;
        if (level !== undefined) {
            this.level = level;
        }
    }

    /**
     * Is this the root step?
     */
    isRoot(): boolean {
        return this.id === ROOT_STEP_ID;
    }
}

class RowGroup {
    nodes: StepNode[];
    avgX: number;
    width: number;
    compareHalfWidth: number;

    constructor(avgX: number, nodes: StepNode[] = []) {
        this.avgX = avgX;
        this.nodes = nodes;
        this.recalculateWidth();
    }

    /**
     * Check if the groups collide.
     * @param group group to check for a collision
     */
    collides(group: RowGroup): boolean {
        if (group.avgX + group.compareHalfWidth < this.avgX - this.width * 0.5) {
            return false;
        }
        if (this.avgX + this.compareHalfWidth < group.avgX - group.width * 0.5) {
            return false;
        }
        return true;
    }

    addNode(node: StepNode) {
        this.nodes.push(node);
        this.recalculateWidth();
    }

    /**
     * Merge in another group and combine the average position.
     * @param group group to merge
     */
    mergeGroup(group: RowGroup) {
        this.avgX =
            (this.nodes.length * this.avgX + group.nodes.length * group.avgX) /
            (this.nodes.length + group.nodes.length);
        this.nodes = this.nodes.concat(group.nodes);
        this.recalculateWidth();
    }

    /**
     * Recalculate width of the group.
     */
    private recalculateWidth() {
        this.width = this.nodes.length * BOX_WIDTH;
        if (this.nodes.length > 1) {
            this.width += (this.nodes.length - 1) * BOX_H_MARGIN;
        }
        this.compareHalfWidth = this.width * 0.5 - 0.0001;
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

    if (a.internalId == b.internalId) {
        return true;
    }

    return false;
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

class DefferedAssignment {
    stepNode: StepNode;
    parentId: number;

    constructor(stepNode: StepNode, parentId: number) {
        this.stepNode = stepNode;
        this.parentId = parentId;
    }
}

class GraphBuilder {
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
            let result = GraphBuilder.findStepNodeById(child, stepNodeId);
            if (result !== undefined) {
                return result;
            }
        }
        return undefined;
    }

    /**
     * Recursively assign levels to the steps in a tree.
     * @param node
     * @param level
     */
    static setStepNodeLevels(node: StepNode, level: number) {
        if (node.level < level) {
            node.level = level;
        }
        for (const child of node.children) {
            GraphBuilder.setStepNodeLevels(child, node.level + 1);
        }
    }

    /**
     * Build a graph/tree of step nodes from the steps parameter.
     * @param steps original steps parameter
     * @return root node of the step graph/tree
     */
    static buildGraph(steps): StepNode {
        const rootNode: StepNode = new StepNode(ROOT_STEP_ID);
        const assignLater = new Array<DefferedAssignment>();

        for (const stepKey in steps) {
            if (!steps.hasOwnProperty(stepKey)) {
                continue;
            }
            const stepDeps = steps[stepKey];
            const stepNode: StepNode = new StepNode(parseInt(stepKey));
            if (stepDeps.length === 0) {
                stepNode.parents.push(rootNode);
                rootNode.children.push(stepNode);
                continue;
            }
            for (const dep of stepDeps) {
                const depId = parseInt(dep);
                const parentNode = GraphBuilder.findStepNodeById(rootNode, depId);
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
                const item = assignLater[i];
                const parentNode = GraphBuilder.findStepNodeById(rootNode, item.parentId);
                if (parentNode !== undefined) {
                    item.stepNode.parents.push(parentNode);
                    if (!arrayContainsNode(parentNode.children, item.stepNode)) {
                        parentNode.children.push(item.stepNode);
                    }
                    assignLater.splice(i, 1);
                }
            }
        }

        GraphBuilder.setStepNodeLevels(rootNode, 0);
        return rootNode;
    }

    /**
     * Build a list of rows of step nodes from the graph.
     * @param rootNode root node of the step node graph
     * @return array of rows with step nodes of the graph
     */
    static buildRows(rootNode: StepNode): Array<Array<StepNode>> {
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
        return rows;
    }

    /**
     * Get the maximum count of columns in all the rows.
     * @param rows rows of the graph
     * @return maximum count of columns in all the rows
     */
    static getRowsMaxColumns(rows: Array<Array<StepNode>>): number {
        let columns = 0;
        for (const row of rows) {
            if (row.length > columns) {
                columns = row.length;
            }
        }
        return columns;
    }

    /**
     * Calculate graph width from the rows of the graph.
     * @param rows rows of the graph
     * @return graph width
     */
    static calculateGraphWidth(rows: Array<Array<StepNode>>): number {
        const maxColumns = GraphBuilder.getRowsMaxColumns(rows);
        return maxColumns * BOX_WIDTH + (maxColumns - 1) * BOX_H_MARGIN;
    }

    /**
     * Calculate graph height from the rows of the graph.
     * @param rows rows of the graph
     * @return graph height
     */
    static calculateGraphHeight(rows: Array<Array<StepNode>>): number {
        return rows.length * (BOX_HEIGHT + BOX_V_MARGIN);
    }

    /**
     * Sort rows of the graph according to their IDs.
     * @param rows rows of the graph
     */
    static sortRows(rows: Array<Array<StepNode>>) {
        let groupCounter: number = 0;
        for (const row of rows) {
            // generate sort names
            for (const step of row) {
                if (step.parents.length === 0) {
                    step.sortName = step.id.toString();
                } else if (step.parents.length === 1) {
                    step.sortName = step.parents[0].sortName + '-' + step.id.toString();
                } else {
                    const parentNames = [];
                    const groupId = 'G' + groupCounter.toString();
                    const groupPrefix = groupId + '-';
                    ++groupCounter;

                    for (const parent of step.parents) {
                        let newParentName = parent.sortName;
                        const lastDash = newParentName.lastIndexOf('-');
                        if (lastDash === -1) {
                            newParentName = groupPrefix + parent.id.toString();
                        } else {
                            newParentName = newParentName.substr(0, lastDash + 1) + groupPrefix + parent.id.toString();
                        }
                        parent.sortName = newParentName;
                        parentNames.push(newParentName);
                    }
                    step.sortName = parentNames[0] + '-' + step.id.toString();
                }
            }
        }

        // sort rows according to sort names
        for (let i = 0; i < rows.length; ++i) {
            rows[i] = rows[i].sort((a: StepNode, b: StepNode): number => {
                return strcmp(a.sortName, b.sortName);
            });
        }
    }

    /**
     * Assign base positions to nodes of the graph, as if they were equally distributed across their rows.
     * @param rows rows of the graph
     * @param graphWidth width of the graph
     */
    static assignBasePositionsToStepNodes(rows: Array<Array<StepNode>>, graphWidth: number) {
        for (let i = 0; i < rows.length; ++i) {
            const row = rows[i];
            const rowWidth = row.length * BOX_WIDTH + (row.length > 1 ? (row.length - 1) * BOX_H_MARGIN : 0);
            const startX = (graphWidth - rowWidth) * 0.5;
            for (let j = 0; j < row.length; ++j) {
                row[j].x = startX + j * (BOX_WIDTH + BOX_H_MARGIN);
                row[j].centerX = row[j].x + BOX_WIDTH * 0.5;
                row[j].y = i * (BOX_HEIGHT + BOX_V_MARGIN);
            }
        }
    }

    /**
     * Balance out step nodes so that they are ideally located in their rows.
     * @param rows rows of the graph
     * @param graphWidth width of the graph
     */
    static balanceRows(rows: Array<Array<StepNode>>, graphWidth: number) {
        for (const row of rows) {
            // find groups of nodes with same parents
            let rowGroups: RowGroup[] = [];
            for (let j = 0; j < row.length; ++j) {
                // calculate average center position of parents of step
                let avgX = 0;
                const parents = row[j].parents;
                if (parents.length > 0) {
                    for (const parent of parents) {
                        avgX += parent.centerX;
                    }
                    avgX /= parents.length;
                } else {
                    avgX = graphWidth * 0.5;
                }

                // find group with same average
                let group = rowGroups.find((group) => group.avgX === avgX);

                // if exists, assign to group
                if (group) {
                    group.addNode(row[j]);
                } else {
                    // otherwise create new group
                    group = new RowGroup(avgX, [row[j]]);
                    rowGroups.push(group);
                }
            }

            // flag specifying if any change had to be done to the groups
            let noFix;

            // join colliding groups
            let joinCollidingGroups = () => {
                for (let k = 0; k + 1 < rowGroups.length; ) {
                    let g1 = rowGroups[k];
                    let g2 = rowGroups[k + 1];
                    if (g1.collides(g2)) {
                        g1.mergeGroup(g2);
                        rowGroups.splice(k + 1, 1);
                        noFix = false;
                    } else {
                        ++k;
                    }
                }
            };

            // check groups don't overflow the graph limits
            // and set them to correct positions if they do
            let checkGraphLimits = () => {
                for (const group of rowGroups) {
                    if (group.avgX - group.width * 0.5 < 0) {
                        group.avgX = group.width * 0.5;
                        noFix = false;
                    } else if (group.avgX + group.compareHalfWidth >= graphWidth) {
                        group.avgX = graphWidth - group.width * 0.5;
                        noFix = false;
                    }
                }
            };

            // balance the groups
            do {
                noFix = true;
                joinCollidingGroups();
                checkGraphLimits();
            } while (!noFix);

            // assign new positions according to groups
            for (const group of rowGroups) {
                for (let k = 0; k < group.nodes.length; ++k) {
                    const node = group.nodes[k];
                    node.x = group.avgX - group.width * 0.5 + k * (BOX_WIDTH + BOX_H_MARGIN);
                    node.centerX = node.x + BOX_WIDTH * 0.5;
                }
            }
        }
    }

    /**
     * Sort step nodes in the rows according to their IDs and then balance out the nodes in their rows.
     * @param rows rows of the graph
     */
    static sortAndBalanceRows(rows: Array<Array<StepNode>>) {
        const graphWidth = GraphBuilder.calculateGraphWidth(rows);
        GraphBuilder.sortRows(rows);
        GraphBuilder.assignBasePositionsToStepNodes(rows, graphWidth);
        GraphBuilder.balanceRows(rows, graphWidth);
    }
}

@withTextContext()
export default class StepDiagram extends Component<IStepDiagramProps> {
    state = {
        rows: null,
        highlightedSteps: this.props.highlightedGroupSteps || [],
        dialog: null,
    };

    renderGridPath(startX, startY, endX, endY) {
        return <path fill="none" stroke="#aaa" d={`M${startX},${startY} L${endX},${endY}`} />;
    }

    renderGrid2PartPath(startX, startY, middleX, middleY, endX, endY) {
        return <path fill="none" stroke="#aaa" d={`M${startX},${startY} L${middleX},${middleY} L${endX},${endY}`} />;
    }

    renderGrid3PartPath(aX, aY, bX, bY, cX, cY, dX, dY) {
        return <path fill="none" stroke="#aaa" d={`M${aX},${aY} L${bX},${bY} L${cX},${cY} L${dX},${dY}`} />;
    }

    getStepTransform(step) {
        return `translate(${step.x} ${step.y})`;
    }

    getRootStepTransform(step) {
        return `translate(${step.centerX} ${step.y + BOX_HEIGHT * 0.5})`;
    }

    renderStepConnections(step) {
        let connections = [];
        const startX = step.x + BOX_WIDTH * 0.5;
        const startY = step.y + BOX_HEIGHT;
        const bY = startY + BOX_LINE_SHORT;

        for (const child of step.children) {
            const endX = child.x + BOX_WIDTH * 0.5;
            const endY = child.y;
            const cY = endY - BOX_LINE_SHORT;
            connections.push(this.renderGrid3PartPath(startX, startY, startX, bY, endX, cY, endX, endY));
        }
        return connections;
    }

    renderRootStepConnections(step) {
        let connections = [];
        const rootStartY = step.y + BOX_HEIGHT * 0.5;
        const startX = step.x + BOX_WIDTH * 0.5;
        const startY = step.y + BOX_HEIGHT;
        const bY = startY + BOX_LINE_SHORT;

        connections.push(this.renderGridPath(startX, rootStartY, startX, startY));
        for (const child of step.children) {
            const endX = child.x + BOX_WIDTH * 0.5;
            const endY = child.y;
            const cY = endY - BOX_LINE_SHORT;
            connections.push(this.renderGrid3PartPath(startX, startY, startX, bY, endX, cY, endX, endY));
        }
        return connections;
    }

    renderRootStep(step) {
        return (
            <g>
                {this.renderRootStepConnections(step)}
                <g className={`diagram__box`} transform={this.getRootStepTransform(step)}>
                    <circle cx="0" cy="0" r={ROOT_CIRCLE_R} fill="#ddd" />
                </g>
            </g>
        );
    }

    renderNormalStep(step) {
        const { stepsData, steps, t, handleStepInsert, onStepRemove, onStepUpdate } = this.props;
        const { highlightedSteps } = this.state;
        stepsData[step.id].sortName = step.sortName;
        return (
            <g>
                <g
                    className={classNames({
                        diagram__box: true,
                    })}
                    key={step.id}
                    fill="transparent"
                    transform={this.getStepTransform(step)}
                >
                    <rect {...this.getDefaultParams()} />
                    <foreignObject x={0} y={0} width={BOX_WIDTH} height={BOX_HEIGHT}>
                        <StepBox
                            handleStepInsert={handleStepInsert}
                            onStepRemove={onStepRemove}
                            onStepUpdate={onStepUpdate}
                            stepData={stepsData[step.id]}
                            highlightedSteps={highlightedSteps}
                            stepId={step.id}
                            onMouseEnter={() => {
                                // Get the step dependencies
                                const deps: number[] = steps[step.id];
                                // Check if the step has any dependencies
                                if (deps.length) {
                                    this.setState({
                                        highlightedSteps: [...deps, step.id],
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
                {this.renderStepConnections(step)}
            </g>
        );
    }

    renderStep(step) {
        if (step.isRoot()) {
            return this.renderRootStep(step);
        } else {
            return this.renderNormalStep(step);
        }
    }

    renderRows(rows) {
        let renderedRows = [];
        for (let i = 0; i < rows.length; ++i) {
            const row = rows[i];
            let rowSteps = [];
            for (let j = 0; j < row.length; ++j) {
                rowSteps.push(this.renderStep(row[j]));
            }
            renderedRows.push(rowSteps);
        }
        return <g>{renderedRows}</g>;
    }

    renderGraph() {
        const rows = this.state.rows;
        const graphWidth = GraphBuilder.calculateGraphWidth(rows);
        const graphHeight = GraphBuilder.calculateGraphHeight(rows);
        return (
            <div
                style={{
                    width: graphWidth,
                    transformOrigin: 'center top',
                    height: graphHeight,
                    margin: 'auto',
                }}
            >
                <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="diagram">
                    {this.renderRows(rows)}
                </svg>
            </div>
        );
    }

    getStepDeps(stepId: number, steps) {
        const initIds = Object.keys(steps).filter((id) => steps[id].length <= 0);

        const initialDeps = initIds.map((initId) => ({ [initId]: [ROOT_STEP_ID] }));

        const deps = Object.assign({ [ROOT_STEP_ID]: [] }, steps, ...initialDeps);

        return typeof stepId !== 'undefined' ? deps[stepId] : deps;
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
            width: BOX_WIDTH,
            height: BOX_HEIGHT,
        };
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
        if (size(this.props.steps)) {
            const bgraph = GraphBuilder.buildGraph(this.props.steps);
            const rows = GraphBuilder.buildRows(bgraph);
            GraphBuilder.sortAndBalanceRows(rows);
            this.setState({
                rows: rows,
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.steps !== this.props.steps) {
            const bgraph = GraphBuilder.buildGraph(nextProps.steps);
            const rows = GraphBuilder.buildRows(bgraph);
            GraphBuilder.sortAndBalanceRows(rows);
            this.setState({
                rows: rows,
            });
        }
    }

    handleAddStep = (before, title) => {
        this.setState({
            ...this.state,
            dialog: {
                title,
                onSubmit: (step) => {
                    this.props.handleStepInsert(
                        {
                            name: step.split(':')[0],
                            version: step.split(':')[1],
                        },
                        null,
                        before
                    );
                    this.setState({ dialog: null });
                },
            },
        });
    };

    render() {
        const { t, steps } = this.props;

        if (size(steps) && !this.state.rows) {
            return 'Loading...';
        }

        return (
            <>
                {this.state.dialog && (
                    <StepDialog onClose={() => this.setState({ dialog: null })} {...this.state.dialog} />
                )}
                <Spacer size={10} />
                <Button
                    text={t('AddNewStepBefore')}
                    minimal
                    intent="success"
                    icon="add"
                    onClick={() => this.handleAddStep(true, t('AddNewStepBefore'))}
                    name="add-step-before-all"
                />
                <Spacer size={10} />
                {size(steps) ? (
                    <div
                        style={{
                            display: 'flex',
                            flexFlow: 'column',
                            flex: '1 1 auto',
                        }}
                    >
                        {this.renderGraph()}
                    </div>
                ) : (
                    <NonIdealState
                        title={t('DiagramIsEmpty')}
                        description={t('DiagramEmptyDescription')}
                        icon="diagram-tree"
                    />
                )}
                <Spacer size={10} />
                <Button
                    text={t('AddNewStepAfter')}
                    minimal
                    intent="success"
                    icon="add"
                    onClick={() => this.handleAddStep(false, t('AddNewStepAfter'))}
                    name="add-step-after-all"
                />
                <Spacer size={10} />
            </>
        );
    }
}

const StepDialog = ({ step, onClose, onSubmit, title, stepName }) => {
    const t = useContext(TextContext);
    const { requestInterfaceData } = useContext(FieldContext);
    const { confirmAction } = useContext(InitialContext);
    const [stepState, setStepState] = useState(step);

    return (
        <CustomDialog
            isOpen
            title={`${title}${stepName ? ` - ${stepName}` : ''}`}
            onClose={onClose}
            style={{
                paddingBottom: 0,
            }}
        >
            <Content style={{ padding: 10, backgroundColor: '#fff', borderTop: '1px solid #d7d7d7' }}>
                <ContentWrapper style={{ display: 'flex', flexFlow: 'column', paddingRight: 0, position: 'relative' }}>
                    <FieldWrapper>
                        <FieldLabel label={t('field-label-step')} isValid={validateField('string', stepState)} />
                        <FieldInputWrapper>
                            <Field
                                type="select-string"
                                onChange={(_name, value) => setStepState(value)}
                                name="step"
                                reference={{ iface_kind: 'step' }}
                                value={stepState}
                                get_message={{
                                    action: 'creator-get-objects',
                                    object_type: 'workflow-step',
                                }}
                                return_message={{
                                    action: 'creator-return-objects',
                                    object_type: 'workflow-step',
                                    return_value: 'objects',
                                }}
                                requestFieldData={(field) => {
                                    if (field === 'target_dir') {
                                        return requestInterfaceData('workflow', 'target_dir')?.value;
                                    }
                                }}
                            />
                        </FieldInputWrapper>
                    </FieldWrapper>
                </ContentWrapper>
                <ActionsWrapper style={{ padding: '10px' }}>
                    <ButtonGroup fill>
                        <Tooltip content={t('ResetTooltip')}>
                            <Button
                                text={t('Reset')}
                                icon={'history'}
                                onClick={() => {
                                    confirmAction(
                                        'ResetFieldsConfirm',
                                        () => {
                                            setStepState(step);
                                        },
                                        'Reset',
                                        'warning'
                                    );
                                }}
                            />
                        </Tooltip>
                        <Button
                            text={t('Submit')}
                            disabled={!validateField('string', stepState)}
                            icon={'tick'}
                            name={`workflow-submit-step`}
                            intent={Intent.SUCCESS}
                            onClick={() => {
                                onSubmit(stepState);
                            }}
                        />
                    </ButtonGroup>
                </ActionsWrapper>
            </Content>
        </CustomDialog>
    );
};

const StyledAddStepButton = styled.div<{ position: string }>`
    width: 20px;
    height: 20px;
    border-radius: 99px;
    background-color: #fff;
    border: 1px solid #ccc;
    position: fixed;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 300;

    ${({ position }) => {
        switch (position) {
            case 'top': {
                return css`
                    left: 50%;
                    top: 0px;
                    transform: translateX(-50%);
                `;
            }
            case 'bottom': {
                return css`
                    left: 50%;
                    bottom: 0px;
                    transform: translateX(-50%);
                `;
            }
            case 'left': {
                return css`
                    top: 50%;
                    left: 0px;
                    transform: translateY(-50%);
                `;
            }
            default: {
                return css`
                    top: 50%;
                    right: 0px;
                    transform: translateY(-50%);
                `;
            }
        }
    }}
`;

const StyledStep = styled.div<{ isHighlighted?: boolean }>`
    margin: 10px;
    max-height: 56px;
    padding: 7px;
    background-color: #fff;
    border: ${({ isHighlighted }) => (isHighlighted ? '2px dashed #137cbd' : '1px solid #ccc')};
    border-radius: 5px;
    transform: ${({ isHighlighted }) => (isHighlighted ? 1.05 : 1)};
    box-shadow: 0 0 ${({ isHighlighted }) => (isHighlighted ? 15 : 2)}px 0px #ccc;
    position: relative;

    &:hover {
        cursor: pointer;
        box-shadow: 0 0 10px 2px #ccc;
        border: 1px solid #ccc;

        ${StyledAddStepButton} {
            display: block;
        }
    }
`;

const StepBox = ({
    highlightedSteps,
    stepId,
    onMouseLeave,
    onMouseEnter,
    stepData: origStepData,
    handleStepInsert,
    onStepRemove,
    onStepUpdate,
}) => {
    const t = useContext(TextContext);
    const { addMenu } = useContext(ContextMenuContext);
    const [dialog, setDialog] = useState(null);
    const [stepData, setStepData] = useState(
        origStepData && size(origStepData)
            ? origStepData
            : {
                  name: 'Unknown Step',
                  version: 0,
                  type: 'unknown',
              }
    );

    useEffect(() => {
        // Wait for the interface data message
        const msgListener = addMessageListener(Messages.RETURN_INTERFACE_DATA, ({ data }) => {
            if (data.step && origStepData.name === data.step.name && origStepData.version == data.step.version) {
                setStepData({
                    name: data.step.name,
                    version: data.step.version,
                    type: data.step['step-type'],
                });
            }
        });
        // Ask for the interface data on every change to
        // this step
        postMessage(Messages.GET_INTERFACE_DATA, {
            iface_kind: 'step',
            name: `${origStepData.name}:${origStepData.version}`,
            include_tabs: false,
        });
        // Remove the listener when unmounted
        return () => {
            msgListener();
        };
    }, [origStepData]);

    const handleAddStep = (event, before, parallel, title) => {
        event.stopPropagation();
        setDialog({
            title,
            stepName: `${stepData.name}:${stepData.version}`,
            onSubmit: (step) => {
                handleStepInsert(
                    {
                        name: step.split(':')[0],
                        version: step.split(':')[1],
                    },
                    stepId,
                    before,
                    parallel
                );
                setDialog(null);
            },
        });
    };

    const handleClick = () => {
        setDialog({
            title: t('EditStep'),
            step: `${stepData.name}:${stepData.version}`,
            stepName: `${stepData.name}:${stepData.version}`,
            onSubmit: (step) => {
                onStepUpdate(stepId, {
                    name: step.split(':')[0],
                    version: step.split(':')[1],
                });
                setDialog(null);
            },
        });
    };

    return (
        <>
            {dialog && <StepDialog onClose={() => setDialog(null)} {...dialog} />}
            <StyledStep
                name="workflow-diagram-step"
                isHighlighted={highlightedSteps.includes(stepId)}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={(event) => {
                    event.persist();
                    addMenu({
                        event,
                        data: [
                            {
                                item: t('AddSequentialStepBefore'),
                                onClick: () => handleAddStep(event, true, false, t('AddSequentialStepBefore')),
                                icon: 'chevron-up',
                            },
                            {
                                item: t('AddSequentialStepAfter'),
                                onClick: () => handleAddStep(event, false, false, t('AddSequentialStepAfter')),
                                icon: 'chevron-down',
                            },
                            {
                                item: t('AddParallelStepBefore'),
                                onClick: () => handleAddStep(event, true, true, t('AddParallelStepBefore')),
                                icon: 'chevron-left',
                            },
                            {
                                item: t('AddParallelStepAfter'),
                                onClick: () => handleAddStep(event, false, true, t('AddParallelStepAfter')),
                                icon: 'chevron-right',
                            },
                            {
                                item: t('Edit'),
                                onClick: () => handleClick(),
                                icon: 'edit',
                                intent: 'warning',
                            },
                            {
                                item: t('Remove'),
                                onClick: () => onStepRemove(stepId),
                                icon: 'trash',
                                intent: 'danger',
                            },
                        ],
                    });
                }}
                onClick={() => handleClick()}
            >
                <StyledAddStepButton
                    position="top"
                    onClick={(event) => handleAddStep(event, true, false, t('AddSequentialStepBefore'))}
                    name={`add-sequential-step-before-${stepData.name}`}
                >
                    <Icon intent="success" icon="add" iconSize={16} />
                </StyledAddStepButton>
                <StyledAddStepButton
                    position="left"
                    onClick={(event) => handleAddStep(event, true, true, t('AddParallelStepBefore'))}
                    name={`add-parallel-step-before-${stepData.name}`}
                >
                    <Icon intent="success" icon="add" iconSize={16} />
                </StyledAddStepButton>
                <StyledAddStepButton
                    position="bottom"
                    onClick={(event) => handleAddStep(event, false, false, t('AddSequentialStepAfter'))}
                    name={`add-sequential-step-after-${stepData.name}`}
                >
                    <Icon intent="success" icon="add" iconSize={16} />
                </StyledAddStepButton>
                <StyledAddStepButton
                    position="right"
                    onClick={(event) => handleAddStep(event, false, true, t('AddParallelStepAfter'))}
                    name={`add-parallel-step-after-${stepData.name}`}
                >
                    <Icon intent="success" icon="add" iconSize={16} />
                </StyledAddStepButton>
                <div
                    style={{
                        justifyContent: 'center',
                        alignItems: 'center',
                        clear: 'both',
                        textAlign: 'center',
                        wordBreak: 'break-word',
                    }}
                >
                    <FieldName
                        title={`${stepData.name}:${stepData.version}`}
                        style={{
                            fontSize: calculateFontSize(`${stepData.name}:${stepData.version}`),
                        }}
                    >
                        {stepData.name}:{stepData.version}
                    </FieldName>

                    <FieldType>{t(stepData.type || '-')}</FieldType>
                </div>
            </StyledStep>
        </>
    );
};
