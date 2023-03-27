import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { render, screen } from '@testing-library/react';
import OrderDialog, {
  IOrderDialogProps,
} from '../../../../src/containers/InterfaceCreator/fsm/orderDialog';

describe('OrderDialog', () => {
  const onClose = jest.fn();
  const changeOrder = jest.fn();
  const onEditClick = jest.fn();
  const onDeleteClick = jest.fn();
  const onResetClick = jest.fn();
  const onSubmitClick = jest.fn();

  const defaultProps: IOrderDialogProps = {
    onClose,
    data: [],
    changeOrder,
    onEditClick,
    onDeleteClick,
    isDisabled: false,
    onResetClick,
    onSubmitClick,
    title: 'Test',
    metadata: (data) => <span>{data.name}</span>,
  };

  it('renders the component', () => {
    render(
      <ReqoreUIProvider>
        <OrderDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
  });

  it('renders with no transitions for the state', () => {
    render(
      <ReqoreUIProvider>
        <OrderDialog {...defaultProps} />
      </ReqoreUIProvider>
    );
    expect(screen.getByText('No transitions exist for this state')).toBeInTheDocument();
  });

  it('renders with data', () => {
    const data = [
      { keyId: '1', name: 'Transition 1' },
      { keyId: '2', name: 'Transition 2' },
    ];
    render(
      <ReqoreUIProvider>
        <OrderDialog {...defaultProps} data={data} />
      </ReqoreUIProvider>
    );
    const transition1Button = screen.getByText('Transition 1');
    expect(transition1Button).toBeInTheDocument();
  });
});
