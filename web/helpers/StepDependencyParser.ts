import { isArray } from 'lodash';

export default class WorkflowStepDependencyParser {
  public stepDependencyMap: { [key: string]: number[] } = {};

  constructor() {}

  /**
   * If predecessors is not null, add the predecessors to the stepDependencyMap.
   * @param step - The step that is being added to the dependency map.
   * @param predecessors - An array of steps that must be completed before step step can be
  completed.
   * @returns None
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

  /**
   * For each step in the workflow,
   * we check if it's a list of steps. If it is, we recursively call the function on each
   * step in the list. If it's not, we call the processStep function on the step.
   * @param {tupletype} steps - The steps to process.
   * @param predecessors - the list of predecessors of the current step.
   * @returns None
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

  /**
   * Get the last step of a step array.
   * @param predecessors - an array of steps that are predecessors of the current step
   * @param step - the step that is being checked
   * @returns None
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
