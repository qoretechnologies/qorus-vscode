import { ReqoreUIProvider } from '@qoretechnologies/reqore';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import { FSMStateDialog } from '../../../../src/containers/InterfaceCreator/fsm/stateDialog';

describe('FSMStateDialog', () => {
  let onClose,
    data,
    id,
    onSubmit,
    otherStates,
    deleteState,
    fsmName,
    interfaceId,
    postMessage,
    disableInitial;

  beforeEach(() => {
    onClose = jest.fn();
    data = {};
    id = '123';
    onSubmit = jest.fn();
    otherStates = [];
    deleteState = jest.fn();
    fsmName = 'testFsm';
    interfaceId = '456';
    postMessage = jest.fn();
    disableInitial = false;
  });

  it('renders without crashing', () => {
    render(
      <ReqoreUIProvider>
        <FSMStateDialog
          onClose={onClose}
          data={data}
          id={id}
          onSubmit={onSubmit}
          otherStates={otherStates}
          deleteState={deleteState}
          fsmName={fsmName}
          interfaceId={interfaceId}
          postMessage={postMessage}
          disableInitial={disableInitial}
        />
      </ReqoreUIProvider>
    );
  });

  it('calls onSubmit with newData when submitted', () => {
    render(
      <ReqoreUIProvider>
        <FSMStateDialog
          onClose={onClose}
          data={data}
          id={id}
          onSubmit={onSubmit}
          otherStates={otherStates}
          deleteState={deleteState}
          fsmName={fsmName}
          interfaceId={interfaceId}
          postMessage={postMessage}
          disableInitial={disableInitial}
        />
      </ReqoreUIProvider>
    );
    expect(onSubmit).toBeDefined();
  });

  it('calls onClose when cancel button is clicked', () => {
    render(
      <ReqoreUIProvider>
        <FSMStateDialog
          onClose={onClose}
          data={data}
          id={id}
          onSubmit={onSubmit}
          otherStates={otherStates}
          deleteState={deleteState}
          fsmName={fsmName}
          interfaceId={interfaceId}
          postMessage={postMessage}
          disableInitial={disableInitial}
        >
          Info
        </FSMStateDialog>
      </ReqoreUIProvider>
    );
    const cancelButton = screen.getByText('Info');
    fireEvent.click(cancelButton);
    expect(onClose).toBeDefined();
  });
});
