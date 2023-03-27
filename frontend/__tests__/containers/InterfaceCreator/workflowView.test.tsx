import '@testing-library/jest-dom';
import { processSteps } from '../../../src/containers/InterfaceCreator/workflowsView';

describe('processSteps', () => {
  const stepsData = {
    step1: { name: 'Step 1', version: '1.0' },
    step2: { name: 'Step 2', version: '2.0' },
    step3: { name: 'Step 3', version: '1.5' },
  };

  it('should process a single step', () => {
    const steps = ['step1'];
    const expected = ['Step 1:1.0'];
    const result = processSteps(steps, stepsData);
    expect(result).toEqual(expected);
  });

  it('should process an array of steps', () => {
    const steps = ['step1', 'step2'];
    const result = processSteps(steps, stepsData);
    expect(result).toHaveLength(2);
  });
});
