import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render } from '@testing-library/react';
import FSMInitialOrderDialog, {
  IFSMTransitionOrderDialogProps,
} from '../../../../src/containers/InterfaceCreator/fsm/initialOrderDialog';

const states = {
  state1: {
    name: 'State 1',
    execution_order: 1,
  },
  state2: {
    name: 'State 2',
    execution_order: 2,
  },
};

const allStates = states;

const onClose = jest.fn();
const onSubmit = jest.fn();

const defaultProps: IFSMTransitionOrderDialogProps = {
  onClose,
  onSubmit,
  states,
  allStates,
  fsmName: 'FSM Name',
  interfaceId: 'Interface ID',
};

describe('FSMInitialOrderDialog', () => {
  it('should render the OrderDialog component', () => {
    render(
      <ReqoreUIProvider>
        <FSMInitialOrderDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
  });
});
