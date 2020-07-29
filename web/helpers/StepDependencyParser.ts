import { isArray } from 'lodash';

export default class WorkflowStepDependencyParser {
    public stepDependencyMap: { [key: string]: number[] } = {};

    constructor() {}

    /** @param predecessors zero or more steps that come before this step in the series; these are steps that must
     */
    processStep(step, predecessors) {
        if (predecessors) {
            if (!this.stepDependencyMap[step]) {
                this.stepDependencyMap[step] = [];
            }
            predecessors.forEach((preStep) => {
                this.stepDependencyMap[step].push(preStep);
            });
        } else {
            this.stepDependencyMap[step] = [];
        }
    }

    public processSteps(steps) {
        this.stepDependencyMap = {};
        this.processWorkflowSteps(steps);
        return this.stepDependencyMap;
    }

    /** @param predecessors zero or more steps that come before this step in the series; these are steps that must
        be executed; elements are either strings or hashes identifying the predecessor step(s)
        @param workflow the workflow for error reporting
        @param steps the list of steps or single step to process; can be:
        - a list: a list of any of these types (even another list)
        - a hash: a hash that describes the step
        - a string: a string that identifies the step
        @param deps step dependency hash
    */
    private processWorkflowSteps(steps: [], predecessors?) {
        steps = isArray(steps) ? steps : [steps];
        steps.forEach((step_list_entry: [] | string): void => {
            if (typeof step_list_entry === 'object') {
                step_list_entry.forEach((deep_step) => {
                    this.processWorkflowSteps(deep_step, predecessors);
                });
                predecessors = [];
                step_list_entry.forEach((deep_step) => {
                    this.getLastStep(predecessors, deep_step);
                });
            } else {
                this.processStep(step_list_entry, predecessors);
                predecessors = [step_list_entry];
            }
        });
    }

    /** @param predecessors a reference to a list of step info where each element identifies a single precdecessor
        step with a type of:
        - hash: identifying the predecessor step
        - string: identifying the predecessor step

        @return
    */
    getLastStep(predecessors, step) {
        if (typeof step === 'object') {
            if (typeof step[step.length - 1] === 'object') {
                step[step.length - 1].forEach((innerStep) => {
                    this.getLastStep(predecessors, innerStep);
                });
            } else {
                this.getLastStep(predecessors, step[step.length - 1]);
            }
        } else {
            predecessors.push(step);
        }
    }
}
