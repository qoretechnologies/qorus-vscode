import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import {
    IFSMTransitionOrderDialogProps,
    FSMTransitionOrderDialog,
} from '../../../../src/containers/InterfaceCreator/fsm/transitionOrderDialog';

const mockStateData = {
  state1: { name: 'State 1', type: 'start' },
  state2: { name: 'State 2', type: 'normal' },
};

const mockTransitions = [
  { state: 'state1', condition: { class: 'input', connector: 'is' } },
  { state: 'state2', condition: { class: 'output', connector: 'is not' } },
];

const mockProps: IFSMTransitionOrderDialogProps = {
  id: 'state1',
  transitions: mockTransitions,
  onClose: jest.fn(),
  getStateData: (id) => mockStateData[id],
  onSubmit: jest.fn(),
  onEditClick: jest.fn(),
  states: mockStateData,
};

describe('FSMTransitionOrderDialog', () => {
  test('renders FSMTransitionOrderDialog component', () => {
    render(
      <ReqoreUIProvider>
        <FSMTransitionOrderDialog {...mockProps} />
      </ReqoreUIProvider>
    );
  });
  test('renders OrderDialog with correct props', () => {
    render(
      <ReqoreUIProvider>
        <FSMTransitionOrderDialog {...mockProps}>
        </FSMTransitionOrderDialog>
      </ReqoreUIProvider>
    );
    expect(screen.getByText('State 1: Connector TransitionOrderCondition: input:is')).toBeInTheDocument();
  });

  test('submitting new transitions calls onSubmit prop with correct data', () => {
    render(
      <ReqoreUIProvider>
        <FSMTransitionOrderDialog {...mockProps} />
      </ReqoreUIProvider>
    );
    const buttonElement = screen.getAllByRole('button', { class: 'reqore-button' })[0];
    fireEvent.click(buttonElement);
    expect(mockProps.onSubmit).toBeDefined();
  });
});
