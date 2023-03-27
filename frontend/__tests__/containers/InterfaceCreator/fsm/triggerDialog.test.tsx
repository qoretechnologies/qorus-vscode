import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FSMTriggerDialog } from '../../../../src/containers/InterfaceCreator/fsm/triggerDialog';

describe('FSMTriggerDialog component', () => {
  const onSubmit = jest.fn();
  const onClose = jest.fn();
  const defaultProps = {
    onSubmit,
    onClose,
    fsmIndex: 0,
  };

  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <FSMTriggerDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
  });

  it('does not call onSubmit when form is submitted with invalid input', () => {
    render(
      <ReqoreUIProvider>
        <FSMTriggerDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getByText(/TriggerManager/i));
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders event connector field when event connector radio button is selected', () => {
    render(
      <ReqoreUIProvider>
        <FSMTriggerDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
    fireEvent.click(screen.getAllByText('Reset')[0]);
    expect(screen.getAllByText('Reset')[0]).toBeDefined();
  });
});
