import WorkflowStepDependencyParser from '../../src/helpers/StepDependencyParser';

describe('WorkflowStepDependencyParser', () => {
  let parser: WorkflowStepDependencyParser;

  beforeEach(() => {
    parser = new WorkflowStepDependencyParser();
  });

  describe('processStep', () => {
    it('should add step to stepDependencyMap if no predecessors', () => {
      parser.processStep('step1', null);

      expect(parser.stepDependencyMap).toEqual({
        step1: [],
      });
    });
  });
});
