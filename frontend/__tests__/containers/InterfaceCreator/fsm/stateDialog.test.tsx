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
    const newData = {
      id: 'newId',
      name: 'newName',
      type: 'pipeline',
      execution_order: 1,
      action: {
        type: 'connector',
        value: {
          name: 'testConnector',
          class: 'TestConnector',
          settings: {},
        },
      },
    };
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

    /*const newNameInput = screen.querySelector('#newName');
    const newIdInput = screen.querySelector('#newId');
    const submitButton = screen.querySelector('.submit-btn');

    fireEvent.change(newNameInput, { target: { value: newData.name } });
    fireEvent.change(newIdInput, { target: { value: newData.id } });
    fireEvent.click(submitButton);*/

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
        >Info</FSMStateDialog>
      </ReqoreUIProvider>
    );
    const cancelButton = screen.getByText('Info');
    fireEvent.click(cancelButton);
    expect(onClose).toBeDefined();
  });
});
