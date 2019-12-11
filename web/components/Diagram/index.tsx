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
}

@withTextContext()
@onlyUpdateForKeys(['highlightedGroupSteps', 'steps', 'stepsData', 't'])
export default class StepDiagram extends Component<IStepDiagramProps> {
    state = {
        nodes: null,
        rows: null,
        highlightedSteps: this.props.highlightedGroupSteps || [],
    };

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
        this.setState({
            nodes: graph(this.getStepDeps(undefined, this.props.steps)),
            rows: this.buildRows(graph(this.getStepDeps(undefined, this.props.steps))),
        });
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.steps !== this.props.steps) {
            this.setState({
                nodes: graph(this.getStepDeps(undefined, nextProps.steps)),
                rows: this.buildRows(graph(this.getStepDeps(undefined, nextProps.steps))),
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
            if (!rows[n.depth]) rows[n.depth] = new Array(cols);
            if (!newRows[n.depth]) newRows[n.depth] = {};

            let refColMin = cols - 1;
            for (const na of n.above) {
                let col = -1;
                for (const r of rows.slice().reverse()) {
                    col = (r || []).indexOf(na.id);
                    if (col >= 0) break;
                }
                refColMin = Math.min(refColMin, col);
            }

            let refColMax = 0;
            for (const na of n.above) {
                let col = -1;
                for (const r of rows.slice().reverse()) {
                    col = (r || []).indexOf(na.id);
                    if (col >= 0) break;
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
    };

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
    getDiagramColumns() {
        // Get the lowest column value
        const lowestColumn = this.state.rows.reduce((newValue, row) => {
            let res = newValue;
            // Find the lowest column in this row
            forEach(row, (rowData, colIdx) => {
                if (parseFloat(colIdx) < parseFloat(res)) {
                    res = colIdx;
                }
            });

            return res;
        }, 0);

        // Get the lowest column value
        const highestColumn = this.state.rows.reduce((newValue, row) => {
            let res = newValue;
            // Find the lowest column in this row
            forEach(row, (rowData, colIdx) => {
                if (parseFloat(colIdx) > parseFloat(res)) {
                    res = colIdx;
                }
            });

            return res;
        }, 0);

        return ((lowestColumn - highestColumn) * -1) / 2 + 1;
    }

    /**
     * Returns number of columns on the diagram.
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
    getDiagramHeight() {
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
        const hSpace = (this.getBoxWidth() + BOX_MARGIN) / 2;

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
     * @see getBoxWidth
     * @see getBoxHeight
     * @see BOX_ROUNDED_CORNER
     */
    getDefaultParams() {
        return {
            rx: BOX_ROUNDED_CORNER,
            ry: BOX_ROUNDED_CORNER,
            width: this.getBoxWidth(),
            height: this.getBoxHeight(),
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
                stroke="#ddd"
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
    };

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
    };

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
    };

    render() {
        if (!this.state.rows) {
            return 'Loading...';
        }

        const diaWidth = this.getDiagramWidth();

        return (
            <div
                style={{
                    display: 'flex',
                    flexFlow: 'column',
                    flex: '1 1 auto',
                }}
            >
                {this.renderContent(1, diaWidth)}
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
        }, []);

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
