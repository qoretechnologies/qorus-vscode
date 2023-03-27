import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
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
    render(<ReqoreUIProvider><OrderDialog {...defaultProps} /></ReqoreUIProvider>);
  });

  it('renders with no transitions for the state', () => {
    render(<ReqoreUIProvider><OrderDialog {...defaultProps} /></ReqoreUIProvider>);
    expect(screen.getByText('No transitions exist for this state')).toBeInTheDocument();
  });

  it('renders with data', () => {
    const data = [
      { keyId: '1', name: 'Transition 1' },
      { keyId: '2', name: 'Transition 2' },
    ];
    render(<ReqoreUIProvider><OrderDialog {...defaultProps} data={data} /></ReqoreUIProvider>);
    const transition1Button = screen.getByText('Transition 1');
    expect(transition1Button).toBeInTheDocument();
  });
  /*
  it('calls onClose when the dialog is closed', () => {
    render(<ReqoreUIProvider><OrderDialog {...defaultProps} /></ReqoreUIProvider>);
    fireEvent.click(screen.getByLabelText('Close'));
    expect(onClose).toHaveBeenCalled();
  });

  it('calls onSubmitClick when the submit button is clicked', () => {
    render(<ReqoreUIProvider><OrderDialog {...defaultProps} /></ReqoreUIProvider>);
    fireEvent.click(screen.getByLabelText('Submit'));
    expect(onSubmitClick).toHaveBeenCalled();
  });
  
  it('calls onEditClick when the edit button is clicked', () => {
    const data = [{ keyId: '1', name: 'Transition 1' }];
    render(<OrderDialog {...defaultProps} data={data} />);
    fireEvent.click(screen.getByLabelText('Edit'));
    expect(onEditClick).toHaveBeenCalledWith('1');
  });

  it('calls onDeleteClick when the delete button is clicked', () => {
    const data = [{ keyId: '1', name: 'Transition 1' }];
    const { getByLabelText } = render(<OrderDialog {...defaultProps} data={data} />);
    fireEvent.click(getByLabelText('Delete'));
    expect(onDeleteClick).toHaveBeenCalledWith('1');
  });

  it('calls changeOrder when the move up button is clicked', () => {
    const data = [
      { keyId: '1', name: 'Transition 1' },
      { keyId: '2', name: 'Transition 2' },
    ];
    render(<OrderDialog {...defaultProps} data={data} />);
    fireEvent.click(screen.getByLabelText('Move up'));
    expect(changeOrder).toHaveBeenCalledWith(1, 0);
  });*/
});


